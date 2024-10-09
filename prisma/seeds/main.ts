import { PrismaClient } from "@prisma/client";
import { CommentSeeder } from "./CommentSeeder";
import { PostSeeder } from "./PostSeeder";
import { UserSeeder } from "./UserSeeder";
import { LikeSeeder } from "./LikeSeeder";

const prisma = new PrismaClient();

async function main() {
  try {
    await UserSeeder();
    await PostSeeder();
    await CommentSeeder();
    await LikeSeeder();
  } catch (error) {
    console.error(error);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
