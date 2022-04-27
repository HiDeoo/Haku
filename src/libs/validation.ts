import { FolderType, TodoNodeStatus } from '@prisma/client'
import { z } from 'zod'

export { z } from 'zod'

export const zEmail = z.string().email()

export const zFolderType = z.nativeEnum(FolderType)

export const zTodoNodeStatus = z.nativeEnum(TodoNodeStatus)

export const zQuerySchemaWithId = z.object({
  id: z.string().cuid(),
})

export function zAtLeastOneOf<TShape extends z.ZodRawShape>(objectSchema: z.ZodObject<TShape>) {
  const keys = Object.keys(objectSchema._def.shape())

  return objectSchema.partial().refine((data) => {
    const dataKeys = Object.keys(data)

    return keys.some((key) => dataKeys.indexOf(key) !== -1)
  })
}
