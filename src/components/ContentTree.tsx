import { RiFileTextLine, RiFolderLine } from 'react-icons/ri'
import { Link as Roving, Root } from '@radix-ui/react-toolbar'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { forwardRef } from 'react'

import Button from 'components/Button'
import Flex from 'components/Flex'
import Icon, { type IconProps } from 'components/Icon'
import Shimmer from 'components/Shimmer'
import useContentTree from 'hooks/useContentTree'
import { type FolderData } from 'libs/db/folder'
import { type NoteData } from 'libs/db/note'
import { type TodoData } from 'libs/db/todo'
import { isTreeFolder, type TreeFolder } from 'libs/tree'
import useContentType, { type UseContentTypeReturnValue } from 'hooks/useContentType'

const treeDepthOffset = '1.25rem'

const nodeClasses = clsx(
  'px-3 py-1.5 text-zinc-400',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset'
)

const ContentTree: React.FC<Props> = ({ setNewContentModalOpened }) => {
  const contentType = useContentType()

  if (!contentType.type) {
    throw new Error('Missing content type to render the content tree.')
  }

  const { query } = useRouter()
  const { data, isLoading } = useContentTree()

  const selectedId = query.id && typeof query.id === 'string' ? parseInt(query.id, 10) : undefined

  function openNewContentModal() {
    setNewContentModalOpened(true)
  }

  if (isLoading) {
    return (
      <Shimmer>
        <ShimmerContentTreeNode depth={0} />
        <ShimmerContentTreeNode depth={1} />
        <ShimmerContentTreeNode depth={2} />
        <ShimmerContentTreeNode depth={2} />
        <ShimmerContentTreeNode depth={3} />
        <ShimmerContentTreeNode depth={0} />
        <ShimmerContentTreeNode depth={1} />
        <ShimmerContentTreeNode depth={1} />
        <ShimmerContentTreeNode depth={1} />
        <ShimmerContentTreeNode depth={1} />
        <ShimmerContentTreeNode depth={2} />
      </Shimmer>
    )
  }

  return (
    <Root orientation="vertical" asChild>
      <Flex as="nav" direction="col" flex className="overflow-y-auto relative">
        <div className="absolute inset-0 pointer-events-none shadow-[inset_-1px_0_1px_0_rgba(0,0,0,0.4)]" />
        {data?.length === 0 ? (
          <Flex
            fullWidth
            fullHeight
            direction="col"
            alignItems="center"
            justifyContent="center"
            className="text-center gap-6 p-3"
          >
            <span>Start by creating a new {contentType.hrType}.</span>
            <Button onPress={openNewContentModal} primary>
              Create
            </Button>
          </Flex>
        ) : (
          data?.map((item) => {
            const key = getNodeKey(item)

            return isTreeFolder(item) ? (
              <Folder key={key} folder={item} contentType={contentType} selectedId={selectedId} />
            ) : (
              <Content key={key} content={item} contentType={contentType} selectedId={selectedId} />
            )
          })
        )}
      </Flex>
    </Root>
  )
}

export default ContentTree

const Folder: React.FC<FolderProps> = ({ contentType, depth = 1, folder, selectedId, style }) => {
  return (
    <>
      <Roving asChild>
        <Flex alignItems="center" style={style} className={nodeClasses}>
          <ContentTreeNode text={folder.name} icon={RiFolderLine} iconLabel="folder" />
        </Flex>
      </Roving>
      {folder.children.map((child) => (
        <Folder
          folder={child}
          depth={depth + 1}
          selectedId={selectedId}
          key={getNodeKey(child)}
          contentType={contentType}
          style={getNodeStyle(depth)}
        />
      ))}
      {folder.items.map((content) => (
        <Content
          depth={depth}
          content={content}
          selectedId={selectedId}
          contentType={contentType}
          key={getNodeKey(content)}
        />
      ))}
    </>
  )
}

const Content: React.FC<ContentProps> = ({ content, contentType, depth = 0, selectedId }) => {
  return (
    <Roving asChild>
      <ContentLink
        style={getNodeStyle(depth)}
        href={`/${contentType.hrType}s/${content.id}`}
        selected={selectedId === content.id}
      >
        <ContentTreeNode text={content.name} icon={RiFileTextLine} iconLabel={contentType.hrType} />
      </ContentLink>
    </Roving>
  )
}

const ContentLink = forwardRef<HTMLAnchorElement, React.PropsWithChildren<ContentLinkProps>>(
  ({ children, href, selected, style, ...props }, ref) => {
    const anchorClasses = clsx('block', nodeClasses, {
      'hover:bg-blue-600 hover:text-blue-50': !selected,
      'bg-zinc-700/60 !text-blue-50': selected,
    })

    return (
      <Link href={href} prefetch={false}>
        <a ref={ref} {...props} style={style} className={anchorClasses} aria-current={selected ? 'page' : undefined}>
          <Flex alignItems="center">{children}</Flex>
        </a>
      </Link>
    )
  }
)

ContentLink.displayName = 'ContentLink'

const ContentTreeNode: React.FC<ContentTreeNodeProps> = ({ icon, iconLabel, text }) => {
  return (
    <>
      <Icon icon={icon} label={iconLabel} className="mr-1.5 shrink-0" />
      <span className="truncate">{text}</span>
    </>
  )
}

const ShimmerContentTreeNode: React.FC<ShimmerContentTreeNodeProps> = ({ depth }) => {
  return <Shimmer.Line style={getNodeStyle(depth, false)} />
}

function getNodeKey(item: FolderType | DataType): string {
  return `${isTreeFolder(item) ? 'folder' : 'content'}-${item.id}`
}

function getNodeStyle(
  depth: number,
  includeDefaultPadding = true
): NonNullable<React.HtmlHTMLAttributes<HTMLElement>['style']> {
  return { paddingLeft: `calc(${includeDefaultPadding ? '0.75rem + ' : ''}${treeDepthOffset} * ${depth})` }
}

interface Props {
  setNewContentModalOpened: (opened: boolean) => void
}

interface NodeProps {
  contentType: UseContentTypeReturnValue
  depth?: number
  selectedId?: number
  style?: React.HtmlHTMLAttributes<HTMLElement>['style']
}

interface FolderProps extends NodeProps {
  folder: FolderType
}

interface ContentProps extends NodeProps {
  content: DataType
}

interface ContentLinkProps {
  href: string
  selected: boolean
  style?: React.HtmlHTMLAttributes<HTMLElement>['style']
}

interface ContentTreeNodeProps {
  icon: IconProps['icon']
  iconLabel: IconProps['label']
  text: string
}

interface ShimmerContentTreeNodeProps {
  depth: number
}

type DataType = NoteData | TodoData
type FolderType = TreeFolder<FolderData, DataType>
