import { Request, Response, NextFunction } from "express"; // Ensure NextFunction is imported
import bcrypt from "bcrypt";
import User, { IUserDocument } from "../model/user";
import jwt from "jsonwebtoken";
import env from "dotenv";
import { getLogger } from "../common/logs";
import mongoose from "mongoose";

const logger = getLogger("UserController");
env.config();
const JWT_SECRET = process.env.JWT_SECRET ?? "";

// Type-Guard for request.user
declare global {
  namespace Express {
    interface Request {
      user?: { _id: string; role: string };
    }
  }
}

export async function signin(request: Request, response: Response): Promise<void> {
  const { email, password } = request.body;
  try {
    const user: IUserDocument | null = await User.findOne({ email });
    if (user) {
      const isPasswordMatched = await user.authenticate(password);
      if (isPasswordMatched) {
        const token = jwt.sign({ _id: user._id.toString(), role: user.role }, JWT_SECRET, {
          expiresIn: "3d",
        });
        response.status(200).json({
          message: "User is signed in successfully",
          body: { token, user: { _id: user._id.toString(), userName: user.userName, email: user.email, role: user.role, theme: user.theme } },
        });
      } else {
        response.status(401).json({ message: "Password is incorrect" });
      }
    } else {
      response.status(404).json({ message: "User not found" });
    }
  } catch (error: any) {
    logger.error("Error in signin:", error);
    response.status(500).json({ message: "Error in signed in", body: error instanceof Error ? error.message : String(error) });
  }
}


export async function signup(request: Request, response: Response): Promise<void> {
  const { username, email, password, role } = request.body;

  // STEP 1: Add robust validation for username at the very beginning
  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    response.status(400).json({ message: "Username is required and cannot be empty." });
    logger.warn(`Signup failed: Username is missing or empty for email: ${email}`);
    return;
  }

  const trimmedUsername = username.trim(); // Ensure it's trimmed for consistency

  try {
    const alreadyAUser: IUserDocument | null = await User.findOne({ email });
    if (alreadyAUser) {
      response.status(409).json({ message: "User is already present with this email address" });
      logger.warn(`Signup failed: Email already exists: ${email}`);
      return;
    }

    // STEP 2: Check for username uniqueness *before* trying to save
    // This is crucial if you want the provided username to be directly unique
    const existingUsernameUser = await User.findOne({ userName: trimmedUsername });
    if (existingUsernameUser) {
        response.status(409).json({ message: "This username is already taken. Please choose another." });
        logger.warn(`Signup failed: Username already taken: ${trimmedUsername}`);
        return;
    }

    // You commented out the random suffix generation, which is good if you want direct usernames.
    // const finalUserName = trimmedUsername + "@" + Math.floor(Math.random() * 1000000 + 1);

    // This line is the potential issue for the `username: null` error if `username` from `request.body`
    // happens to be `null` or `undefined` despite your initial check.
    // If `username` was `""` it would have been caught by the `trim().length === 0` check.
    // However, if `username` was *literally* `null` from the request, the `trim()` would fail.
    // But your initial check `!username` should catch `null` and `undefined`.
    const finalUserName = username; // <--- Using the original 'username' from request.body

    const hash_password = await bcrypt.hash(password, 10);
    const _user = new User({
      email,
      hash_password,
      userName: finalUserName, // Use the final userName
      role: role ?? "user",
    });
    const savedUser: IUserDocument = await _user.save();
    logger.info(`User signed up successfully: ${savedUser.email} with username: ${savedUser.userName}`);
    response.status(201).json({
      message: "User is signed up successfully",
      body: { User: { _id: savedUser._id.toString(), userName: savedUser.userName, email: savedUser.email, role: savedUser.role } },
    });
  } catch (error: any) {
    logger.error("Error during signup:", error);
    if (error.code === 11000) {
        response.status(409).json({
            message: "A user with this email or username already exists.",
            errorDetail: error.keyValue
        });
    } else {
        response.status(500).json({
            message: "Error while saving the user",
            error: error instanceof Error ? error.message : String(error),
        });
    }
  }
}

export async function getAllUser(request: Request, response: Response): Promise<void> {
  try {
    const page = parseInt(request.query.page as string) || 1;
    const limit = parseInt(request.query.page_per_page as string) || 10;
    const skip = (page - 1) * limit;
    // Applied type assertion here
    const userList: IUserDocument[] = await User.find({})
      .skip(skip)
      .limit(limit)
      .select('-hash_password') as IUserDocument[];

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);
    response.status(200).json({
      message: "List of available users",
      users: userList.map(user => ({
        _id: user._id.toString(),
        userName: user.userName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
      currentPage: page,
      totalPages,
      totalUsers,
    });
  } catch (error: any) {
    logger.error("Error fetching all users:", error);
    response.status(500).json({
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function getUserByID(request: Request, response: Response): Promise<void> {
  try {
    const _id = request.params._id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      response.status(400).json({ message: "Invalid user ID format" });
      return;
    }
    // Applied type assertion here
    const user: IUserDocument | null = await User.findById(_id).select('-hash_password') as IUserDocument | null;
    if (!user) {
      response.status(404).json({ message: "User not found" });
      return;
    }
    response.status(200).json({
      message: "User is available",
      user: {
        _id: user._id.toString(),
        userName: user.userName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    });
  } catch (error: any) {
    logger.error("Error fetching user by ID:", error);
    response.status(500).json({
      message: "Error fetching user",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function updateUsername(request: Request, response: Response): Promise<void> {
  try {
    if (!request.user || !request.user._id) {
      response.status(401).json({ message: "Authentication required." });
      return;
    }

    const { newUsername } = request.body;

    if (!newUsername || typeof newUsername !== 'string' || newUsername.trim().length < 3) {
      response.status(400).json({ message: "New username must be a string of at least 3 characters." });
      return;
    }

    const existingUserWithUsername: IUserDocument | null = await User.findOne({ userName: newUsername });
    if (existingUserWithUsername && existingUserWithUsername._id.toString() !== request.user._id) {
      response.status(409).json({ message: "Username already taken." });
      return;
    }

    // Applied type assertion here
    const user: IUserDocument | null = await User.findById(request.user._id) as IUserDocument | null;

    if (!user) {
      response.status(404).json({ message: "User not found." });
      return;
    }

    user.userName = newUsername.trim();
    await user.save();

    response.status(200).json({
      message: "Username updated successfully.",
      user: {
        _id: user._id.toString(),
        userName: user.userName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    logger.error("Error updating username:", error);
    response.status(500).json({
      message: "Error updating username",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// 2. `updateEmail`
// ... (similar comments for updateEmail and updatePassword if they were present)

export async function updateEmail(request: Request, response: Response): Promise<void> {
  try {
    if (!request.user || !request.user._id) {
      response.status(401).json({ message: "Authentication required." });
      return;
    }

    const { newEmail } = request.body;

    if (!newEmail || typeof newEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      response.status(400).json({ message: "New email must be a valid email address." });
      return;
    }

    const existingUserWithEmail: IUserDocument | null = await User.findOne({ email: newEmail });
    if (existingUserWithEmail && existingUserWithEmail._id.toString() !== request.user._id) {
      response.status(409).json({ message: "Email already taken." });
      return;
    }

    const user: IUserDocument | null = await User.findById(request.user._id) as IUserDocument | null;

    if (!user) {
      response.status(404).json({ message: "User not found." });
      return;
    }

    user.email = newEmail.trim();
    await user.save();

    response.status(200).json({
      message: "Email updated successfully.",
      user: {
        _id: user._id.toString(),
        userName: user.userName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    logger.error("Error updating email:", error);
    response.status(500).json({
      message: "Error updating email",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function updatePassword(request: Request, response: Response): Promise<void> {
  try {
    if (!request.user || !request.user._id) {
      response.status(401).json({ message: "Authentication required." });
      return;
    }

    const { oldPassword, newPassword } = request.body;

    if (!oldPassword || typeof oldPassword !== 'string' || oldPassword.trim().length === 0) {
      response.status(400).json({ message: "Old password is required." });
      return;
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 6) {
      response.status(400).json({ message: "New password must be at least 6 characters long." });
      return;
    }

    const user: IUserDocument | null = await User.findById(request.user._id) as IUserDocument | null;

    if (!user) {
      response.status(404).json({ message: "User not found." });
      return;
    }

    const isPasswordMatched = await user.authenticate(oldPassword);
    if (!isPasswordMatched) {
      response.status(401).json({ message: "Incorrect old password." });
      return;
    }

    user.hash_password = await bcrypt.hash(newPassword, 10);
    await user.save();

    response.status(200).json({
      message: "Password updated successfully.",
    });

  } catch (error: any) {
    logger.error("Error updating password:", error);
    response.status(500).json({
      message: "Error updating password",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function deleteAccount(request: Request, response: Response): Promise<void> {
  try {
    if (!request.user || !request.user._id) {
      response.status(401).json({ message: "Authentication required." });
      return;
    }

    const userId = request.user._id;

    const user: IUserDocument | null = await User.findById(userId) as IUserDocument | null;
    if (!user) {
      response.status(404).json({ message: "User not found." });
      return;
    }

    await User.findByIdAndDelete(userId);

    response.status(200).json({
      message: "Account deleted successfully."
    });
  } catch (error: any) {
    logger.error("Error deleting account:", error);
    response.status(500).json({
      message: "Error deleting account",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function updateTheme(request: Request, response: Response): Promise<void> {
  try {
    if (!request.user || !request.user._id) {
      response.status(401).json({ message: "Authentication required." });
      return;
    }

    const { newTheme } = request.body;

    if (!newTheme || (newTheme !== "dark" && newTheme !== "light")) {
      response.status(400).json({ message: "New theme must be 'dark' or 'light'." });
      return;
    }

    const user: IUserDocument | null = await User.findById(request.user._id) as IUserDocument | null;

    if (!user) {
      response.status(404).json({ message: "User not found." });
      return;
    }

    user.theme = newTheme;
    await user.save();

    response.status(200).json({
      message: "Theme updated successfully.",
      user: {
        _id: user._id.toString(),
        userName: user.userName,
        email: user.email,
        role: user.role,
        theme: user.theme,
      },
    });
  } catch (error: any) {
    logger.error("Error updating theme:", error);
    response.status(500).json({
      message: "Error updating theme",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}