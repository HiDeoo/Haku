import { z } from 'libs/validation'

const postBodySchema = z.object({
  name: z.string(),
  folderId: z.number().optional(),
})

export type AddTodoBody = z.infer<typeof postBodySchema>
