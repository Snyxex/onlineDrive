// routes/userRoutes.ts
import { Router } from "express";
import {
  signup,
  signin,
  getAllUser,
  getUserByID,
  updateUsername,
  updateEmail,
  updatePassword,
  updateTheme,
  deleteAccount
} from "../controllers/user";
import { requireSignin, checkAdmin } from "../common/user";

import { loginLimiter,userUpdateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin, loginLimiter);

router.get("/users", requireSignin, checkAdmin, getAllUser); // Admin only for getting all users
router.get("/user/:_id", requireSignin, getUserByID);

// Corrected Routes for updating user information (using hyphens)
router.put("/user/update-username", requireSignin, updateUsername, userUpdateLimiter); // Changed _ to -
router.put("/user/update-email", requireSignin, updateEmail, userUpdateLimiter);       // Changed _ to -
router.put("/user/update-password", requireSignin, updatePassword, userUpdateLimiter); // Changed _ to -
router.put("/user/update-theme", requireSignin, updateTheme, userUpdateLimiter);       // Changed _ to -

router.delete("/user/delete-account", requireSignin, deleteAccount, userUpdateLimiter); 

export default router;