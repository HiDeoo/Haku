import { useRouter } from 'next/router'
import { useEffect } from 'react'

const Home: Page = () => {
  const { replace } = useRouter()

  useEffect(() => {
    replace('/notes', undefined, { shallow: true })
  }, [replace])

  return null
}

Home.sidebar = false

export default Home
