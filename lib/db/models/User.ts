import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongo";

export interface IUser extends Document {
  email: string;
  password: string;
  role: string;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "admin",
  },
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

await connectDB();

export const UserModel: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ??
  mongoose.model<IUser>("User", UserSchema);
