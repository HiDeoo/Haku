import 'styles/globals.css'

import { Provider as TooltipProvider } from '@radix-ui/react-tooltip'
import { type AppProps } from 'next/app'
import Head from 'next/head'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from 'react-query'

import Route from 'components/Route'
import Layout from 'components/Layout'
import ErrorBoundary from 'components/ErrorBoundary'
import { getQueryClientDefaultOptions } from 'libs/api/client'

const queryClient = new QueryClient({ defaultOptions: getQueryClientDefaultOptions() })

function Haku({ Component, pageProps: { session, ...pageProps } }: AppPropsWithLayout) {
  const sidebar = Component.sidebar ?? true

  return (
    <ErrorBoundary>
      <Head>
        <title>Haku</title>
        <meta name="color-scheme" content="dark" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
          <TooltipProvider>
            <Route>
              <Layout sidebar={sidebar}>
                <Component {...pageProps} />
              </Layout>
            </Route>
          </TooltipProvider>
        </SessionProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default Haku

type AppPropsWithLayout = AppProps & {
  Component: Page
}
