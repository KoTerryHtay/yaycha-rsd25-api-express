import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../src/prismaClient";
import { User } from "@prisma/client";

export function auth(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;

  // console.log("authorization >>>", authorization);

  const token = authorization && authorization.split(" ")[1];

  if (!token) {
    return res.status(400).json({ msg: "token required" });
  }

  // const user = jwt.decode(token, process.env.JWT_SECRET || "");
  const user = jwt.decode(token) as User;

  console.log("jwt.decode >>>", user.id, ".", user.name);

  if (!user) {
    return res.status(401).json({ msg: "incorrect token" });
  }

  res.locals.user = user;

  next();
}

type Type = "post" | "comment";

export function isOwner(type: Type) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = res.locals.user as User;

    if (type === "post") {
      const post = await prisma.post.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (post?.userId === user.id) return next();
    }

    if (type === "comment") {
      const comment = await prisma.comment.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          post: true,
        },
      });

      if (comment?.userId == user.id || comment?.post.userId == user.id)
        return next();
    }

    res.status(403).json({ msg: "Unauthorize to delete" });
  };
}
