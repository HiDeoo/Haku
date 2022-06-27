import 'styles/globals.css'

import { Provider as TooltipProvider } from '@radix-ui/react-tooltip'
import { withTRPC } from '@trpc/next'
import { SessionProvider } from 'next-auth/react'
import { type AppProps } from 'next/app'
import dynamic from 'next/dynamic'

import { ErrorBoundary } from 'components/app/ErrorBoundary'
import { NetworkAgent } from 'components/app/NetworkAgent'
import { Route } from 'components/app/Route'
import { Title } from 'components/app/Title'
import { Layout } from 'components/ui/Layout'
import { type ToasterProps } from 'components/ui/Toaster'
import { useFileHistory } from 'hooks/useFileHistory'
import { usePwa } from 'hooks/usePwa'
import { getTRPCConfiguration } from 'libs/trpc'
import { type AppRouter } from 'server/routers'

const Toaster = dynamic<ToasterProps>(import('components/ui/Toaster').then((module) => module.Toaster))

function Haku({ Component, pageProps: { session, ...pageProps } }: AppPropsWithLayout) {
  usePwa()
  useFileHistory()

  const sidebar = Component.sidebar ?? true

  return (
    <ErrorBoundary>
      <Title />
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
    </ErrorBoundary>
  )
}

export default withTRPC<AppRouter>(getTRPCConfiguration())(Haku)

type AppPropsWithLayout = AppProps & {
  Component: Page
}
