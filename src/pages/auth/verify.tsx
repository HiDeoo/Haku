import Callout from 'components/form/Callout'

const Email: Page = () => {
  return (
    <Callout intent="success" title="Check your inbox" message="A login link has been sent to your email address." />
  )
}

Email.sidebar = false

export default Email
