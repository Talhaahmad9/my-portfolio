import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

loadEnvConfig(process.cwd());

const DEFAULT_ADMIN_EMAIL = "hi.talhaahmad@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "Talhaportfolioadmin233001@";

interface IUserSeedDocument extends mongoose.Document {
  email: string;
  password: string;
  role: string;
}

const UserSeedSchema = new mongoose.Schema<IUserSeedDocument>({
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

UserSeedSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

const UserModel: mongoose.Model<IUserSeedDocument> =
  (mongoose.models.User as mongoose.Model<IUserSeedDocument>) ??
  mongoose.model<IUserSeedDocument>("User", UserSeedSchema);

async function seedAdmin(): Promise<void> {
  const { connectDB } = await import("@/lib/db/mongo");

  const emailFromEnv = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordFromEnv = process.env.ADMIN_PASSWORD?.trim();

  const adminEmail = emailFromEnv || DEFAULT_ADMIN_EMAIL;
  const adminPassword = passwordFromEnv || DEFAULT_ADMIN_PASSWORD;

  if (!emailFromEnv || !passwordFromEnv) {
    console.warn(
      "[seed-admin] ADMIN_EMAIL or ADMIN_PASSWORD is missing. Using defaults. Set both env vars before production use."
    );
  }

  await connectDB();

  const existingUser = await UserModel.exists({ email: adminEmail });
  if (existingUser) {
    console.info(`[seed-admin] Skipped: admin user already exists for ${adminEmail}.`);
    return;
  }

  await UserModel.create({
    email: adminEmail,
    password: adminPassword,
    role: "admin",
  });

  console.info(`[seed-admin] Success: created admin user for ${adminEmail}.`);
}

seedAdmin()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[seed-admin] Failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });
