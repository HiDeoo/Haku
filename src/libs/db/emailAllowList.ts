import { EmailAllowList } from '@prisma/client'

import { ApiClientError } from 'libs/api'
import { prisma } from 'libs/db'

export function getAllowedEmails(): Promise<EmailAllowList[]> {
  return prisma.emailAllowList.findMany()
}

export async function addAllowedEmail(email: EmailAllowList['email']): Promise<EmailAllowList> {
  const existingEmail = await prisma.emailAllowList.findUnique({ where: { email } })

  if (existingEmail) {
    throw new ApiClientError('This email already exists.')
  }

  return prisma.emailAllowList.create({ data: { email } })
}

export async function removeAllowedEmail(id: EmailAllowList['id']): Promise<void> {
  const existingEmail = await prisma.emailAllowList.findUnique({ where: { id } })

  if (!existingEmail) {
    throw new ApiClientError('This email does not exist.')
  }

  await prisma.emailAllowList.delete({ where: { id } })
}
