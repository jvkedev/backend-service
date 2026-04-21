import bcrypt from "bcryptjs";
import mongoose, { Document } from "mongoose";

interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: "student" | "counselor";
  targetCountries: string[];
  interestedFields: string[];
  preferredIntake?: string;
  maxBudgetUsd?: number;
  englishTest: {
    exam: string;
    score: number;
  };
  profileComplete: boolean;
  isVerified: boolean;

  comparePassword(password: string): Promise<boolean>;
}

/**
 * User model representing user and counselors.
 * Handles authentication and profile information.
 */
const userSchema = new mongoose.Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
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
      minlength: 8,
    },
    role: {
      type: String,
      enum: ["student", "counselor"],
      default: "student",
    },
    targetCountries: [String],
    interestedFields: [String],
    preferredIntake: String,
    maxBudgetUsd: Number,
    englishTest: {
      exam: {
        type: String,
        default: "ILETS",
      },
      score: {
        type: Number,
        default: 0,
      },
    },
    profileComplete: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (this: IUser, password: string) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
