import Head from 'next/head'

import { isPwa, isTouchScreen } from 'libs/html'

const Title: React.FC<TitleProps> = ({ pageTitle }) => {
  const isOnPwa = isPwa()
  const isOnDesktopPwa = isOnPwa && !isTouchScreen()

  const title = isOnPwa ? pageTitle ?? '' : `${pageTitle ? `${pageTitle} - ` : ''}Haku`

  return (
    <Head>
      <title>{title}</title>
      <meta name="theme-color" content={isOnDesktopPwa ? '#18181b' : '#27272a'} />
    </Head>
  )
}

export default Title

interface TitleProps {
  pageTitle?: string
}
