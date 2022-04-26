import 'styles/globals.css'

import { Provider as TooltipProvider } from '@radix-ui/react-tooltip'
import { SessionProvider } from 'next-auth/react'
import { type AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import { QueryClient, QueryClientProvider } from 'react-query'

import ErrorBoundary from 'components/app/ErrorBoundary'
import NetworkAgent from 'components/app/NetworkAgent'
import Route from 'components/app/Route'
import Title from 'components/app/Title'
import Layout from 'components/ui/Layout'
import usePwa from 'hooks/usePwa'
import { getQueryClientDefaultOptions } from 'libs/api/client'

const Toaster = dynamic(import('components/ui/Toaster'))

const queryClient = new QueryClient({ defaultOptions: getQueryClientDefaultOptions() })

function Haku({ Component, pageProps: { session, ...pageProps } }: AppPropsWithLayout) {
  usePwa()

  const sidebar = Component.sidebar ?? true

  return (
    <ErrorBoundary>
      <Title />
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
          <NetworkAgent />
        </SessionProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default Haku

type AppPropsWithLayout = AppProps & {
  Component: Page
}
