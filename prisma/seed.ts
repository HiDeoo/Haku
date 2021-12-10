import { prisma } from '../src/libs/db'

async function main() {
  await seedEmailAllowList()
}

function seedEmailAllowList(count = 10) {
  const emails = Array.from({ length: count }, (_, i) => {
    return { email: `user${i + 1}@example.com` }
  })

  return prisma.emailAllowList.createMany({ data: emails })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    await prisma.$disconnect()

    console.error('Error while seeding datase:', error)

    process.exit(1)
  })
