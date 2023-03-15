import IconCloudOffLine from '~icons/ri/cloud-off-line'

import { Callout } from 'components/form/Callout'
import { Flex } from 'components/ui/Flex'
import { useContentType } from 'hooks/useContentType'

export const Offline = () => {
  const { lcType } = useContentType()

  return (
    <Flex fullWidth fullHeight alignItems="center" justifyContent="center" direction="col" className="mx-4">
      <Callout
        intent="neutral"
        iconLabel="Offline"
        icon={IconCloudOffLine}
        title="You are disconnected"
        message={
          <>
            This {lcType} is not yet available offline.
            <br />
            Visit this {lcType} while online to make it available offline.
          </>
        }
      />
    </Flex>
  )
}
