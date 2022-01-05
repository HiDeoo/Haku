import { z, zStringAsNumber } from 'libs/validation'

const deleteQuerySchema = z.object({
  id: zStringAsNumber,
})

export type RemoveTodoQuery = z.infer<typeof deleteQuerySchema>
