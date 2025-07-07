// routes/userRoutes.ts
import { Router } from "express";
import {
  signup,
  signin,
  getAllUser,
  getUserByID,
  updateUsername, 
  updateEmail,    
  updatePassword  ,
  deleteAccount
} from "../controllers/user";
import { requireSignin, checkAdmin } from "../common/user";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);

router.get("/users", requireSignin, checkAdmin, getAllUser); // Admin only for getting all users
router.get("/user/:_id", requireSignin, getUserByID);

// New Routes for updating user information
router.put("/user/update-username", requireSignin, updateUsername); // User can update their own username
router.put("/user/update-email", requireSignin, updateEmail);       // User can update their own email
router.put("/user/update-password", requireSignin, updatePassword); // User can update their own password

router.delete("/user/delete-account", requireSignin, deleteAccount); // User can delete their own account

export default router;