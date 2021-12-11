import { type NextPage } from 'next'
import { signOut } from 'next-auth/react'
import { useQuery } from 'react-query'

import useUser from 'hooks/useUser'
import styles from 'styles/Home.module.css'
import { getTest } from 'libs/api/test'

const Home: NextPage = () => {
  const user = useUser()

  const query = useQuery('todos', getTest)

  console.log('query ', query)

  function logout() {
    signOut({ callbackUrl: `/auth/login` })
  }

  return (
    <>
      <div className="bg-red-600">Hello2</div>
      <div className="bg-green-500">Hello2</div>
      <div className="bg-[#ff00ff]">Hello2</div>
      <div className={styles.test}>Hello2</div>
      <hr />
      {user && <div>{JSON.stringify(user)}</div>}
      <button onClick={logout}>Sign out</button>
    </>
  )
}

export default Home
