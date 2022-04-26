import { isPwa } from 'libs/html'

export function openGitHubIssuePage() {
  window.open(process.env.NEXT_PUBLIC_BUGS_URL)
}

export async function openGitHubErrorReport(error: Error) {
  const parser = new (await import('ua-parser-js')).default.UAParser()
  const browser = parser.getBrowser()
  const os = parser.getOS()

  const params: [string, string][] = [
    ['browser_version', `${browser.name} ${browser.version}`],
    ['error', encodeURIComponent(error.stack ?? '')],
    ['haku_environment', isPwa() ? 'PWA' : 'Browser'],
    ['haku_version', process.env.NEXT_PUBLIC_VERSION],
    ['os_version', `${os.name} ${os.version}`],
    ['template', '2_automated_bug_report.yml'],
  ]

  window.open(`${process.env.NEXT_PUBLIC_BUGS_URL}/new?${params.map((paramTuple) => paramTuple.join('=')).join('&')}`)
}
