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
