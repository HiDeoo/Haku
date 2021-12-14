import { client } from 'libs/api'
import { type NoteTree } from 'libs/db/notes'

export async function getNoteTree() {
  return client.get('notes').json<NoteTree>()
}
