import { FolderType, type User } from '@prisma/client'

import { prisma } from '../src/libs/db'

async function main() {
  await seedEmailAllowList()

  const users = await seedUser()

  await seedFolderForUser(users[0])
}

function seedEmailAllowList(count = 10) {
  const emails = Array.from({ length: count }, (_, i) => {
    return { email: `user${i + 1}@example.com` }
  })

  return prisma.emailAllowList.createMany({ data: emails })
}

async function seedUser(): Promise<User[]> {
  const user1 = await prisma.user.create({ data: { email: 'user1@example.com', emailVerified: new Date() } })

  return [user1]
}

async function seedFolderForUser(user?: User) {
  if (!user) {
    throw new Error('Missing user to seed folders.')
  }

  /**
   * folder1
   * |__ folder1_1
   * |__ folder1_2
   *     |__ folder1_2_1
   *     |__ folder1_2_2
   * folder2
   * folder3
   * |__ folder3_1
   */

  const { create: createFolder } = prisma.folder
  const baseFolder = { type: FolderType.NOTE, userId: user.id }

  const folder1 = await createFolder({ data: { ...baseFolder, name: 'folder1' } })
  await createFolder({ data: { ...baseFolder, name: 'folder1_1', parentId: folder1.id } })
  const folder1_2 = await createFolder({ data: { ...baseFolder, name: 'folder1_2', parentId: folder1.id } })

  await createFolder({ data: { ...baseFolder, name: 'folder1_2_1', parentId: folder1_2.id } })
  await createFolder({ data: { ...baseFolder, name: 'folder1_2_2', parentId: folder1_2.id } })

  await createFolder({ data: { ...baseFolder, name: 'folder2' } })

  const folder3 = await createFolder({ data: { ...baseFolder, name: 'folder3' } })
  await createFolder({ data: { ...baseFolder, name: 'folder3_1', parentId: folder3.id } })

  await createFolder({ data: { ...baseFolder, name: 'folder4', type: FolderType.TODO } })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    await prisma.$disconnect()

    console.error('Error while seeding datase:', error)

    process.exit(1)
  })
