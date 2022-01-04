import { useMemo } from 'react'
import { FieldPath, type Control, type FieldValues } from 'react-hook-form'

import Combobox from 'components/Combobox'
import { type FolderData } from 'libs/db/folder'
import useContentTree from 'hooks/useContentTree'
import { isTreeFolder, type TreeFolder } from 'libs/tree'
import { NoteData } from 'libs/db/note'

export const ROOT_FOLDER_ID = -1

const rootFolder: FolderWithPath = { id: ROOT_FOLDER_ID, name: '/', parentId: null, path: '' }

const FolderPicker = <FormFields extends FieldValues>({
  control,
  disabled,
  errorMessage,
  label,
  name,
}: FolderPickerProps<FormFields>) => {
  const { data, isLoading } = useContentTree()

  const folders: Folders = useMemo(() => {
    if (!data) {
      return []
    }

    return getFolderList([{ ...rootFolder, children: data.filter(isTreeFolder), items: [] }])
  }, [data])

  return (
    <Combobox
      name={name}
      items={folders}
      control={control}
      loading={isLoading}
      disabled={disabled}
      defaultItem={folders[0]}
      label={label ?? 'Folder'}
      errorMessage={errorMessage}
      itemToString={(item) => item?.name ?? ''}
      itemToMenuItem={(item) => item?.path ?? ''}
    />
  )
}

export default FolderPicker

function getFolderList(treeFolders: TreeFolders, parentPath = ''): Folders {
  const folders: Folders = []

  treeFolders.forEach(({ children, id, name, parentId }) => {
    folders.push({ id, name, parentId, path: `${parentPath}${name}` })

    if (children.length > 0) {
      folders.push(...getFolderList(children, `${parentPath}${name}${parentPath.length > 0 ? '/' : ''}`))
    }
  })

  return folders
}

interface FolderPickerProps<FormFields extends FieldValues> {
  control: Control<FormFields>
  disabled?: boolean
  errorMessage?: string
  label?: string
  name: FieldPath<FormFields>
}

type FolderWithPath = FolderData & { path: string }
type Folders = FolderWithPath[]
type TreeFolders = TreeFolder<FolderData, NoteData>[]
