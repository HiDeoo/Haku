import { Root, Thumb } from '@radix-ui/react-switch'
import { useRouter } from 'next/router'
import { RiBookletLine, RiTodoLine } from 'react-icons/ri'

import Icon from 'components/ui/Icon'
import Tooltip from 'components/ui/Tooltip'
import useContentType, { ContentType, getContentType } from 'hooks/useContentType'
import clst from 'styles/clst'

const ContentTypeSwitch: React.FC = () => {
  const { push } = useRouter()
  const { type } = useContentType()

  const isBrowsingNotes = type === ContentType.NOTE

  const altContentType = getContentType(isBrowsingNotes ? ContentType.TODO : ContentType.NOTE)

  function onCheckedChange() {
    push(altContentType.urlPath)
  }

  const rootClasses = clst(
    'mr-4 px-1.5 rounded-md bg-zinc-700/40 border border-zinc-600/40 group',
    'focus:outline-none',
    'focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-zinc-800 focus-visible:ring-offset-2'
  )
  const nodeClasses = 'motion-safe:transition-[250ms] origin-center z-10'
  const leftNodeClasses = clst(nodeClasses, 'justify-self-start', {
    'translate-x-[150%] opacity-0': !isBrowsingNotes,
  })
  const rightNodeClasses = clst(nodeClasses, 'justify-self-end', {
    '-translate-x-[150%] opacity-0': isBrowsingNotes,
  })

  return (
    <>
      <Tooltip content={`Switch to ${altContentType.cType}s`}>
        <Root checked={isBrowsingNotes} onCheckedChange={onCheckedChange} className={rootClasses}>
          <Thumb asChild>
            <div className="relative grid grid-cols-2 gap-1.5">
              <Icon icon={RiBookletLine} className={leftNodeClasses} label="Notes" />
              <Icon icon={RiTodoLine} className={rightNodeClasses} label="Todos" />
              <div className="absolute grid grid-cols-2 gap-1.5 opacity-20 group-hover:text-blue-600 group-hover:opacity-100">
                <Icon icon={RiBookletLine} className="top-0 left-0" />
                <Icon icon={RiTodoLine} className="top-0 right-0" />
              </div>
            </div>
          </Thumb>
        </Root>
      </Tooltip>
      <div className="mr-1.5 border-l border-r border-l-zinc-600/30 border-r-black/25" />
    </>
  )
}

export default ContentTypeSwitch
