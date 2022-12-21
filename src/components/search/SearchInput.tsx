import { Root } from '@radix-ui/react-checkbox'
import { forwardRef } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import { RiBookletLine, RiInboxFill, RiTodoLine } from 'react-icons/ri'

import { type SearchDrawerData } from 'atoms/togglable'
import { TextInput, type TextInputProps } from 'components/form/TextInput'
import { Icon } from 'components/ui/Icon'
import { Tooltip } from 'components/ui/Tooltip'
import { SearchableContentType } from 'constants/contentType'
import { getContentType } from 'hooks/useContentType'
import { capitalize } from 'libs/string'
import { clst } from 'styles/clst'

export const SearchInput = forwardRef<HTMLInputElement, TextInputProps>((props, forwardedRef) => {
  return (
    <div className="relative w-full">
      <TextInput {...props} ref={forwardedRef} className="pr-[6.5rem]" />
      <div className="absolute top-0 right-0 flex h-full items-center">
        <SearchInputCheckbox contentType={SearchableContentType.NOTE} />
        <SearchInputCheckbox contentType={SearchableContentType.TODO} />
        <SearchInputCheckbox contentType={SearchableContentType.INBOX} />
      </div>
    </div>
  )
})

SearchInput.displayName = 'SearchInput'

const SearchInputCheckbox = ({ contentType }: SearchInputCheckboxProps) => {
  const { control, formState, getValues } = useFormContext<SearchDrawerData>()
  const {
    field: { onChange, value, ...fieldProps },
  } = useController({
    control,
    name: `types.${contentType}`,
    rules: {
      validate: () => {
        const { types } = getValues()

        return Object.values(types).includes(true) || 'at least 1 type must be selected'
      },
    },
  })
  const isChecked = value as boolean
  const isInvalid = formState.errors.types?.[contentType]?.message !== undefined

  const isInboxSearchResult = contentType === SearchableContentType.INBOX
  const cType =
    contentType === SearchableContentType.INBOX
      ? capitalize(SearchableContentType.INBOX)
      : getContentType(contentType).cType
  const icon = isInboxSearchResult
    ? RiInboxFill
    : contentType === SearchableContentType.NOTE
    ? RiBookletLine
    : RiTodoLine

  const chechboxClasses = clst(
    'mr-1 rounded bg-zinc-600 hover:bg-zinc-700/75 active:bg-zinc-800/50 p-1.5 focus:outline-none',
    'focus-visible:ring-2 focus-visible:ring-offset-zinc-800 focus-visible:ring-offset-2',
    isChecked && 'bg-zinc-800/50',
    isInvalid ? 'focus-visible:ring-red-400' : 'focus-visible:ring-blue-600'
  )

  return (
    <Tooltip content={`Search in ${cType}`}>
      <Root
        {...fieldProps}
        checked={isChecked}
        onCheckedChange={onChange}
        className={chechboxClasses}
        onKeyDown={handleSearchInputCheckboxKeyDown}
      >
        <Icon icon={icon} className="h-3.5 w-3.5" />
      </Root>
    </Tooltip>
  )
}

function handleSearchInputCheckboxKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
  if (event.key === 'Enter') {
    event.currentTarget.form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
  }
}

interface SearchInputCheckboxProps {
  contentType: SearchableContentType
}
