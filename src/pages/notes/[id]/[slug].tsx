import { useRouter } from 'next/router'

const Note: Page = () => {
  const { query } = useRouter()

  return (
    <>
      <div>note - {query.id}</div>
    </>
  )
}

export default Note
