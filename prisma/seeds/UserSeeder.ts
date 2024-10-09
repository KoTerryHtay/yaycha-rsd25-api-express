import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function UserSeeder() {
  const password = crypto.createHash("sha256").update("password").digest("hex");

  console.log("User seeding started...");

  for (let i = 0; i < 10; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const name = `${firstName} ${lastName}`;
    const username = `${firstName}${lastName[0]}`.toLowerCase();
    const bio = faker.person.bio();

    await prisma.user.upsert({
      where: { username },
      create: { name, username, bio, password },
      update: {},
    });
  }

  console.log("User seeding done");
}

// module.exports = { UserSeeder };
