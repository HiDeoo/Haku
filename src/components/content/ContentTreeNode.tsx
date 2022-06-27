import Link from 'next/link'
import { forwardRef } from 'react'

import { ContextMenu } from 'components/ui/ContextMenu'
import { Flex } from 'components/ui/Flex'
import { Icon, type IconProps } from 'components/ui/Icon'
import { clst } from 'styles/clst'

const nodeClasses = clst(
  'px-3 py-1.5 text-zinc-400',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset'
)

export const ContentTreeNode = forwardRef<HTMLDivElement | HTMLAnchorElement, ContentTreeNodeProps>(
  ({ children, href, icon, iconLabel, selected, style, text, ...props }, forwardedRef) => {
    const anchorClasses = href
      ? clst(
          'flex w-full items-center',
          nodeClasses,
          selected ? 'bg-zinc-700/60 text-zinc-100' : 'hover:bg-blue-600 hover:text-zinc-100'
        )
      : undefined

    const content = (
      <>
        <Icon icon={icon} label={iconLabel} className="mr-1.5 shrink-0" />
        <span className="truncate">{text}</span>
      </>
    )

    return (
      <ContextMenu
        trigger={
          href ? (
            <Flex alignItems="center" role="treeitem">
              <Link href={href} prefetch={false}>
                <a
                  {...props}
                  style={style}
                  className={anchorClasses}
                  aria-current={selected ? 'page' : undefined}
                  ref={forwardedRef as React.ForwardedRef<HTMLAnchorElement>}
                >
                  {content}
                </a>
              </Link>
            </Flex>
          ) : (
            <Flex
              {...props}
              role="group"
              style={style}
              alignItems="center"
              className={nodeClasses}
              ref={forwardedRef as React.ForwardedRef<HTMLDivElement>}
            >
              {content}
            </Flex>
          )
        }
      >
        {children}
      </ContextMenu>
    )
  }
)

ContentTreeNode.displayName = 'ContentTreeNode'

interface ContentTreeNodeProps {
  children: React.ReactNode
  href?: string
  icon: IconProps['icon']
  iconLabel: IconProps['label']
  link?: boolean
  selected?: boolean
  style?: React.HtmlHTMLAttributes<HTMLElement>['style']
  text: string
}
