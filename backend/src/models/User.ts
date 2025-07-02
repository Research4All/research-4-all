import { Schema, model, Document } from "mongoose";
import { ObjectId } from "mongodb";

export interface IUser extends Document {
  username: string;
  email: string;
  encryptedPassword: string;
  role: "Student" | "Mentor";
  interests: string[];
  likedPapers: ObjectId[];
  dislikedPapers: ObjectId[];
  savedPapers: ObjectId[];
  // savedMentors: ?
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
      required: [true, "Role is required"],
    },
    interests: { type: [String], default: [] },
    savedPapers: [{ type: Schema.Types.ObjectId, ref: "Paper", default: [] }],
    // savedMentors: { type: ?, ref: 'User' } // Uncomment when User model is implemented
  },
  {
    timestamps: true,
  }
);

const User = model<IUser>("User", userSchema);

export default User;
