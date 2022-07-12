import Link from 'next/link'
import { forwardRef } from 'react'

import { ContextMenu } from 'components/ui/ContextMenu'
import { Flex, type FlexProps } from 'components/ui/Flex'
import { Icon, type IconProps } from 'components/ui/Icon'
import { clst } from 'styles/clst'

const nodeClasses = clst(
  'px-3 py-1.5 text-zinc-400',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset'
)

export const ContentTreeNode = forwardRef(
  (
    { children, href, icon, iconLabel, selected, style, text, ...props }: ContentTreeNodeProps,
    forwardedRef: AnchorOrDivRef
  ) => {
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

    const hrefAndRef = { href, ref: forwardedRef }

    return (
      <ContextMenu
        trigger={
          isContent(hrefAndRef) ? (
            <Flex alignItems="center" role="treeitem">
              <Link
                {...props}
                style={style}
                prefetch={false}
                ref={hrefAndRef.ref}
                href={hrefAndRef.href}
                className={anchorClasses}
                aria-current={selected ? 'page' : undefined}
              >
                {content}
              </Link>
            </Flex>
          ) : isFolder(hrefAndRef) ? (
            <Flex
              {...props}
              role="group"
              style={style}
              alignItems="center"
              ref={hrefAndRef.ref}
              className={nodeClasses}
            >
              {content}
            </Flex>
          ) : null
        }
      >
        {children}
      </ContextMenu>
    )
  }
)

ContentTreeNode.displayName = 'ContentTreeNode'

function isContent(hrefAndRef: HrefAndRef): hrefAndRef is { href: string; ref: React.ForwardedRef<HTMLAnchorElement> } {
  return typeof hrefAndRef.href === 'string'
}

function isFolder(hrefAndRef: HrefAndRef): hrefAndRef is { ref: React.ForwardedRef<HTMLDivElement> } {
  return typeof hrefAndRef.href === 'undefined'
}

interface ContentTreeNodeProps {
  children: React.ReactNode
  href?: string
  icon: IconProps['icon']
  iconLabel: IconProps['label']
  link?: boolean
  selected?: boolean
  style?: FlexProps<'a' | 'div'>['style']
  text: string
}

interface HrefAndRef {
  href?: string
  ref: AnchorOrDivRef
}

type AnchorOrDivRef = React.ForwardedRef<HTMLAnchorElement> | React.ForwardedRef<HTMLDivElement>
