import { useMemo } from 'react'
import { type FieldPath, type Control, type FieldValues } from 'react-hook-form'

import { Combobox } from 'components/form/Combobox'
import { ROOT_FOLDER_ID } from 'constants/folder'
import { useContentTreeQuery } from 'hooks/useContentTreeQuery'
import { isNotEmpty } from 'libs/array'
import { type FolderData } from 'libs/db/folder'
import { type NoteMetadata } from 'libs/db/note'
import { isTreeFolder, type TreeFolder } from 'libs/tree'

const rootFolder: FolderWithPath = { id: ROOT_FOLDER_ID, name: '/', parentId: null, path: '' }

export const FolderPicker = <TFormFields extends FieldValues>({
  control,
  defaultFolderId,
  disabled,
  errorMessage,
  label,
  name,
}: FolderPickerProps<TFormFields>) => {
  const { data, isLoading } = useContentTreeQuery()

  const [folders, defaultItem]: [Folders, DefaultFolder] = useMemo(() => {
    if (!data) {
      return [[], undefined]
    }

    return getFolderList(
      [{ ...rootFolder, children: data.filter(isTreeFolder) as TreeFolders, items: [] }],
      defaultFolderId
    )
  }, [data, defaultFolderId])

  return (
    <Combobox
      name={name}
      items={folders}
      control={control}
      enterKeyHint="done"
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

function getFolderList(
  treeFolders: TreeFolders,
  defaultFolderId: FolderData['id'] | null | undefined,
  parentPath = ''
): [list: Folders, defaultItem: DefaultFolder] {
  const folders: Folders = []
  let defaultItem: DefaultFolder = undefined

  for (const { children, id, name, parentId } of treeFolders) {
    const folder = { id, name, parentId, path: parentPath + name }

    folders.push(folder)

    if (id === defaultFolderId) {
      defaultItem = folder
    }

    if (isNotEmpty(children)) {
      const [nestedFolders, nestedDefaultItem] = getFolderList(
        children,
        defaultFolderId,
        parentPath + name + (parentPath.length > 0 ? '/' : '')
      )

      folders.push(...nestedFolders)

      if (nestedDefaultItem) {
        defaultItem = nestedDefaultItem
      }
    }
  }

  return [folders, defaultItem]
}

interface FolderPickerProps<TFormFields extends FieldValues> {
  control: Control<TFormFields>
  defaultFolderId?: FolderData['id'] | null
  disabled?: boolean
  errorMessage?: string
  label?: string
  name: FieldPath<TFormFields>
}

type FolderWithPath = FolderData & { path: string }
type DefaultFolder = FolderWithPath | undefined
type Folders = FolderWithPath[]
type TreeFolders = TreeFolder<FolderData, NoteMetadata>[]
