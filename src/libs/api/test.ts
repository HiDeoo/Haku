import { client } from 'libs/api'

export async function getTest() {
  return client.get('test').json<{ id: string }>()
}
