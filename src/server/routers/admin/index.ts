import { createRouter } from 'server'
import { withAdmin } from 'server/middlewares/withAdmin'
import { adminEmailRouter } from 'server/routers/admin/email'

export const adminRouter = createRouter().middleware(withAdmin).merge('email.', adminEmailRouter)
