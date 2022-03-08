import { Html, Head, Main, NextScript } from 'next/document'

const Document: React.FC = () => {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#18181b" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/images/icons/180.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

export default Document
