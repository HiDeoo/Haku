import clsx from 'clsx'
import Link from 'next/link'
import { forwardRef } from 'react'

import ContextMenu from 'components/ContextMenu'
import Flex from 'components/Flex'
import Icon, { type IconProps } from 'components/Icon'

const nodeClasses = clsx(
  'px-3 py-1.5 text-zinc-400',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset'
)

const ContentTreeNode = forwardRef<HTMLDivElement | HTMLAnchorElement, React.PropsWithChildren<ContentTreeNodeProps>>(
  ({ children, href, icon, iconLabel, selected, style, text, ...props }, forwardedRef) => {
    const anchorClasses = href
      ? clsx('flex w-full items-center', nodeClasses, {
          'hover:bg-blue-600 hover:text-blue-50': !selected,
          'bg-zinc-700/60 !text-blue-50': selected,
        })
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
            <Flex alignItems="center">
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

export default ContentTreeNode

interface ContentTreeNodeProps {
  href?: string
  icon: IconProps['icon']
  iconLabel: IconProps['label']
  link?: boolean
  selected?: boolean
  style?: React.HtmlHTMLAttributes<HTMLElement>['style']
  text: string
}
