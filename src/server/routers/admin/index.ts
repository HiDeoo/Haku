import { router } from 'server'
import { adminEmailRouter } from 'server/routers/admin/email'

export const adminRouter = router({ email: adminEmailRouter })
