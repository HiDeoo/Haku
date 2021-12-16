import compose from 'docker-compose'

async function teardown() {
  await compose.down({ cwd: __dirname })
}

export default teardown
