import { Link as Roving, Root } from '@radix-ui/react-toolbar'
import Link from 'next/link'
import { forwardRef } from 'react'

import Flex from 'components/Flex'
import useContentTree from 'hooks/useContentTree'
import { type FolderData } from 'libs/db/folder'
import { type NoteData } from 'libs/db/note'
import { type TodoData } from 'libs/db/todo'
import { isTreeFolder, type TreeFolder } from 'libs/tree'
import useContentType, { type ContentType } from 'hooks/useContentType'

const ContentTree: React.FC = () => {
  const type = useContentType()

  if (!type) {
    throw new Error('Missing content type to render the content tree.')
  }

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

          return isTreeFolder(item) ? (
            <Folder key={key} folder={item} type={type} />
          ) : (
            <Content key={key} content={item} type={type} />
          )
        })}
      </Root>
    </Flex>
  )
}

export default ContentTree

const Folder: React.FC<FolderProps> = ({ folder, type }) => {
  return (
    <div>
      <Roving asChild>
        <div>FOLDER: {folder.name}</div>
      </Roving>
      <div style={{ paddingLeft: 20 }}>
        {folder.children.map((child) => (
          <Folder key={getKey(child)} folder={child} type={type} />
        ))}
        {folder.items.map((content) => (
          <Content key={getKey(content)} content={content} type={type} />
        ))}
      </div>
    </div>
  )
}

const Content: React.FC<ContentProps> = ({ content, type }) => {
  return (
    <Roving asChild>
      <ContentLink href={`/${type.toLowerCase()}s/${content.id}`}>FILE: {content.name}</ContentLink>
    </Roving>
  )
}

const ContentLink = forwardRef<HTMLAnchorElement, React.PropsWithChildren<ContentLinkProps>>(
  ({ children, href, ...props }, ref) => {
    return (
      <Link href={href} prefetch={false}>
        <a ref={ref} {...props}>
          {children}
        </a>
      </Link>
    )
  }
)

ContentLink.displayName = 'ContentLink'

function getKey(item: FolderType | DataType): string {
  return `${isTreeFolder(item) ? 'folder' : 'content'}-${item.id}`
}

interface FolderProps {
  folder: FolderType
  type: ContentType
}

interface ContentProps {
  content: DataType
  type: ContentType
}

interface ContentLinkProps {
  href: string
}

type DataType = NoteData | TodoData
type FolderType = TreeFolder<FolderData, DataType>
