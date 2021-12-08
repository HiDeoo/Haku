import { type AppProps } from 'next/app'
import Head from 'next/head'
import { SessionProvider } from 'next-auth/react'
import { reset } from 'stitches-reset'

import { globalCss } from 'styles/stitches'

const globalStyles = globalCss(reset)

function Haku({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  globalStyles()

  return (
    <>
      <Head>
        <title>Haku</title>
      </Head>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </>
  )
}

export default Haku
