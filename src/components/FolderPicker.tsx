import { useMemo } from 'react'
import { FieldPath, type Control, type FieldValues } from 'react-hook-form'

import Combobox from 'components/Combobox'
import { type FolderData } from 'libs/db/folder'
import useContentTree from 'hooks/useContentTree'
import { isTreeFolder, type TreeFolder } from 'libs/tree'
import { NoteMetaData } from 'libs/db/note'

export const ROOT_FOLDER_ID = -1

const rootFolder: FolderWithPath = { id: ROOT_FOLDER_ID, name: '/', parentId: null, path: '' }

const FolderPicker = <FormFields extends FieldValues>({
  control,
  defaultFolderId,
  disabled,
  errorMessage,
  label,
  name,
}: FolderPickerProps<FormFields>) => {
  const { data, isLoading } = useContentTree()

  const [folders, defaultItem]: [Folders, DefaultFolder] = useMemo(() => {
    if (!data) {
      return [[], undefined]
    }

    return getFolderList([{ ...rootFolder, children: data.filter(isTreeFolder), items: [] }], defaultFolderId)
  }, [data, defaultFolderId])

  return (
    <Combobox
      name={name}
      items={folders}
      control={control}
      loading={isLoading}
      disabled={disabled}
      label={label ?? 'Folder'}
      errorMessage={errorMessage}
      defaultItem={defaultItem ?? folders[0]}
      itemToString={(item) => item?.name ?? ''}
      itemToMenuItem={(item) => item?.path ?? ''}
    />
  )
}

export default FolderPicker

function getFolderList(
  treeFolders: TreeFolders,
  defaultFolderId: FolderData['id'] | null | undefined,
  parentPath = ''
): [list: Folders, defaultItem: DefaultFolder] {
  const folders: Folders = []
  let defaultItem: DefaultFolder = undefined

  treeFolders.forEach(({ children, id, name, parentId }) => {
    const folder = { id, name, parentId, path: `${parentPath}${name}` }

    folders.push(folder)

    if (id === defaultFolderId) {
      defaultItem = folder
    }

    if (children.length > 0) {
      const [nestedFolders, nestedDefaultItem] = getFolderList(
        children,
        defaultFolderId,
        `${parentPath}${name}${parentPath.length > 0 ? '/' : ''}`
      )

      folders.push(...nestedFolders)

      if (nestedDefaultItem) {
        defaultItem = nestedDefaultItem
      }
    }
  })

  return [folders, defaultItem]
}

interface FolderPickerProps<FormFields extends FieldValues> {
  control: Control<FormFields>
  defaultFolderId?: FolderData['id'] | null
  disabled?: boolean
  errorMessage?: string
  label?: string
  name: FieldPath<FormFields>
}

type FolderWithPath = FolderData & { path: string }
type DefaultFolder = FolderWithPath | undefined
type Folders = FolderWithPath[]
type TreeFolders = TreeFolder<FolderData, NoteMetaData>[]
