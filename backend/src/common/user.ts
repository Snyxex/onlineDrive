// src/common/user.ts
import { NextFunction, Request, Response } from "express";
import User, { IUserDocument } from "../model/user"; // Corrected: Using IUserDocument
import { HydratedDocument } from "mongoose";
import jwt from "jsonwebtoken"; // Add missing jwt import

const JWT_SECRET = process.env.JWT_SECRET ?? "";

// Define an interface for the JWT payload
interface JwtPayload {
  _id: string;
  role: "user" | "admin";
}

// Extend the Express Request object globally
declare global {
  namespace Express {
    interface Request {
      user?: { _id: string; role: string };
    }
  }
}

export const requireSignin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Check for Authorization header
    if (!req.headers.authorization) {
      console.error("DEBUG: No Authorization header provided."); // DEBUG LOG
      res.status(401).json({ message: "Authentication is required: No token provided" });
      return;
    }

    // 2. Extract token from "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader.startsWith("Bearer ")) {
        console.error("DEBUG: Authorization header does not start with 'Bearer '."); // DEBUG LOG
        res.status(401).json({ message: "Authentication is required: Invalid token format (missing Bearer prefix)" });
        return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        console.error("DEBUG: Token is empty after splitting Authorization header."); // DEBUG LOG
        res.status(401).json({ message: "Authentication is required: Token string is empty" });
        return;
    }

    console.log("DEBUG: Extracted Token:", token); // DEBUG LOG: Log the token to see what's being verified
    console.log("DEBUG: JWT_SECRET (length " + JWT_SECRET.length + "):", JWT_SECRET); // DEBUG LOG: Log the secret to verify it's not empty/wrong

    // 3. Verify the token with JWT
    let verifytoken: JwtPayload;
    try {
        verifytoken = jwt.verify(token, JWT_SECRET) as JwtPayload; // Assertion
        console.log("DEBUG: Token successfully verified. Payload:", verifytoken); // DEBUG LOG
    } catch (jwtError) {
        console.error("DEBUG: JWT Verification Error:", jwtError); // DEBUG LOG: Log the exact JWT error
        if (jwtError instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: "Invalid or expired token" });
        } else {
            res.status(401).json({ message: "Failed to authenticate token due to unknown JWT error." });
        }
        return;
    }

    // 4. Validate JWT payload
    if (!verifytoken._id || !verifytoken.role) {
        console.error("DEBUG: Token payload missing _id or role:", verifytoken); // DEBUG LOG
        res.status(401).json({ message: "Invalid token payload: Missing user ID or role" });
      return;
    }

    // 5. Find the user in the database
    // Corrected: Use IUserDocument instead of IUser
    const rootuser: HydratedDocument<IUserDocument> | null = await User.findById(verifytoken._id);
    console.log("DEBUG: User lookup result:", rootuser ? "Found" : "Not Found"); // DEBUG LOG

    // 6. Check if user exists
    if (!rootuser) {
      res.status(401).json({ message: "User not found or token invalid" });
      return;
    }

    // 7. Attach user information to the request object
    req.user = { _id: rootuser._id.toString(), role: rootuser.role };
    console.log("DEBUG: User attached to request:", req.user); // DEBUG LOG
    next();

  } catch (error: any) {
    console.error("DEBUG: Unexpected error in requireSignin middleware outer catch:", error); // DEBUG LOG
    res.status(500).json({ message: "An unexpected server error occurred during authentication." });
  }
};

export const checkAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== "admin") {
    console.warn("DEBUG: Access denied: User is not admin or req.user is missing."); // DEBUG LOG
    res.status(403).json({ message: "Access denied: User is not an admin" });
    return;
  }
  next();
};