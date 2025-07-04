import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../model/user";
import jwt from "jsonwebtoken";
import env from "dotenv";
import { getLogger } from "../common/logs";

const logger = getLogger("UserController");

env.config();
const JWT_SECRET = process.env.JWT_SECRET ?? "";

// function to generate jwt token
export async function signin(request: Request, response: Response) {
  const { email, password } = request.body;
  try {
    const user = await User.findOne({ email });

    if (user) {
      const isPasswordMatched = await user.authenticate(password);

      if (isPasswordMatched) {
        const token = jwt.sign({ _id: user._id, role: user.role }, JWT_SECRET, {
          expiresIn: "3d",
        });
        response.status(200).json({
          message: "User is signed in successfully",
          body: { token, user },
        });
      } else {
        logger.warn("Password mismatch for user:", email);
        throw "password is incorrect";
      }
    } else {
      throw "User not found";
    }
  } catch (error : any) {
    logger.error("Error during user sign-in:", error);
    response.status(400).json({ message: "Error in signed in", body: error instanceof Error ? error.message : String(error) });
  }
}

// function to sign up a user
export async function signup(request: Request, response: Response) {
  const {
    username,  
    email,
    password,
    role,
  } = request.body;

  try {
    const alreadyAUser = await User.findOne({ email });

    if (alreadyAUser) {
      throw "User is already present in the database with this email address";
    }

    const userName =
      username.trim().split(" ")[0] +
      "@" +
      Math.floor(Math.random() * 10000 + 1);

    const hash_password = await bcrypt.hash(password, 10);

    const _user = new User({
      email,
      hash_password,
      userName,
      role: role ?? "user",
    });

    const savedUser = await _user.save();

    logger.info("User signed up successfully:", savedUser);

    response.status(200).json({
      message: "User is signed up successfully",
      body: { User: savedUser },
    });
  } catch (error : any) {
    logger.error("Error while saving the user:", error);
    response.status(400).json({
      message: "Error while saving the user",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function getAllUser(request: any, response: Response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.page_per_page) || 10;

    const skip = (page - 1) * limit;

    const userList = await User.find({})
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    logger.info("Fetching all users");

    response.status(200).json({
      message: "List of available users",
      users: userList,
      currentPage: page,
      totalPages,
      totalUsers,
    });
  } catch (error: any) {
    logger.error("Error fetching users", error);
    response.status(400).json({
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function getUserByID(request: Request, response: Response) {
  try {
    const _id = request.params._id.split(":")[1];
    console.log(_id);

    const uselList = await User.find({ _id });
    if (!uselList || uselList.length === 0) {
      logger.warn("User not found with ID");
        return response.status(404).json({ message: "User not found" });
    }
    response.status(200).json({
        message: "User is available",
        users: uselList,
    });
  } catch (error:any) {
    logger.error("User not found error:", error);
    response.status(400).json({
        message: "User is not available",
        error: error instanceof Error ? error.message : String(error),
    });
  }
}