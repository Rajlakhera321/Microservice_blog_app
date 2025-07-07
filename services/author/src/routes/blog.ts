import { Router } from "express";
import { isAuth } from "../middleware/isAuth.js";
import uploadFile from "../middleware/multer.js";
import {
  aiBlogResponse,
  aiDescriptionResponse,
  aiTitleResponse,
  createBlog,
  deleteBlog,
  updateBlog,
} from "../controllers/blog.js";

const router = Router();

router.post("/blog/new", isAuth as any, uploadFile as any, createBlog);

router.put("/blog/:id", isAuth as any, uploadFile as any, updateBlog);

router.delete("/blog/:id", isAuth as any, deleteBlog);

router.post("/ai/title", aiTitleResponse);

router.post("/ai/description", aiDescriptionResponse);

router.post("/ai/blog", aiBlogResponse);

export default router;
