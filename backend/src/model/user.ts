import mongoose, { Schema, Model, HydratedDocument, Types } from "mongoose";
import bcrypt from "bcrypt";

// Define the core properties of your user document
export interface IUserProperties {
  userName: string;
  email: string;
  hash_password: string;
  role: "user" | "admin";
}

// Define the methods that will be available on a user document instance
export interface IUserMethods {
  authenticate: (password: string) => Promise<boolean>;
}

// Combine properties and methods into the Document type
// This is the type for a single user document retrieved from Mongoose
// CORRECTED LINE: Pass IUserProperties as the type argument to HydratedDocument
export interface IUserDocument extends IUserProperties, IUserMethods, HydratedDocument<IUserProperties> {
  // HydratedDocument already adds _id, createdAt, updatedAt, but specifying helps clarity
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Model type, including any static methods (if you had them)
export interface IStaticUserModel extends Model<IUserDocument> {
  // Example static method:
  // findByEmailAndRole(email: string, role: string): Promise<IUserDocument | null>;
}

const userSchema = new Schema<IUserDocument, IStaticUserModel>( // Use IUserDocument here
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
  {
    timestamps: true, // This adds `createdAt` and `updatedAt` properties
  }
);

// Add the authenticate method to the schema methods
userSchema.methods.authenticate = async function (password: string): Promise<boolean> {
  // 'this' refers to the IUserDocument instance
  return bcrypt.compare(password, this.hash_password);
};

// Create the Mongoose Model
const User = mongoose.model<IUserDocument, IStaticUserModel>("User", userSchema);

export default User;