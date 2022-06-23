import { Link as Roving, Root } from '@radix-ui/react-toolbar'
import { useAtom } from 'jotai'
import { useForm } from 'react-hook-form'
import { RiSearchLine } from 'react-icons/ri'

import { searchDrawerAtom } from 'atoms/togglable'
import IconButton from 'components/form/IconButton'
import TextInput from 'components/form/TextInput'
import SearchResult from 'components/search/SearchResult'
import Drawer from 'components/ui/Drawer'
import { SEARCH_QUERY_MIN_LENGTH } from 'constants/search'
import { isEmpty } from 'libs/array'
import { trpc } from 'libs/trpc'

const Search: React.FC<SearchProps> = ({ queryInputRef }) => {
  const [{ data: search }, setDrawer] = useAtom(searchDrawerAtom)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormFields>({ defaultValues: { query: search?.query ?? '' }, shouldUnregister: false })
  const queryInputValue = watch('query')

  const { data, fetchStatus, refetch } = trpc.useQuery(['search', { q: queryInputValue }], {
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

  const handleFormSubmit = handleSubmit((data) => {
    setDrawer((prevDrawer) => ({ ...prevDrawer, query: data.query }))

    refetch()
  })

  const isLoading = fetchStatus === 'fetching'

  const { ref: queryTextInput, ...queryTextInputProps } = register('query', {
    minLength: { message: `min. ${SEARCH_QUERY_MIN_LENGTH} characters`, value: SEARCH_QUERY_MIN_LENGTH },
    required: 'required',
    setValueAs: (value) => value.trim(),
  })

  return (
    <>
      <Drawer.Form onSubmit={handleFormSubmit} role="search">
        <TextInput
          autoFocus
          type="text"
          enterKeyHint="go"
          readOnly={isLoading}
          ref={setQueryInputRef}
          {...queryTextInputProps}
          aria-label="Search query"
          errorMessage={errors.query?.message}
          placeholder={`Search (min. ${SEARCH_QUERY_MIN_LENGTH} characters)`}
        />
        <IconButton
          primary
          type="submit"
          className="px-2"
          loading={isLoading}
          icon={RiSearchLine}
          disabled={isLoading}
        />
      </Drawer.Form>
      {data && isEmpty(data) && queryInputValue.length >= SEARCH_QUERY_MIN_LENGTH ? (
        !isLoading ? (
          <Drawer.Nis text="No matching results." />
        ) : null
      ) : (
        <Root orientation="vertical" asChild>
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

export default Search

interface SearchProps {
  queryInputRef?: React.ForwardedRef<HTMLInputElement>
}

type FormFields = {
  query: string
}
