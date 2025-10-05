import { PrismaClient, Tag } from '@prisma/client';

const prisma = new PrismaClient();

const tags: Array<Pick<Tag, 'name'>> = [{ name: 'dragon' }, { name: 'nest' }];

async function upsertTags() {
  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: { name: tag.name },
    });
  }
}

async function main() {
  await upsertTags();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
