import 'styles/globals.css'

import { type AppProps } from 'next/app'
import Head from 'next/head'
import { SessionProvider } from 'next-auth/react'

import Route from 'components/Route'

const unsecureRoutes = ['/auth/error', '/auth/login', '/auth/verify']

function Haku({ Component, pageProps: { session, ...pageProps }, router: { route } }: AppProps) {
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
