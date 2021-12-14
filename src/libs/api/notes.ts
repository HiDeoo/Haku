import { client } from 'libs/api'
import { type NoteTree } from 'libs/db/tree'

export async function getNoteTree() {
  return client.get('notes').json<NoteTree>()
}
