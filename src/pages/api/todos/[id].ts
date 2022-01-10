import { z, zStringAsNumber } from 'libs/validation'

const querySchema = z.object({
  id: zStringAsNumber,
})

export type RemoveTodoQuery = z.infer<typeof querySchema>
