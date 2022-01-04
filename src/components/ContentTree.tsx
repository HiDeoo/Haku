import { Link as Roving, Root } from '@radix-ui/react-toolbar'
import { useRouter } from 'next/router'
import React, { useReducer } from 'react'
import { RiFileTextLine, RiFolderLine } from 'react-icons/ri'

import Button from 'components/Button'
import ContentTreeNode from 'components/ContentTreeNode'
import ContextMenu from 'components/ContextMenu'
import EditFolderModal from 'components/EditFolderModal'
import Flex from 'components/Flex'
import { type ControlledModalProps } from 'components/Modal'
import Shimmer from 'components/Shimmer'
import useContentTree from 'hooks/useContentTree'
import { type FolderData } from 'libs/db/folder'
import { type NoteData } from 'libs/db/note'
import { type TodoData } from 'libs/db/todo'
import { isTreeFolder, type TreeFolder } from 'libs/tree'
import useContentType, { type UseContentTypeReturnValue } from 'hooks/useContentType'

const depthOffset = '1.25rem'

const shimmerDepths = [0, 1, 2, 2, 3, 0, 1, 1, 1, 1, 2]

const initialContentTreeState: ContentTreeState = {
  editFolderModalOpened: false,
}

const ContentTree: React.FC<Props> = ({ setNewContentModalOpened }) => {
  const contentType = useContentType()

  if (!contentType.type) {
    throw new Error('Missing content type to render the content tree.')
  }

  const [state, dispatch] = useReducer(contentTreeReducer, initialContentTreeState)

  const { query } = useRouter()
  const { data, isLoading } = useContentTree()

  const selectedId = query.id && typeof query.id === 'string' ? parseInt(query.id, 10) : undefined

  function openNewContentModal() {
    setNewContentModalOpened(true)
  }

  function toggleEditFolderModal(opened: boolean) {
    dispatch({ type: ContentTreeActionType.ToggleEditFolderModal, opened })
  }

  if (isLoading) {
    return (
      <Shimmer>
        {shimmerDepths.map((depth, index) => (
          <ShimmerNode key={index} depth={depth} />
        ))}
      </Shimmer>
    )
  }

  return (
    <>
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
                <Folder key={key} dispatch={dispatch} folder={item} selectedId={selectedId} contentType={contentType} />
              ) : (
                <Content
                  key={key}
                  content={item}
                  dispatch={dispatch}
                  selectedId={selectedId}
                  contentType={contentType}
                />
              )
            })
          )}
        </Flex>
      </Root>
      <EditFolderModal opened={state.editFolderModalOpened} setOpened={toggleEditFolderModal} folder={state.folder} />
    </>
  )
}

export default ContentTree

function contentTreeReducer(state: ContentTreeState, { data, opened, type }: ContentTreeAction): ContentTreeState {
  switch (type) {
    case ContentTreeActionType.ToggleEditFolderModal: {
      return { ...state, editFolderModalOpened: opened, folder: data }
    }
    default: {
      return state
    }
  }
}

const ShimmerNode: React.FC<ShimmerNodeProps> = ({ depth }) => {
  return <Shimmer.Line style={getNodeStyle(depth, false)} />
}

const Folder: React.FC<FolderProps> = ({ contentType, depth = 1, dispatch, folder, selectedId, style }) => {
  function openEditModal() {
    dispatch({ type: ContentTreeActionType.ToggleEditFolderModal, opened: true, data: folder })
  }

  return (
    <>
      <Roving asChild>
        <ContentTreeNode style={style} text={folder.name} iconLabel="folder" icon={RiFolderLine}>
          <ContextMenu.Label text={`Folder: ${folder.name}`} />
          <ContextMenu.Separator />
          <ContextMenu.Item text="Edit" onClick={openEditModal} />
          <ContextMenu.Item intent="error" text="Delete" onClick={() => undefined} />
        </ContentTreeNode>
      </Roving>
      {folder.children.map((child) => (
        <Folder
          folder={child}
          depth={depth + 1}
          dispatch={dispatch}
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
          dispatch={dispatch}
          selectedId={selectedId}
          key={getNodeKey(content)}
          contentType={contentType}
        />
      ))}
    </>
  )
}

const Content: React.FC<ContentProps> = ({ content, contentType, depth = 0, selectedId }) => {
  return (
    <Roving asChild>
      <ContentTreeNode
        text={content.name}
        icon={RiFileTextLine}
        style={getNodeStyle(depth)}
        iconLabel={contentType.hrType}
        selected={selectedId === content.id}
        href={`/${contentType.hrType}s/${content.id}/${content.slug}`}
      />
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

interface Props {
  setNewContentModalOpened: ControlledModalProps['setOpened']
}

interface ContentTreeState {
  editFolderModalOpened: boolean
  folder?: FolderData
}

enum ContentTreeActionType {
  ToggleEditFolderModal,
}

type ContentTreeAction = {
  type: ContentTreeActionType.ToggleEditFolderModal
  data?: FolderData
  opened: boolean
}

interface ShimmerNodeProps {
  depth: number
}

interface NodeProps {
  contentType: UseContentTypeReturnValue
  depth?: number
  dispatch: React.Dispatch<ContentTreeAction>
  selectedId?: number
  style?: React.HtmlHTMLAttributes<HTMLElement>['style']
}

interface FolderProps extends NodeProps {
  folder: FolderType
}

interface ContentProps extends NodeProps {
  content: DataType
}

type DataType = NoteData | TodoData
type FolderType = TreeFolder<FolderData, DataType>
