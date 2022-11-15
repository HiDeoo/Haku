import { mergeRouters, router } from 'server'
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

export const appRouter = mergeRouters(
  router({
    admin: adminRouter,
    file: fileRouter,
    folder: folderRouter,
    image: imageRouter,
    import: importRouter,
    inbox: inboxRouter,
    note: noteRouter,
    todo: todoRouter,
  }),
  historyRouter,
  searchRouter
)

export type AppRouter = typeof appRouter
