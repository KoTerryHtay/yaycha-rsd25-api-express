import express from "express";
import { auth } from "../../middleware/auth";
import * as userController from "../controllers/userController";

export const userRouter = express.Router();

userRouter.post("/login", userController.loginUser);

userRouter.post("/users", userController.createUser);

userRouter.get("/users", userController.getAllUsers);

userRouter.get("/users/:id", auth, userController.getUserById);

userRouter.post("/follow/:id", auth, userController.followUser);

userRouter.delete("/unfollow/:id", auth, userController.unFollowUser);

userRouter.get("/search", userController.searchUser);

userRouter.get("/verify", auth, userController.verifyUser);

userRouter.get("/history", auth, userController.getAllHistory);

userRouter.get("/likes/:id", auth, userController.getLikeByHistoryId);

userRouter.get("/comments/:id", auth, userController.getCommentByHistoryId);

userRouter.get(
  "/like/comments/:id",
  auth,
  userController.getCommentLikeByHistoryId
);

userRouter.get("/follow/:id", auth, userController.getFollowUserByHistoryId);

userRouter.get("/follow/:id", auth, userController.getFollowUserByHistoryId);
