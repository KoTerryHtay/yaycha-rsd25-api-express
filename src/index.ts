import express from "express";
import expressWs from "express-ws";

const app = expressWs(express()).app;

import cors from "cors";
import { prisma } from "./prismaClient";
import { contentRouter } from "./routers/content";
import { userRouter } from "./routers/user";
import { wsRouter } from "./routers/ws";

app.use("/", wsRouter);

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/info", (req, res) => {
  res.json({ msg: "Yaycha Api" });
});

app.use("/", userRouter);

app.use("/content", contentRouter);

const server = app.listen(8000, () => {
  console.log("Yaycha API started at 8000...");
});

const gracefulShutdown = async () => {
  await prisma.$disconnect();
  server.close(() => {
    console.log("Yaycha API closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
