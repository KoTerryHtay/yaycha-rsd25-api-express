import { User } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../prismaClient";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export async function loginUser(req: Request, res: Response) {
  const { username, password } = req.body as User;

  if (!username || !password) {
    return res.status(400).json({
      msg: "username and password required",
    });
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  const hashPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  if (user) {
    if (hashPassword === user?.password) {
      const token = jwt.sign(user, process.env.JWT_SECRET || "");

      return res.json({ token, user });
    }
  }

  res.status(401).json({
    msg: "incorrect username or password",
  });
}

export async function createUser(req: Request, res: Response) {
  const { name, username, bio, password } = req.body as User;

  if (!name || !username || !password) {
    return res.status(400).json({
      msg: "name, username and password required",
    });
  }

  const hash = crypto.createHash("sha256").update(password).digest("hex");

  const user = await prisma.user.create({
    data: { name, username, password: hash, bio },
  });

  res.json(user);
}

export async function getAllUsers(req: Request, res: Response) {
  const data = await prisma.user.findMany({
    include: {
      posts: true,
      comments: true,
      followers: true,
      following: true,
    },
    orderBy: {
      id: "desc",
    },
    take: 20,
  });

  res.json(data);
}

export async function getUserById(req: Request, res: Response) {
  const { id } = req.params;

  const user = res.locals.user as User;

  const data = await prisma.user.findFirst({
    where: {
      id: Number(id),
    },
    include: {
      posts: true,
      comments: true,
      followers: true,
      following: true,
    },
  });

  if (!data) return null;

  if (user.id !== data.id) {
    const checkProfileView = await prisma.profileView.findFirst({
      where: {
        viewToUserId: data.id,
        viewFromUserId: user.id,
      },
    });
    console.log("checkProfileView >>>", checkProfileView);

    if (!checkProfileView) {
      const profileViewer = await prisma.profileView.create({
        data: {
          viewToUserId: data.id,
          viewFromUserId: user.id,
        },
      });

      // console.log("profileViewer >>>", profileViewer);
    }

    // console.log(`${user?.name} is watching profile of ${data?.name}`);
  }

  res.json(data);
}

export async function followUser(req: Request, res: Response) {
  const user = res.locals.user as User;
  const { id } = req.params;

  const data = await prisma.follow.create({
    data: {
      followerId: user.id,
      followingId: Number(id),
    },
  });

  await prisma.history.create({
    data: {
      historyType: "Follow",
      historyId: data.id,
      userId: user.id,
    },
  });

  res.json(data);
}

export async function unFollowUser(req: Request, res: Response) {
  const user = res.locals.user as User;
  const { id } = req.params;

  const unfollowUser = await prisma.follow.findFirst({
    where: {
      followerId: user.id,
      followingId: Number(id),
    },
  });

  await prisma.follow.deleteMany({
    where: {
      followerId: user.id,
      followingId: Number(id),
    },
  });

  // console.log("unfollowUser >>>", unfollowUser);

  if (!unfollowUser) return null;

  const checkHistory = await prisma.history.findFirst({
    where: {
      historyType: "Follow",
      historyId: unfollowUser.id,
      userId: user.id,
    },
  });

  // console.log("checkHistory >>>", checkHistory);

  checkHistory?.id &&
    (await prisma.history.delete({
      where: {
        id: checkHistory.id,
      },
    }));

  res.json({ msg: `Unfollow user ${id}` });
}

export async function searchUser(req: Request, res: Response) {
  const { q } = req.query as { q: string };
  const searchText = q.toLowerCase();

  // console.log("searchUser text >>>", q);
  // console.log("searchUser text >>>", searchText);

  const users = await prisma.user.findMany({
    where: {
      OR: [
        {
          name: {
            contains: q,
          },
        },
        {
          username: {
            contains: searchText,
          },
        },
      ],
    },
    include: {
      followers: true,
      following: true,
    },
    take: 20,
  });

  const posts = await prisma.post.findMany({
    where: {
      OR: [
        {
          content: {
            contains: q,
          },
        },
        {
          content: {
            contains: searchText,
          },
        },
      ],
      // content: {
      //   contains: q,
      // },
    },
    include: {
      user: true,
      comments: true,
      likes: true,
    },
  });

  // console.log(!users.length && `search text is ${searchText}`);

  console.log(users.length ? "user" : "search");

  console.log("users >>>", users);

  console.log("post >>>", posts);

  res.json({ users, posts });
}

export async function verifyUser(req: Request, res: Response) {
  const user = res.locals.user as User;

  const currentUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    include: {
      profileViewFrom: {
        include: {
          viewFromUser: {
            include: {
              following: true,
            },
          },
        },
      },
      // profileViewTo: {
      //   include: {
      //     viewToUser: true,
      //   },
      // },
    },
  });

  // console.log("verifyUser currentUser >>>", currentUser);

  res.json(currentUser);
}

export async function getAllHistory(req: Request, res: Response) {
  const user = res.locals.user as User;

  const history = await prisma.history.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      id: "desc",
    },
  });

  // console.log("getAllHistory >>>", history);

  res.json(history);
}

export async function getLikeByHistoryId(req: Request, res: Response) {
  const user = res.locals.user as User;
  const { id } = req.params;
  // console.log("id >>>", id);
  // console.log("user >>>", user);

  const postLike = await prisma.postLike.findFirst({
    where: {
      id: +id,
    },
    include: {
      user: true,
      post: {
        include: {
          user: true,
        },
      },
    },
  });

  // console.log("postLike >>>", postLike);

  res.json(postLike);
}

export async function getCommentByHistoryId(req: Request, res: Response) {
  const user = res.locals.user as User;
  const { id } = req.params;
  // console.log("id >>>", id);
  // console.log("user >>>", user);

  const comment = await prisma.comment.findFirst({
    where: {
      id: +id,
      userId: user.id,
    },
    include: {
      user: true,
      post: {
        include: {
          user: true,
        },
      },
    },
  });

  // console.log("comment >>>", comment);

  res.json(comment);
}

export async function getCommentLikeByHistoryId(req: Request, res: Response) {
  // const user = res.locals.user as User;
  const { id } = req.params;

  // console.log("getCommentLikeByHistoryId id >>>", id);
  // console.log("getCommentLikeByHistoryId user >>>", user);

  const commentLike = await prisma.commentLike.findFirst({
    where: {
      id: +id,
    },
    include: {
      comment: {
        include: {
          post: true,
          user: true,
        },
      },
      user: true,
    },
  });

  // console.log("commentLike >>>", commentLike);

  // console.log(
  //   `${commentLike?.user.name} likes a comment of ${commentLike?.comment.user.name}`
  // );

  return res.json(commentLike);
}

export async function getFollowUserByHistoryId(req: Request, res: Response) {
  // const user = res.locals.user as User;
  const { id } = req.params;

  // console.log("getFollowUserByHistoryId id >>>", id);
  // console.log("getFollowUserByHistoryId user >>>", user.id, ".", user.name);

  const follow = await prisma.follow.findFirst({
    where: {
      id: +id,
    },
    include: {
      follower: true,
      following: true,
    },
  });

  // console.log("getFollowUserByHistoryId follow >>>", check);
  // console.log(
  //   `getFollowUserByHistoryId >>> ${follow?.follower.id}.${follow?.follower.name} is follow to ${follow?.following.id}.${follow?.following.name}`
  // );

  res.json(follow);
}
