import { type AppProps } from 'next/app'
import Head from 'next/head'
import { SessionProvider } from 'next-auth/react'
import { reset } from 'stitches-reset'

import { globalCss } from 'styles/stitches'
import Route from 'components/Route'

const unsecureRoutes = ['/auth/error', '/auth/login', '/auth/verify']

const globalStyles = globalCss(reset)

function Haku({ Component, pageProps: { session, ...pageProps }, router: { route } }: AppProps) {
  globalStyles()

  const isUnsecureRoute = unsecureRoutes.includes(route)

  return (
    <>
      <Head>
        <title>Haku</title>
      </Head>
      <SessionProvider session={session}>
        <Route secure={!isUnsecureRoute}>
          <Component {...pageProps} />
        </Route>
      </SessionProvider>
    </>
  )
}

export default Haku
