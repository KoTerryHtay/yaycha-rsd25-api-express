import { prisma } from "../prismaClient";
import { clients } from "../routers/ws";

export async function addNoti({
  type,
  content,
  postId,
  userId,
}: {
  type: string;
  content: string;
  postId: string;
  userId: number;
}) {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
  });

  if (post?.userId == userId) return false;

  clients.map((client) => {
    if (client.userId == post?.userId) {
      client.ws.send(JSON.stringify({ event: "notis" }));
      // console.log(`WS: event sent to ${client.userId}: notis`);
      // console.log("WS: event sent notis >>>", client.ws);
    }
  });

  return await prisma.noti.create({
    data: {
      type,
      content,
      postId: Number(postId),
      userId,
    },
  });
}
