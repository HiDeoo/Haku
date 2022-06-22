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

const SearchForm: React.FC = () => {
  const [{ query }, setDrawer] = useAtom(searchDrawerAtom)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormFields>({ defaultValues: { query }, shouldUnregister: false })
  const sanitizedQuery = watch('query').trim()

  const { data, fetchStatus, refetch } = trpc.useQuery(['search', { q: sanitizedQuery }], {
    enabled: false,
  })

  const handleFormSubmit = handleSubmit((data) => {
    setDrawer((prevDrawer) => ({ ...prevDrawer, query: data.query }))

    refetch()
  })

  const isLoading = fetchStatus === 'fetching'

  return (
    <>
      <Drawer.Form onSubmit={handleFormSubmit} role="search">
        <TextInput
          autoFocus
          type="text"
          enterKeyHint="go"
          readOnly={isLoading}
          aria-label="Search query"
          errorMessage={errors.query?.message}
          placeholder={`Search (min. ${SEARCH_QUERY_MIN_LENGTH} characters)`}
          {...register('query', {
            minLength: { message: `min. ${SEARCH_QUERY_MIN_LENGTH} characters`, value: SEARCH_QUERY_MIN_LENGTH },
            required: 'required',
          })}
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
      {data && isEmpty(data) && sanitizedQuery.length >= SEARCH_QUERY_MIN_LENGTH ? (
        !isLoading ? (
          <Drawer.Nis text="No matching results." />
        ) : null
      ) : (
        <Drawer.List>
          {data?.map((result) => (
            <SearchResult key={result.id} result={result} />
          ))}
        </Drawer.List>
      )}
    </>
  )
}

export default SearchForm

type FormFields = {
  query: string
}
