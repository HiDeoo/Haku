import { execaCommand } from 'execa'

const args = process.argv.slice(2)
const migrateArgs = args.join(' ')

execaCommand(`prisma migrate ${migrateArgs}`, {
  env: { ...process.env, DB_URL: process.env.MIGRATE_DB_URL },
  shell: true,
  stdio: 'inherit',
})
