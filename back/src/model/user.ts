import mongoose, { Document } from "mongoose";
import bcrypt from "bcrypt";

interface IUser extends Document {
  userName: string;
  email: string;
  hash_password: string;
  role: "user" | "admin";
  authenticate: (password: string) => boolean;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    userName: {
      type: String,
      unique: true,
      required: true,
    },

    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      lowercase: true,
    },

    hash_password: {
      type: String,
      trim: true,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.methods.authenticate = async function (password: string) {
  const bCryptedPassword = await bcrypt.compare(password, this.hash_password);
  return bCryptedPassword;
};

const User = mongoose.model("User", userSchema);

export default User;