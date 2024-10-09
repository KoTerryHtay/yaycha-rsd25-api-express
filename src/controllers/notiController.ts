import { User } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../prismaClient";

export async function getAllNotis(req: Request, res: Response) {
  const user = res.locals.user as User;

  const notis = await prisma.noti.findMany({
    where: {
      post: {
        userId: user.id,
      },
    },
    include: { user: true },
    orderBy: { id: "desc" },
    take: 20,
  });

  res.json(notis);
}

export async function readAllNoti(req: Request, res: Response) {
  const user = res.locals.user as User;

  await prisma.noti.updateMany({
    where: {
      post: {
        userId: user.id,
      },
    },
    data: {
      read: true,
    },
  });

  res.json({ msg: "Marked all notis read" });
}

export async function readNotiById(req: Request, res: Response) {
  const { id } = req.params;

  const noti = await prisma.noti.update({
    where: {
      id: Number(id),
    },
    data: {
      read: true,
    },
  });

  res.json(noti);
}
