import { API_ERROR_UNKNOWN } from 'constants/error'
import { createRouter } from 'server'
import { adminRouter } from 'server/routers/admin'
import { fileRouter } from 'server/routers/file'
import { folderRouter } from 'server/routers/folder'
import { historyRouter } from 'server/routers/history'
import { imageRouter } from 'server/routers/image'
import { importRouter } from 'server/routers/import'
import { inboxRouter } from 'server/routers/inbox'
import { noteRouter } from 'server/routers/note'
import { searchRouter } from 'server/routers/search'
import { todoRouter } from 'server/routers/todo'

export const appRouter = createRouter()
  .formatError(({ shape, error }) => ({
    ...shape,
    data: {},
    message: error.code === 'INTERNAL_SERVER_ERROR' ? API_ERROR_UNKNOWN : error.message,
  }))
  .merge('admin.', adminRouter)
  .merge('file.', fileRouter)
  .merge('folder.', folderRouter)
  .merge('image.', imageRouter)
  .merge('import.', importRouter)
  .merge('inbox.', inboxRouter)
  .merge('note.', noteRouter)
  .merge('todo.', todoRouter)
  .merge(historyRouter)
  .merge(searchRouter)

export type AppRouter = typeof appRouter
