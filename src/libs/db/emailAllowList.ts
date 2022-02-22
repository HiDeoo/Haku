import { type EmailAllowList } from '@prisma/client'

import { API_ERROR_EMAIL_ALREADY_EXISTS, API_ERROR_EMAIL_DOES_NOT_EXISTS } from 'libs/api/routes/errors'
import { handleDbError, prisma } from 'libs/db'

export function getAllowedEmails(): Promise<EmailAllowList[]> {
  return prisma.emailAllowList.findMany()
}

export function getAllowedEmailByEmail(email: EmailAllowList['email']): Promise<EmailAllowList | null> {
  return prisma.emailAllowList.findUnique({ where: { email } })
}

export async function addAllowedEmail(email: EmailAllowList['email']): Promise<EmailAllowList> {
  try {
    return await prisma.emailAllowList.create({ data: { email } })
  } catch (error) {
    handleDbError(error, { unique: { email: API_ERROR_EMAIL_ALREADY_EXISTS } })
  }
}

export async function removeAllowedEmail(id: EmailAllowList['id']): Promise<void> {
  try {
    await prisma.emailAllowList.delete({ where: { id } })
  } catch (error) {
    handleDbError(error, { delete: API_ERROR_EMAIL_DOES_NOT_EXISTS })
  }
}
