import { FolderType, type User } from '@prisma/client'

import { prisma } from '../src/libs/db'

async function main() {
  await seedEmailAllowList()

  const users = await seedUsers()

  await seedFolderForUser(users[0], FolderType.NOTE)
  await seedFolderForUser(users[1], FolderType.NOTE)
}

function seedEmailAllowList(count = 10) {
  const emails = Array.from({ length: count }, (_, i) => {
    return { email: `user${i + 1}@example.com` }
  })

  return prisma.emailAllowList.createMany({ data: emails })
}

async function seedUsers(): Promise<[User, User]> {
  const user1 = await prisma.user.create({ data: { email: 'user1@example.com', emailVerified: new Date() } })
  const user2 = await prisma.user.create({ data: { email: 'user2@example.com', emailVerified: new Date() } })

  return [user1, user2]
}

async function seedFolderForUser(user: User, type: FolderType) {
  /**
   * folder0
   * |__ folder0_0
   * |__ folder0_1
   *     |__ folder0_1_0
   *     |__ folder0_1_1
   * folder1
   * folder2
   * |__ folder2_0
   */

  const { create: createFolder } = prisma.folder
  const baseFolder = { type, userId: user.id }

  const folder0 = await createFolder({ data: { ...baseFolder, name: 'folder0' } })
  await createFolder({ data: { ...baseFolder, name: 'folder0_0', parentId: folder0.id } })
  const folder0_1 = await createFolder({ data: { ...baseFolder, name: 'folder0_1', parentId: folder0.id } })

  await createFolder({ data: { ...baseFolder, name: 'folder0_1_0', parentId: folder0_1.id } })
  await createFolder({ data: { ...baseFolder, name: 'folder0_1_1', parentId: folder0_1.id } })

  await createFolder({ data: { ...baseFolder, name: 'folder1' } })

  const folder2 = await createFolder({ data: { ...baseFolder, name: 'folder2' } })
  await createFolder({ data: { ...baseFolder, name: 'folder2_0', parentId: folder2.id } })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    await prisma.$disconnect()

    console.error('Error while seeding database:', error)

    process.exit(1)
  })
