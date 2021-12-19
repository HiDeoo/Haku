import { FolderType } from '@prisma/client'
import { z } from 'zod'

export { z } from 'zod'

export const zEmail = z.string().email()

export const zStringAsNumber = z
  .string()
  .refine((str) => {
    const num = Number(str)

    return Number.isFinite(num) && !Number.isNaN(num)
  })
  .transform(Number)

export const zFolderType = z.nativeEnum(FolderType)

export function zOneOf<T extends z.ZodRawShape>(objectSchema: z.ZodObject<T>) {
  const keys = Object.keys(objectSchema._def.shape())

  return objectSchema.partial().refine((data) => {
    const dataKeys = Object.keys(data)

    return keys.some((key) => dataKeys.indexOf(key) !== -1)
  })
}
