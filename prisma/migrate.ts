import execa from 'execa'

const args = process.argv.slice(2)
const migrateArgs = args.join(' ')

execa.command(`prisma migrate ${migrateArgs}`, {
  env: { ...process.env, DB_URL: process.env.MIGRATE_DB_URL },
  shell: true,
  stdio: 'inherit',
})
