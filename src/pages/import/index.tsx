import { useAtomValue } from 'jotai/react'
import Link from 'next/link'
import IconArrowRightSLine from '~icons/ri/arrow-right-s-line'

import { sidebarCollapsedAtom } from 'atoms/collapsible'
import { Icon } from 'components/ui/Icon'
import { List } from 'components/ui/List'
import { Safe } from 'components/ui/Safe'
import { clst } from 'styles/clst'

const sources = ['Dynalist']

const Import: Page = () => {
  const sidebarCollapsed = useAtomValue(sidebarCollapsedAtom)

  const iconClasses = clst('block shrink-0 opacity-75', !sidebarCollapsed && 'hidden xs:block')

  return (
    <Safe>
      <List title="Import from" className="w-full md:w-96">
        {sources.map((source) => (
          <List.Item key={source}>
            {(itemProps) => {
              const { className, ...props } = itemProps
              const linkCkasses = clst(className, 'hover:bg-blue-600 hover:text-zinc-100')

              return (
                <Link {...props} href={`/import/${source.toLowerCase()}`} prefetch={false} className={linkCkasses}>
                  <span className="grow truncate">{source}</span>
                  <Icon icon={IconArrowRightSLine} className={iconClasses} aria-hidden />
                </Link>
              )
            }}
          </List.Item>
        ))}
      </List>
    </Safe>
  )
}

Import.sidebar = true

export default Import
