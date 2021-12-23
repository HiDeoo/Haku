import 'styles/globals.css'

import { Provider as TooltipProvider } from '@radix-ui/react-tooltip'
import { type AppProps } from 'next/app'
import Head from 'next/head'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from 'react-query'

import Route from 'components/Route'
import Layout from 'components/Layout'

const queryClient = new QueryClient()

function Haku({ Component, pageProps: { session, ...pageProps } }: AppPropsWithLayout) {
  const sidebar = Component.sidebar ?? true

  return (
    <>
      <Head>
        <title>Haku</title>
      </Head>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
          <TooltipProvider>
            <Layout sidebar={sidebar}>
              <Route>
                <Component {...pageProps} />
              </Route>
            </Layout>
          </TooltipProvider>
        </SessionProvider>
      </QueryClientProvider>
    </>
  )
}

export default Haku

type AppPropsWithLayout = AppProps & {
  Component: Page
}
