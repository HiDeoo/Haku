import { Link as Roving, Root } from '@radix-ui/react-toolbar'
import { useAtomValue, useSetAtom } from 'jotai/react'
import { RiFileTextLine, RiFolderLine } from 'react-icons/ri'

import { sidebarCollapsedAtom } from 'atoms/collapsible'
import { contentModalAtom, folderModalAtom, setContentModalOpenedAtom } from 'atoms/togglable'
import { ContentTreeNode } from 'components/content/ContentTreeNode'
import { Button } from 'components/form/Button'
import { ContextMenu } from 'components/ui/ContextMenu'
import { Flex, type FlexProps } from 'components/ui/Flex'
import { Shimmer } from 'components/ui/Shimmer'
import { CONTENT_TREE_SHIMMER_DEPTHS } from 'constants/shimmer'
import { useContentId } from 'hooks/useContentId'
import { useContentTreeQuery } from 'hooks/useContentTreeQuery'
import { useContentType, type UseContentTypeReturnValue } from 'hooks/useContentType'
import { useNetworkStatus } from 'hooks/useNetworkStatus'
import { isEmpty } from 'libs/array'
import { type FolderData } from 'libs/db/folder'
import { type NoteMetadata } from 'libs/db/note'
import { type TodoMetadata } from 'libs/db/todo'
import { isTreeFolder, type TreeFolder } from 'libs/tree'

const depthOffset = '1.25rem'

const supportsMaxCss = typeof window === 'object' && window.CSS.supports('padding', 'max(0px)')

const nisClasses = 'gap-6 p-3 text-center pl-[calc(theme(spacing.3)+max(0px,env(safe-area-inset-left)))]'

export const ContentTree = () => {
  const contentType = useContentType()

  if (!contentType.type) {
    throw new Error('Missing content type to render the content tree.')
  }

  const { offline } = useNetworkStatus()

  const sidebarCollapsed = useAtomValue(sidebarCollapsedAtom)

  const { contentId } = useContentId()
  const { data, isLoading } = useContentTreeQuery()
  const setContentModalOpened = useSetAtom(setContentModalOpenedAtom)

  function handleCreateClick() {
    setContentModalOpened(true)
  }

  if (sidebarCollapsed) {
    return null
  }

  if (isLoading) {
    return (
      <Shimmer>
        {CONTENT_TREE_SHIMMER_DEPTHS.map((shimmerDepth, index) => (
          <ShimmerNode key={index} depth={shimmerDepth} />
        ))}
      </Shimmer>
    )
  }

  return (
    <Root orientation="vertical" asChild role="navigation">
      <Flex as="nav" direction="col" flex className="relative overflow-y-auto" role="tree">
        <div className="pointer-events-none absolute inset-0 shadow-[inset_-1px_0_1px_0_theme(colors.black/40%)]" />
        {isEmpty(data) ? (
          <Flex fullWidth fullHeight direction="col" alignItems="center" justifyContent="center" className={nisClasses}>
            <span>Start by creating a new {contentType.lcType}.</span>
            <Button onPress={handleCreateClick} primary disabled={offline}>
              Create
            </Button>
          </Flex>
        ) : (
          data.map((item) => {
            const key = getNodeKey(item)

            return isTreeFolder(item) ? (
              <Folder
                key={key}
                folder={item}
                offline={offline}
                selectedId={contentId}
                style={getNodeStyle(0)}
                contentType={contentType}
              />
            ) : (
              <Content
                key={key}
                content={item}
                offline={offline}
                selectedId={contentId}
                style={getNodeStyle(0)}
                contentType={contentType}
              />
            )
          })
        )}
      </Flex>
    </Root>
  )
}

const ShimmerNode = ({ depth, ...props }: ShimmerNodeProps) => {
  return <Shimmer.Line style={getNodeStyle(depth, false)} {...props} />
}

const Folder = ({ contentType, depth = 1, folder, offline, selectedId, style }: FolderProps) => {
  const setFolderModal = useSetAtom(folderModalAtom)

  function handleEditClick() {
    setFolderModal({ opened: true, action: 'update', data: folder })
  }

  function handleDeleteClick() {
    setFolderModal({ opened: true, action: 'delete', data: folder })
  }

  return (
    <>
      <Roving asChild>
        <ContentTreeNode style={style} text={folder.name} iconLabel="folder" icon={RiFolderLine}>
          <ContextMenu.Label text={`Folder: ${folder.name}`} />
          <ContextMenu.Separator />
          <ContextMenu.Item text="Edit" onClick={handleEditClick} disabled={offline} />
          <ContextMenu.Item intent="error" text="Delete" onClick={handleDeleteClick} disabled={offline} />
        </ContentTreeNode>
      </Roving>
      {folder.children.map((child) => (
        <Folder
          folder={child}
          depth={depth + 1}
          offline={offline}
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
          offline={offline}
          selectedId={selectedId}
          key={getNodeKey(content)}
          contentType={contentType}
        />
      ))}
    </>
  )
}

const Content = ({ content, contentType, depth = 0, offline, selectedId }: ContentProps) => {
  const setContentModal = useSetAtom(contentModalAtom)

  function handleEditClick() {
    setContentModal({ opened: true, action: 'update', data: content })
  }

  function handleDeleteClick() {
    setContentModal({ opened: true, action: 'delete', data: content })
  }

  return (
    <Roving asChild>
      <ContentTreeNode
        text={content.name}
        icon={RiFileTextLine}
        style={getNodeStyle(depth)}
        iconLabel={contentType.lcType}
        selected={selectedId === content.id}
        href={`${contentType.urlPath}/${content.id}/${content.slug}`}
      >
        <ContextMenu.Label text={`${contentType.cType}: ${content.name}`} />
        <ContextMenu.Separator />
        <ContextMenu.Item text="Edit" onClick={handleEditClick} disabled={offline} />
        <ContextMenu.Item intent="error" text="Delete" onClick={handleDeleteClick} disabled={offline} />
      </ContentTreeNode>
    </Roving>
  )
}

function getNodeKey(item: FolderType | DataType): string {
  return `${isTreeFolder(item) ? 'folder' : 'content'}-${item.id}`
}

function getNodeStyle(depth: number, includeDefaultPadding = true): NonNullable<NodeProps['style']> {
  return {
    paddingLeft: `calc((${includeDefaultPadding ? '0.75rem + ' : ''}${depthOffset} * ${depth})${
      supportsMaxCss ? ' + max(0px, env(safe-area-inset-left))' : ''
    })`,
  }
}

interface ShimmerNodeProps {
  depth: number
}

interface NodeProps {
  contentType: UseContentTypeReturnValue
  depth?: number
  offline: boolean
  selectedId?: string
  style?: FlexProps<'a' | 'div'>['style']
}

interface FolderProps extends NodeProps {
  folder: FolderType
}

interface ContentProps extends NodeProps {
  content: DataType
}

type DataType = NoteMetadata | TodoMetadata
type FolderType = TreeFolder<FolderData, DataType>
