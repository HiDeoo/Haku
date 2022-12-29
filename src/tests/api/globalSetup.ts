import { waitForPostgres } from '@jcoreio/wait-for-postgres'
import { loadEnvConfig } from '@next/env'
import compose from 'docker-compose'
import { execaCommand } from 'execa'

loadEnvConfig(process.cwd())

export async function setup() {
  await compose.upAll({ cwd: __dirname })

  await waitForPostgres({
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
    database: process.env.DB_USER,
    timeout: 5000,
  })

  await execaCommand('prisma migrate deploy', { env: { ...process.env, DB_URL: process.env.DB_URL } })
}

export async function teardown() {
  await compose.down({ cwd: __dirname })
}
