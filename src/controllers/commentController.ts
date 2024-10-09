import { User } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../prismaClient";
import { addNoti } from "../services/notiService";

export async function createComment(req: Request, res: Response) {
  const { content, postId } = req.body as { content: string; postId: string };

  if (!content || !postId) {
    return res.status(400).json({
      msg: "content and postId required",
    });
  }

  const user = res.locals.user as User;

  const comment = await prisma.comment.create({
    data: {
      content,
      userId: user.id,
      postId: Number(postId),
    },
    include: {
      user: true,
    },
  });

  // comment.user = user;

  await addNoti({
    type: "comment",
    content: "reply your post",
    postId,
    userId: user.id,
  });

  await prisma.history.create({
    data: {
      historyType: "Comment",
      historyId: comment.id,
      userId: user.id,
    },
  });

  res.json(comment);
}

export async function deleteCommentById(req: Request, res: Response) {
  const { id } = req.params;
  const user = res.locals.user as User;

  const deletedComment = await prisma.comment.delete({
    where: {
      id: Number(id),
    },
  });

  // console.log("deletedComment >>>", deletedComment);

  const checkHistory = await prisma.history.findFirst({
    where: {
      historyType: "Comment",
      historyId: deletedComment.id,
      userId: user.id,
    },
  });

  // console.log("checkHistory >>>", checkHistory);

  if (!!checkHistory?.id) {
    await prisma.history.delete({
      where: {
        id: checkHistory.id,
      },
    });
  }

  res.sendStatus(204);
}

export async function likeComment(req: Request, res: Response) {
  const { id } = req.params;
  const user = res.locals.user as User;

  const like = await prisma.commentLike.create({
    data: {
      userId: user.id,
      commentId: Number(id),
    },
  });

  // await addNoti({
  //   type: "like",
  //   content: "likes your comment",
  //   postId: id,
  //   userId: user.id,
  // });

  await prisma.history.create({
    data: {
      historyType: "CommentLike",
      historyId: like.id,
      userId: user.id,
    },
  });

  res.json({ like });
}

export async function unlikeComment(req: Request, res: Response) {
  const { id } = req.params;
  const user = res.locals.user as User;

  // console.log("unlikeComment id >>>", id);
  // console.log("unlikeComment user >>>", user);

  const comment = await prisma.commentLike.findFirst({
    where: {
      userId: user.id,
      commentId: Number(id),
    },
  });

  const deletedComment = await prisma.commentLike.deleteMany({
    where: {
      userId: user.id,
      commentId: comment?.commentId,
    },
  });

  // console.log("deletedComment >>>", deletedComment);

  if (!comment) return null;

  const checkHistory = await prisma.history.findFirst({
    where: {
      historyType: "CommentLike",
      historyId: comment.id,
      userId: user.id,
    },
  });

  // console.log("checkHistory >>>", checkHistory);

  !!checkHistory?.id &&
    (await prisma.history.delete({
      where: {
        id: checkHistory?.id,
      },
    }));

  res.json({ msg: `Unlike comment ${id}` });
}

export async function getLikeCommentById(req: Request, res: Response) {
  const { id } = req.params;

  const data = await prisma.commentLike.findFirst({
    where: {
      commentId: Number(id),
    },
    include: {
      user: {
        include: {
          followers: true,
          following: true,
        },
      },
    },
  });

  res.json(data);
}
