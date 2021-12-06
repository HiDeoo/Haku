import { type AppProps } from 'next/app'
import Head from 'next/head'
import { reset } from 'stitches-reset'

import { globalCss } from 'styles/stitches'

const globalStyles = globalCss(reset)

function Haku({ Component, pageProps }: AppProps) {
  globalStyles()

  return (
    <>
      <Head>
        <title>Haku</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default Haku
