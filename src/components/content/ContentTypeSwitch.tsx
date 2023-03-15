import { Root, Thumb } from '@radix-ui/react-switch'
import { useAtomValue } from 'jotai/react'
import { useRouter } from 'next/router'
import IconBookletLine from '~icons/ri/booklet-line'
import IconTodoLine from '~icons/ri/todo-line'

import { sidebarCollapsedAtom } from 'atoms/collapsible'
import { Icon } from 'components/ui/Icon'
import { Tooltip } from 'components/ui/Tooltip'
import { ContentType, getContentType, useContentType } from 'hooks/useContentType'
import { clst } from 'styles/clst'

export const ContentTypeSwitch = () => {
  const { push } = useRouter()
  const { type } = useContentType()

  const sidebarCollapsed = useAtomValue(sidebarCollapsedAtom)

  const isBrowsingNotes = type === ContentType.NOTE

  const altContentType = getContentType(isBrowsingNotes ? ContentType.TODO : ContentType.NOTE)

  function handleCheckedChange() {
    push(altContentType.urlPath)
  }

  const rootClasses = clst(
    'px-1.5 rounded-md bg-zinc-700/40 border border-zinc-600/40 group',
    'focus:outline-none',
    'focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-zinc-800 focus-visible:ring-offset-2',
    sidebarCollapsed ? 'mx-0.5 mb-1.5 py-1.5 px-[0.3rem] w-7' : 'mr-1.5 px-1.5'
  )
  const gridClasses = clst('relative grid gap-1.5', sidebarCollapsed ? 'grid-rows-2' : 'grid-cols-2')
  const altGridClasses = clst(
    'absolute grid gap-1.5 opacity-20 group-hover:text-blue-600 group-hover:opacity-100',
    sidebarCollapsed ? 'grid-rows-2' : 'grid-cols-2'
  )
  const nodeClasses = 'motion-safe:transition-[250ms] origin-center z-10'
  const leftNodeClasses = clst(
    nodeClasses,
    'justify-self-start',
    !sidebarCollapsed && !isBrowsingNotes && 'translate-x-[150%] opacity-0',
    sidebarCollapsed && !isBrowsingNotes && 'translate-y-[150%] opacity-0'
  )
  const rightNodeClasses = clst(
    nodeClasses,
    'justify-self-end',
    !sidebarCollapsed && isBrowsingNotes && '-translate-x-[150%] opacity-0',
    sidebarCollapsed && isBrowsingNotes && '-translate-y-[150%] opacity-0'
  )

  return (
    <>
      <Tooltip content={`Switch to ${altContentType.cType}s`}>
        <Root checked={isBrowsingNotes} onCheckedChange={handleCheckedChange} className={rootClasses}>
          <Thumb asChild>
            <div className={gridClasses}>
              <Icon icon={IconBookletLine} className={leftNodeClasses} label="Notes" />
              <Icon icon={IconTodoLine} className={rightNodeClasses} label="Todos" />
              <div className={altGridClasses}>
                <Icon icon={IconBookletLine} className="top-0 left-0" />
                <Icon icon={IconTodoLine} className="top-0 right-0" />
              </div>
            </div>
          </Thumb>
        </Root>
      </Tooltip>
    </>
  )
}
