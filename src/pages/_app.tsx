import 'styles/globals.css'

import { type AppProps } from 'next/app'
import Head from 'next/head'

function Haku({ Component, pageProps }: AppProps) {
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
