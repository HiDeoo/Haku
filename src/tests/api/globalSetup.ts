import { waitForPostgres } from '@jcoreio/wait-for-postgres'
import compose from 'docker-compose'
import execa from 'execa'

export default async function setup() {
  await compose.upAll({ cwd: __dirname })

  await waitForPostgres({
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
    database: process.env.DB_USER,
    timeout: 5000,
  })

  await execa.command('prisma migrate deploy', { env: { ...process.env, DB_URL: process.env.DB_URL } })
}
