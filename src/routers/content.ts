import express from "express";
import { auth, isOwner } from "../../middleware/auth";
import * as postController from "../controllers/postController";
import * as commentController from "../controllers/commentController";
import * as notiController from "../controllers/notiController";

export const contentRouter = express.Router();

contentRouter.get("/following/posts", auth, postController.getFollowingPosts);

contentRouter.get("/posts", postController.getAllPosts);
contentRouter.post("/posts", auth, postController.createPost);
contentRouter.get("/posts/:id", postController.getPostById);
contentRouter.delete(
  "/posts/:id",
  auth,
  isOwner("post"),
  postController.deletePostById
);

contentRouter.get("/like/posts/:id", postController.getLikePost);
contentRouter.post("/like/posts/:id", auth, postController.likePost);
contentRouter.delete("/unlike/posts/:id", auth, postController.unLikePost);

contentRouter.post("/comments", auth, commentController.createComment);
contentRouter.delete(
  "/comments/:id",
  auth,
  isOwner("comment"),
  commentController.deleteCommentById
);

contentRouter.get("like/comments/:id", commentController.getLikeCommentById);
contentRouter.post("/like/comments/:id", auth, commentController.likeComment);
contentRouter.delete(
  "/unlike/comments/:id",
  auth,
  commentController.unlikeComment
);

contentRouter.get("/notis", auth, notiController.getAllNotis);
contentRouter.put("/notis/read", auth, notiController.readAllNoti);
contentRouter.put("/notis/read/:id", auth, notiController.readNotiById);
