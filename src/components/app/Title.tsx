import Head from 'next/head'

import { isPwa } from 'libs/html'

const Title: React.FC<TitleProps> = ({ pageTitle }) => {
  const title = isPwa() ? pageTitle ?? '' : `${pageTitle ? `${pageTitle} - ` : ''}Haku`

  return (
    <Head>
      <title>{title}</title>
    </Head>
  )
}

export default Title

interface TitleProps {
  pageTitle?: string
}
