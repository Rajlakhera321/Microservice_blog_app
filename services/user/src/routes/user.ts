import { Router } from "express";
import { getUserProfile, loginUser, myProfile, updateProfilePic, updateUser } from "../controllers/user.js";
import { isAuth } from "../middleware/isAuth.js";
import uploadFile from "../middleware/multer.js";

const router = Router();

router.post("/login", loginUser as any);

router.get("/me", isAuth as any, myProfile as any);

router.get("/user/:id", getUserProfile);

router.put("/user/update", isAuth as any, updateUser as any);

router.put("/user/updateProfile", isAuth as any, uploadFile as any, updateProfilePic as any);

export default router;