import compose from 'docker-compose'

export default async function teardown() {
  await compose.down({ cwd: __dirname })
}
