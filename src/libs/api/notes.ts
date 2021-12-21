import { client } from 'libs/api'
import { type NoteTreeData } from 'libs/db/tree'

export async function getNoteTree() {
  return client.get('notes').json<NoteTreeData>()
}
