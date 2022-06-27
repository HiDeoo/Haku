import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { useContentType } from 'hooks/useContentType'

const Home: Page = () => {
  const { replace } = useRouter()
  const contentType = useContentType()

  useEffect(() => {
    replace(contentType.urlPath, undefined, { shallow: true })
  }, [replace, contentType])

  return null
}

Home.sidebar = false

export default Home
