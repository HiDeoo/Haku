import { Link as Roving, Root } from '@radix-ui/react-toolbar'
import { useUpdateAtom } from 'jotai/utils'
import { RiFileTextLine, RiFolderLine } from 'react-icons/ri'

import { contentModalAtom, folderModalAtom, setContentModalOpenedAtom } from 'atoms/modal'
import Button from 'components/Button'
import ContentTreeNode from 'components/ContentTreeNode'
import ContextMenu from 'components/ContextMenu'
import Flex from 'components/Flex'
import Shimmer from 'components/Shimmer'
import { CONTENT_TREE_SHIMMER_DEPTHS } from 'constants/shimmer'
import useContentTree from 'hooks/useContentTree'
import { type FolderData } from 'libs/db/folder'
import { type NoteMetadata } from 'libs/db/note'
import { type TodoMetadata } from 'libs/db/todo'
import { isTreeFolder, type TreeFolder } from 'libs/tree'
import useContentType, { type UseContentTypeReturnValue } from 'hooks/useContentType'
import useContentId from 'hooks/useContentId'

const depthOffset = '1.25rem'

const ContentTree: React.FC = () => {
  const contentType = useContentType()

  if (!contentType.type) {
    throw new Error('Missing content type to render the content tree.')
  }

  const contentId = useContentId()
  const { data, isLoading } = useContentTree()
  const setContentModalOpened = useUpdateAtom(setContentModalOpenedAtom)

  function openNewContentModal() {
    setContentModalOpened(true)
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
    <Root orientation="vertical" asChild>
      <Flex as="nav" direction="col" flex className="relative overflow-y-auto">
        <div className="pointer-events-none absolute inset-0 shadow-[inset_-1px_0_1px_0_rgba(0,0,0,0.4)]" />
        {data?.length == 0 ? (
          <Flex
            fullWidth
            fullHeight
            direction="col"
            alignItems="center"
            justifyContent="center"
            className="gap-6 p-3 text-center"
          >
            <span>Start by creating a new {contentType.lcType}.</span>
            <Button onPress={openNewContentModal} primary>
              Create
            </Button>
          </Flex>
        ) : (
          data?.map((item) => {
            const key = getNodeKey(item)

            return isTreeFolder(item) ? (
              <Folder key={key} folder={item} selectedId={contentId} contentType={contentType} />
            ) : (
              <Content key={key} content={item} selectedId={contentId} contentType={contentType} />
            )
          })
        )}
      </Flex>
    </Root>
  )
}

export default ContentTree

const ShimmerNode: React.FC<ShimmerNodeProps> = ({ depth }) => {
  return <Shimmer.Line style={getNodeStyle(depth, false)} />
}

const Folder: React.FC<FolderProps> = ({ contentType, depth = 1, folder, selectedId, style }) => {
  const setFolderModal = useUpdateAtom(folderModalAtom)

  function openEditModal() {
    setFolderModal({ opened: true, action: 'update', data: folder })
  }

  function openDeleteModal() {
    setFolderModal({ opened: true, action: 'delete', data: folder })
  }

  return (
    <>
      <Roving asChild>
        <ContentTreeNode style={style} text={folder.name} iconLabel="folder" icon={RiFolderLine}>
          <ContextMenu.Label text={`Folder: ${folder.name}`} />
          <ContextMenu.Separator />
          <ContextMenu.Item text="Edit" onClick={openEditModal} />
          <ContextMenu.Item intent="error" text="Delete" onClick={openDeleteModal} />
        </ContentTreeNode>
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
          key={getNodeKey(content)}
          contentType={contentType}
        />
      ))}
    </>
  )
}

const Content: React.FC<ContentProps> = ({ content, contentType, depth = 0, selectedId }) => {
  const setContentModal = useUpdateAtom(contentModalAtom)

  function openEditModal() {
    setContentModal({ opened: true, action: 'update', data: content })
  }

  function openDeleteModal() {
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
        <ContextMenu.Item text="Edit" onClick={openEditModal} />
        <ContextMenu.Item intent="error" text="Delete" onClick={openDeleteModal} />
      </ContentTreeNode>
    </Roving>
  )
}

function getNodeKey(item: FolderType | DataType): string {
  return `${isTreeFolder(item) ? 'folder' : 'content'}-${item.id}`
}

function getNodeStyle(
  depth: number,
  includeDefaultPadding = true
): NonNullable<React.HtmlHTMLAttributes<HTMLElement>['style']> {
  return { paddingLeft: `calc(${includeDefaultPadding ? '0.75rem + ' : ''}${depthOffset} * ${depth})` }
}

interface ShimmerNodeProps {
  depth: number
}

interface NodeProps {
  contentType: UseContentTypeReturnValue
  depth?: number
  selectedId?: string
  style?: React.HtmlHTMLAttributes<HTMLElement>['style']
}

interface FolderProps extends NodeProps {
  folder: FolderType
}

interface ContentProps extends NodeProps {
  content: DataType
}

type DataType = NoteMetadata | TodoMetadata
type FolderType = TreeFolder<FolderData, DataType>
