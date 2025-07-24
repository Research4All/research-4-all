import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  encryptedPassword: string;
  role: "Student" | "Mentor";
  interests: string[];
  likedPapers: Types.ObjectId[];
  dislikedPapers: Types.ObjectId[];
  savedPapers: Types.ObjectId[];
  onboardingComplete: boolean;
  following: Types.ObjectId[];
  followers: Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    encryptedPassword: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["Student", "Mentor"],
      required: false
    },
    interests: { type: [String], default: [] },
    savedPapers: [{ type: Schema.Types.ObjectId, ref: "Paper", default: [] }],
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
    following: [{ type: Types.ObjectId, ref: "User", default: [] }],
    followers: [{ type: Types.ObjectId, ref: "User", default: [] }],
  },
  {
    timestamps: true,
  }
);

const User = model<IUser>("User", userSchema);

export default User;
