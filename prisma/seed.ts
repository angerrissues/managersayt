import { PrismaClient } from '@prisma/client'
import bloggers from '../src/data/bloggers.json'
import cases from '../src/data/cases.json'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  for (const blogger of bloggers) {
    await prisma.blogger.upsert({
      where: { id: blogger.id },
      update: {},
      create: {
        id: blogger.id,
        name: blogger.name,
        avatarPath: blogger.avatarPath,
        geo: blogger.geo,
        rknStatus: blogger.rknStatus,
        contact: blogger.contact,
        socials: blogger.socials,
        details: blogger.details,
      },
    })
  }
  console.log(`Seeded ${bloggers.length} bloggers.`)

  for (const c of cases) {
    await prisma.case.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        brand: c.brand,
        lineup: c.lineup,
        agency: c.agency,
        description: c.description,
        platforms: c.platforms,
        bloggers: c.bloggers,
        coverImage: c.coverImage,
        videos: c.videos,
      },
    })
  }
  console.log(`Seeded ${cases.length} cases.`)

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
