import { type NextPage } from 'next'

import { styled } from 'styles/stitches'

const Text = styled('div', {
  backgroundColor: '$blue10',
  variants: {
    testeroni: {
      true: {
        backgroundColor: '$slate1',
      },
    },
  },
})

const Home: NextPage = () => {
  return (
    <>
      <Text>Hello2</Text>
      <Text testeroni>Hello2</Text>
    </>
  )
}

export default Home
