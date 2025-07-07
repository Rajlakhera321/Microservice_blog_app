import { Router } from "express";
import {
  addComment,
  deleteComment,
  getAllBlogs,
  getAllComments,
  getSingleBlog,
  saveBlog,
  savedBlogs,
} from "../controllers/blogs.js";
import { isAuth } from "../middelware/isAuth.js";

const router = Router();

router.get("/blog/all", getAllBlogs);

router.get("/blog/:id", getSingleBlog);

router.post("/comment/:id", isAuth as any, addComment);

router.get("/comment/:id", getAllComments);

router.delete("/comment/:commentId", isAuth as any, deleteComment);

router.post("/save/:blogId", isAuth as any, saveBlog);

router.get("/blog/saved/all", isAuth as any, savedBlogs);

export default router;
