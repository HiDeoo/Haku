import { ContentHistory } from 'components/content/ContentHistory'
import { Safe } from 'components/ui/Safe'
import { ContentType } from 'constants/contentType'

const Todos: Page = () => {
  return (
    <Safe>
      <ContentHistory focusedType={ContentType.TODO} />
    </Safe>
  )
}

export default Todos
