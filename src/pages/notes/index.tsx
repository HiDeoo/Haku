import ContentHistory from 'components/content/ContentHistory'
import Safe from 'components/ui/Safe'
import { ContentType } from 'constants/contentType'

const Notes: Page = () => {
  return (
    <Safe>
      <ContentHistory focusedType={ContentType.NOTE} />
    </Safe>
  )
}

export default Notes
