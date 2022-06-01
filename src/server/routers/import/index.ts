import { createRouter } from 'server'
import { importDynalistRouter } from 'server/routers/import/dynalist'

export const importRouter = createRouter().merge(importDynalistRouter)
