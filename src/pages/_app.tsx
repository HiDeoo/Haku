import 'styles/globals.css'

import { Provider as TooltipProvider } from '@radix-ui/react-tooltip'
import { SessionProvider } from 'next-auth/react'
import { type AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect } from 'react'
import { RiRefreshLine } from 'react-icons/ri'
import { QueryClient, QueryClientProvider } from 'react-query'

import ErrorBoundary from 'components/app/ErrorBoundary'
import Route from 'components/app/Route'
import Layout from 'components/ui/Layout'
import Toaster from 'components/ui/Toaster'
import useToast from 'hooks/useToast'
import { getQueryClientDefaultOptions } from 'libs/api/client'
import { registerServiceWorker } from 'libs/sw'

const queryClient = new QueryClient({ defaultOptions: getQueryClientDefaultOptions() })

function Haku({ Component, pageProps: { session, ...pageProps } }: AppPropsWithLayout) {
  const { addToast } = useToast()

  const sidebar = Component.sidebar ?? true

  useEffect(() => {
    function onLoad() {
      registerServiceWorker('/sw.js', (updateServiceWorker) => {
        addToast({
          action: updateServiceWorker,
          actionLabel: 'Refresh',
          duration: 86_400_000, // 1 day
          icon: RiRefreshLine,
          text: 'A new version of Haku is available.',
          type: 'background',
        })
      })
    }

    window.addEventListener('load', onLoad, { once: true })
  }, [addToast])

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
          <Toaster />
        </SessionProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default Haku

type AppPropsWithLayout = AppProps & {
  Component: Page
}
