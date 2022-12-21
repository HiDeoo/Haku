import { isPwa } from 'libs/html'

export function openGitHubIssuePage() {
  window.open(process.env.NEXT_PUBLIC_BUGS_URL)
}

export async function openGitHubErrorReport(error: Error) {
  const {
    default: { UAParser },
  } = await import('ua-parser-js')

  const parser = new UAParser()
  const browser = parser.getBrowser()
  const os = parser.getOS()

  const params: [string, string][] = [
    ['browser_version', `${browser.name ?? 'unknown browser'} ${browser.version ?? 'unknown version'}`],
    ['error', encodeURIComponent(error.stack ?? '')],
    ['haku_environment', isPwa() ? 'PWA' : 'Browser'],
    ['haku_version', process.env.NEXT_PUBLIC_VERSION],
    ['os_version', `${os.name ?? 'unknown os'} ${os.version ?? 'unknown version'}`],
    ['template', '2_automated_bug_report.yml'],
  ]

  window.open(`${process.env.NEXT_PUBLIC_BUGS_URL}/new?${params.map((paramTuple) => paramTuple.join('=')).join('&')}`)
}
