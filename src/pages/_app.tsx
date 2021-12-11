import 'styles/globals.css'

import { type AppProps } from 'next/app'
import Head from 'next/head'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from 'react-query'

import Route from 'components/Route'

const unsecureRoutes = ['/auth/error', '/auth/login', '/auth/verify']

const queryClient = new QueryClient()

function Haku({ Component, pageProps: { session, ...pageProps }, router: { route } }: AppProps) {
  const isUnsecureRoute = unsecureRoutes.includes(route)

  return (
    <>
      <Head>
        <title>Haku</title>
      </Head>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
          <Route secure={!isUnsecureRoute}>
            <Component {...pageProps} />
          </Route>
        </SessionProvider>
      </QueryClientProvider>
    </>
  )
}

export default Haku
