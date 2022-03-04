import 'styles/globals.css'

import { Provider as TooltipProvider } from '@radix-ui/react-tooltip'
import { SessionProvider } from 'next-auth/react'
import { type AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

import ErrorBoundary from 'components/app/ErrorBoundary'
import Route from 'components/app/Route'
import Layout from 'components/ui/Layout'
import { getQueryClientDefaultOptions } from 'libs/api/client'
import { registerServiceWoerker } from 'libs/html'

const queryClient = new QueryClient({ defaultOptions: getQueryClientDefaultOptions() })

function Haku({ Component, pageProps: { session, ...pageProps } }: AppPropsWithLayout) {
  const sidebar = Component.sidebar ?? true

  useEffect(() => {
    function onLoad() {
      registerServiceWoerker('/sw.js')
    }

    window.addEventListener('load', onLoad, { once: true })
  }, [])

  return (
    <ErrorBoundary>
      <Head>
        <title>Haku</title>
        <meta name="color-scheme" content="dark" />
        <link rel="manifest" href="/manifest.json"></link>
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
