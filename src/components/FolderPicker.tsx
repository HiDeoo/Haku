import { FieldPath, type Control, type FieldValues } from 'react-hook-form'

import Combobox from 'components/Combobox'
import { type FolderData } from 'libs/db/folder'
import useTree from 'hooks/useTree'

export const ROOT_FOLDER_ID = -1

const rootFolder: FolderData = { id: ROOT_FOLDER_ID, parentId: null, name: '/' }

const FolderPicker = <FormFields extends FieldValues>({ control, errorMessage, label, name }: Props<FormFields>) => {
  // TODO(HiDeoo)
  useTree()

  return (
    <Combobox
      name={name}
      control={control}
      items={[rootFolder]}
      defaultItem={rootFolder}
      label={label ?? 'Folder'}
      errorMessage={errorMessage}
      itemToString={(item) => item?.name ?? ''}
    />
  )
}

export default FolderPicker

interface Props<FormFields extends FieldValues> {
  control: Control<FormFields>
  errorMessage?: string
  label?: string
  name: FieldPath<FormFields>
}
