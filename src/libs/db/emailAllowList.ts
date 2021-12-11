import { EmailAllowList } from '@prisma/client'

import { ApiClientError } from 'libs/api/routes'
import { prisma } from 'libs/db'

export function getAllowedEmails(): Promise<EmailAllowList[]> {
  return prisma.emailAllowList.findMany()
}

export function getAllowedEmailByEmail(email: EmailAllowList['email']): Promise<EmailAllowList | null> {
  return prisma.emailAllowList.findUnique({ where: { email } })
}

export async function addAllowedEmail(email: EmailAllowList['email']): Promise<EmailAllowList> {
  const existingEmail = await getAllowedEmailByEmail(email)

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
