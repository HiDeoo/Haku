import path from 'path'
import { fileURLToPath } from 'url'

import { type Browser, chromium, BrowserContext } from 'playwright'

const appUrl = 'http://localhost:3000'

const pagesToScreenshot: PageToScreenshot[] = [
  { name: 'home', selectorsToClick: { narrow: ['[aria-label="Collapse Menu"]'] } },
  {
    name: 'note',
    scrollSelectorToTop: ['[contenteditable=true]', 40],
    selector: 'Beef Bourguignon',
    selectorsToClick: { narrow: ['[aria-label="Collapse Inspector"]'], wide: ['[aria-label="Expand Inspector"]'] },
    waitForImages: true,
  },
  { focusElementWithText: 'Add periodic update detection mechanism', name: 'todo', selector: 'haku' },
]

const sizesToScreenshot: SizeToScreenshot[] = [
  { name: 'wide', width: 1280, height: 800 },
  { name: 'narrow', width: 390, height: 844 },
]

async function screenshot() {
  try {
    console.info(
      'When first asked, please paste a valid login code to start the process. You will only be prompted once.\n'
    )

    const browser = await login()

    await generateScreenshots(browser)

    await closeBrowser(browser)
  } catch (error) {
    if (error instanceof Error && error.message.includes('ERR_CONNECTION_REFUSED')) {
      console.error(`It looks like Haku is not running on '${appUrl}'. Please start it first with 'pnpm dev'.`)
    } else {
      console.error('Unable to take screenshots:', error)
    }

    process.exit(1)
  }
}

async function login(): Promise<BrowserWithStorageState> {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto(appUrl, { waitUntil: 'networkidle' })

  await page.bringToFront()

  await page.fill('"Email"', 'user1@example.com')
  await page.click('"Login"')

  await page.waitForSelector('id=magic-code-input-0')

  await page.mainFrame().waitForFunction(() => {
    const lastMagicCodeInput = document.querySelector<HTMLInputElement>('#magic-code-input-5')

    return lastMagicCodeInput && lastMagicCodeInput.value.length > 0
  })

  await Promise.all([page.waitForNavigation(), page.click('"Confirm"')])

  const storageState = await context.storageState()

  await context.close()

  return { browser, storageState }
}

async function generateScreenshots({ browser, storageState }: BrowserWithStorageState) {
  const context = await browser.newContext({ deviceScaleFactor: 1, storageState })

  let allPagesCached = false

  for (const sizeToScreenshot of sizesToScreenshot) {
    const page = await context.newPage()

    page.setViewportSize({ width: sizeToScreenshot.width, height: sizeToScreenshot.height })

    for (const pageToScreenshot of pagesToScreenshot) {
      await page.goto(appUrl)

      if (pageToScreenshot.selector) {
        await page.click(`"${pageToScreenshot.selector}"`)
      }

      if (!allPagesCached) {
        await page.waitForLoadState('networkidle')
      }

      if (pageToScreenshot.selectorsToClick) {
        const selectorsToClick = pageToScreenshot.selectorsToClick[sizeToScreenshot.name]

        if (selectorsToClick) {
          for (const selectorToClick of selectorsToClick) {
            await page.locator(selectorToClick).click()
          }

          // Wait for any potential animations to be done.
          await page.waitForTimeout(1000)
        }
      }

      if (pageToScreenshot.scrollSelectorToTop) {
        await page.locator(pageToScreenshot.scrollSelectorToTop[0]).evaluate((element, offset) => {
          element.parentElement?.scroll(0, offset)
        }, pageToScreenshot.scrollSelectorToTop[1])

        // Wait for the scrollbar to disappear.
        await page.waitForTimeout(1000)
      }

      if (pageToScreenshot.waitForImages) {
        await page.waitForFunction(() => {
          return [...document.images].every((image) => image.complete)
        })
      }

      if (pageToScreenshot.focusElementWithText) {
        await page.locator(`"${pageToScreenshot.focusElementWithText}"`).focus()
      }

      await page.screenshot({
        path: path.join(
          path.dirname(fileURLToPath(import.meta.url)),
          'public',
          'images',
          'screenshots',
          `${sizeToScreenshot.name}-${pageToScreenshot.name}.png`
        ),
      })
    }

    allPagesCached = true
  }
}

function closeBrowser({ browser }: BrowserWithStorageState) {
  return browser.close()
}

screenshot()

interface BrowserWithStorageState {
  browser: Browser
  storageState: Awaited<ReturnType<BrowserContext['storageState']>>
}

interface PageToScreenshot {
  focusElementWithText?: string
  name: string
  scrollSelectorToTop?: [selector: string, yOffset: number]
  // The selector to click on the homepage to navigate to the page to screenshot. If not provided, a screenshot of the
  // homepage will be taken.
  selector?: string
  // Selectors to click on the page to screenshot.
  selectorsToClick?: Record<string, string[]>
  waitForImages?: boolean
}

interface SizeToScreenshot {
  name: string
  height: number
  width: number
}
