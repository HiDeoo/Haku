import { Link, Root } from '@radix-ui/react-toolbar'

import Flex from 'components/Flex'
import useContentTree from 'hooks/useContentTree'
import { type FolderData } from 'libs/db/folder'
import { type NoteData } from 'libs/db/note'
import { type TodoData } from 'libs/db/todo'
import { isTreeFolder, type TreeFolder } from 'libs/tree'

const ContentTree: React.FC = () => {
  const { data, isLoading } = useContentTree()

  // TODO(HiDeoo)
  if (isLoading) {
    return <>Loading…</>
  }

  return (
    <Flex as="nav" flex className="overflow-y-auto">
      <Root orientation="vertical">
        {data?.map((item) => {
          const key = getKey(item)

          return isTreeFolder(item) ? <Folder key={key} folder={item} /> : <Content key={key} content={item} />
        })}
      </Root>
    </Flex>
  )
}

export default ContentTree

const Folder: React.FC<FolderProps> = ({ folder }) => {
  return (
    <div>
      <Link asChild>
        <div>FOLDER: {folder.name}</div>
      </Link>
      <div style={{ paddingLeft: 20 }}>
        {folder.children.map((child) => (
          <Folder key={getKey(child)} folder={child} />
        ))}
        {folder.items.map((content) => (
          <Content key={getKey(content)} content={content} />
        ))}
      </div>
    </div>
  )
}

const Content: React.FC<ContentProps> = ({ content }) => {
  return (
    <Link asChild>
      <div>FILE: {content.name}</div>
    </Link>
  )
}

function getKey(item: FolderType | ContentType): string {
  return `${isTreeFolder(item) ? 'folder' : 'content'}-${item.id}`
}

interface FolderProps {
  folder: FolderType
}

interface ContentProps {
  content: ContentType
}

type ContentType = NoteData | TodoData
type FolderType = TreeFolder<FolderData, ContentType>
