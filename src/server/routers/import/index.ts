import { mergeRouters } from 'server'
import { importDynalistRouter } from 'server/routers/import/dynalist'

export const importRouter = mergeRouters(importDynalistRouter)
