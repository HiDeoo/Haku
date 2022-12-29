import { FolderType, TodoNodeStatus } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { fileTypeFromBuffer } from 'file-type'
import { z } from 'zod'

export { z } from 'zod'

export const zId = z.string().cuid()
export const zEmail = z.string().email()
export const zFolderType = z.nativeEnum(FolderType)
export const zTodoNodeStatus = z.nativeEnum(TodoNodeStatus)

export function zAtLeastOneOf<TShape extends z.ZodRawShape>(objectSchema: z.ZodObject<TShape>) {
  const keys = Object.keys(objectSchema._def.shape())

  return objectSchema.partial().refine((data) => {
    const dataKeys = Object.keys(data)

    return keys.some((key) => dataKeys.includes(key))
  })
}

export async function validateBase64Image(base64Image: string, maxFileSizeInBytes: number, supportedTypes: string[]) {
  const dataBuffer = Buffer.from(base64Image.slice(base64Image.indexOf(',') + 1), 'base64')

  if (dataBuffer.length > maxFileSizeInBytes) {
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }

  const fileType = await fileTypeFromBuffer(dataBuffer)

  if (!fileType || !supportedTypes.includes(fileType.mime)) {
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }
}
