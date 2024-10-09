import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function LikeSeeder() {
  console.log("Post like seeding started...");

  for (let i = 0; i < 5; i++) {
    await prisma.postLike.create({
      data: {
        postId: 20,
        userId: faker.number.int({ min: 1, max: 10 }),
      },
    });
  }

  console.log("Post like seeding done.");
}
