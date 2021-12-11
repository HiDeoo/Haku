import 'styles/globals.css'

import { type AppProps } from 'next/app'
import Head from 'next/head'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from 'react-query'

import Route from 'components/Route'

const queryClient = new QueryClient()

function Haku({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <>
      <Head>
        <title>Haku</title>
      </Head>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
          <Route>
            <Component {...pageProps} />
          </Route>
        </SessionProvider>
      </QueryClientProvider>
    </>
  )
}

export default Haku
