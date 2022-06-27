import { Link as Roving, Root } from '@radix-ui/react-toolbar'
import { type BaseEvent } from '@react-types/shared'
import { useAtom } from 'jotai'
import { useRef } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { RiSearchLine } from 'react-icons/ri'

import { searchDrawerAtom, type SearchDrawerData } from 'atoms/togglable'
import { IconButton } from 'components/form/IconButton'
import { SearchInput } from 'components/search/SearchInput'
import { SearchResult } from 'components/search/SearchResult'
import { Drawer } from 'components/ui/Drawer'
import { SEARCH_QUERY_MIN_LENGTH } from 'constants/search'
import { isEmpty } from 'libs/array'
import { trpc } from 'libs/trpc'

export const Search: React.FC<SearchProps> = ({ queryInputRef }) => {
  const resultsContainer = useRef<HTMLDivElement>(null)

  const [{ data: search }, setDrawer] = useAtom(searchDrawerAtom)

  const form = useForm<FormFields>({ defaultValues: search, shouldUnregister: false })
  const searchQueryData = form.watch()

  const { data, fetchStatus, refetch } = trpc.useQuery(['search', searchQueryData], {
    enabled: false,
  })

  function setQueryInputRef(ref: HTMLInputElement | null) {
    if (queryInputRef) {
      if (typeof queryInputRef === 'function') {
        queryInputRef(ref)
      } else {
        queryInputRef.current = ref
      }
    }

    queryTextInput(ref)
  }

  const handleFormSubmit = form.handleSubmit((data) => {
    setDrawer((prevDrawer) => ({ ...prevDrawer, data }))

    refetch()
  })

  function handleQueryKeyDown(event: BaseEvent<React.KeyboardEvent<HTMLInputElement>>) {
    event.continuePropagation()

    if (event.key !== 'ArrowDown' || !event.metaKey) {
      return
    }

    const firstResult = resultsContainer.current?.firstChild

    if (firstResult instanceof HTMLDivElement) {
      firstResult.focus()
    }
  }

  const isLoading = fetchStatus === 'fetching'

  const { ref: queryTextInput, ...queryTextInputProps } = form.register('q', {
    minLength: { message: `min. ${SEARCH_QUERY_MIN_LENGTH} characters`, value: SEARCH_QUERY_MIN_LENGTH },
    required: 'required',
    setValueAs: (value) => value.trim(),
  })

  return (
    <>
      <FormProvider {...form}>
        <Drawer.Form onSubmit={handleFormSubmit} role="search">
          <SearchInput
            autoFocus
            type="text"
            enterKeyHint="go"
            readOnly={isLoading}
            ref={setQueryInputRef}
            {...queryTextInputProps}
            aria-label="Search query"
            onKeyDown={handleQueryKeyDown}
            errorMessage={form.formState.errors.q?.message}
            placeholder={`Search (min. ${SEARCH_QUERY_MIN_LENGTH} characters)`}
          />
          <IconButton
            primary
            type="submit"
            className="px-2"
            tooltip="Search"
            loading={isLoading}
            icon={RiSearchLine}
            disabled={isLoading}
          />
        </Drawer.Form>
      </FormProvider>
      {data && isEmpty(data) && searchQueryData.q.length >= SEARCH_QUERY_MIN_LENGTH ? (
        !isLoading ? (
          <Drawer.Nis text="No matching results." />
        ) : null
      ) : (
        <Root orientation="vertical" asChild ref={resultsContainer} role="navigation">
          <Drawer.List>
            {data?.map((result) => (
              <Roving asChild key={result.id}>
                <SearchResult result={result} />
              </Roving>
            ))}
          </Drawer.List>
        </Root>
      )}
    </>
  )
}

export interface SearchProps {
  queryInputRef?: React.ForwardedRef<HTMLInputElement>
}

type FormFields = SearchDrawerData
