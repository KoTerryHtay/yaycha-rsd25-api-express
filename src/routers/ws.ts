import express from "express";
import jwt from "jsonwebtoken";

const wsRouter = express.Router();
const secret = process.env.JWT_SECRET || "";
let clients = [] as { userId: number; ws: any }[];

wsRouter.ws("/subscribe", (ws, req) => {
  console.log("WS: token received");

  ws.on("message", (msg) => {
    const { token } = JSON.parse(`${msg}`);
    console.log("WS: token received");
    // console.log("token >>>", token);
    // console.log("msg >>>", msg);

    jwt.verify(token, secret, (err: any, user: any) => {
      if (err) return false;

      console.log("jwt.verify user >>>", user.id, ".", user.name);

      clients.push({ userId: user.id, ws });

      console.log(`WS: Client added: ${user.id}`);
    });
  });
});

export { clients, wsRouter };
