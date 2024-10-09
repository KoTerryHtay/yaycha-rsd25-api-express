import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PostSeeder() {
  const data = [];

  for (let i = 0; i < 20; i++) {
    const content = faker.lorem.paragraph();
    const userId = faker.number.int({ min: 1, max: 10 });

    data.push({ content, userId });
  }
  console.log("Post seeding started...");

  await prisma.post.createMany({ data });

  console.log("Post seeding done");
}

// module.exports = { PostSeeder };
