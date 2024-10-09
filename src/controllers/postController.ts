import { User } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../prismaClient";
import { addNoti } from "../services/notiService";

export async function getAllPosts(req: Request, res: Response) {
  try {
    const data = await prisma.post.findMany({
      include: {
        user: true,
        comments: true,
        likes: true,
      },
      orderBy: { id: "desc" },
      take: 20,
    });

    // setTimeout(() => {
    //   res.json(data);
    // }, 2000);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
}

export async function createPost(req: Request, res: Response) {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({
      msg: "content required",
    });
  }

  const user = res.locals.user as User;

  const post = await prisma.post.create({
    data: {
      content,
      userId: user.id,
    },
  });

  await prisma.history.create({
    data: {
      historyType: "createPost",
      historyId: post.id,
      userId: user.id,
    },
  });

  const data = await prisma.post.findUnique({
    where: { id: post.id },
    include: {
      user: true,
      comments: {
        include: { user: true },
      },
    },
  });

  res.json(data);
}

export async function getPostById(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const data = await prisma.post.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        user: true,
        likes: true,
        comments: {
          include: {
            user: true,
            likes: true,
          },
        },
      },
    });

    const t = typeof data;

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
}

export async function deletePostById(req: Request, res: Response) {
  const { id } = req.params;

  await prisma.comment.deleteMany({
    where: { postId: Number(id) },
  });

  const deletedPost = await prisma.post.delete({
    where: {
      id: Number(id),
    },
  });

  // const deletedPost = await prisma.post.findFirst({
  //   where: {
  //     id: Number(id),
  //   },
  // });

  console.log("deletedPost >>>", deletedPost);

  const checkHistory = await prisma.history.findFirst({
    where: {
      historyType: "createPost",
      historyId: deletedPost.id,
      userId: deletedPost.userId,
    },
  });

  console.log("checkHistory >>>", checkHistory);

  !!checkHistory?.id &&
    (await prisma.history.delete({
      where: {
        id: checkHistory.id,
      },
    }));

  res.sendStatus(204);
}

export async function likePost(req: Request, res: Response) {
  const { id } = req.params;
  const user = res.locals.user as User;

  const like = await prisma.postLike.create({
    data: {
      postId: Number(id),
      userId: user.id,
    },
  });

  console.log("/like/posts/:id");

  await addNoti({
    type: "like",
    content: "likes your post",
    postId: id,
    userId: user.id,
  });

  await prisma.history.create({
    data: {
      historyType: "PostLike",
      historyId: like.id,
      userId: user.id,
    },
  });

  res.json({ like });
}

export async function unLikePost(req: Request, res: Response) {
  const { id } = req.params;
  // console.log("unLikePost id >>>", id);

  const user = res.locals.user as User;

  const postLikeId = await prisma.postLike.findFirst({
    where: {
      postId: Number(id),
      userId: user.id,
    },
  });

  // console.log("postLikeId >>>", postLikeId);

  await prisma.postLike.deleteMany({
    where: {
      postId: Number(id),
      userId: user.id,
    },
  });

  const history = await prisma.history.findFirst({
    where: {
      historyType: "PostLike",
      historyId: postLikeId?.id,
      userId: user.id,
    },
  });

  // console.log("history >>>", history);

  !!history?.id &&
    (await prisma.history.delete({
      where: {
        id: history.id,
        historyId: history.historyId,
        userId: history.userId,
      },
    }));

  res.json({ msg: `Unlike post ${id}` });
}

export async function getLikePost(req: Request, res: Response) {
  const { id } = req.params;

  console.log("getLikePost id >>>", id);

  const data = await prisma.postLike.findMany({
    where: {
      postId: Number(id),
    },
    include: {
      post: {
        include: {
          user: true,
        },
      },
      user: {
        include: {
          followers: true,
          following: true,
        },
      },
    },
  });

  console.log("getLikePost >>>", data);

  res.json(data);
}

export async function getFollowingPosts(req: Request, res: Response) {
  const user = res.locals.user as User;

  const follow = await prisma.follow.findMany({
    where: {
      followerId: user.id,
    },
  });

  const users = follow.map((item) => item.followingId);

  const data = await prisma.post.findMany({
    where: {
      userId: {
        in: users,
      },
    },
    include: {
      user: true,
      comments: true,
      likes: true,
    },
    orderBy: { id: "desc" },
    take: 20,
  });

  res.json(data);
}
