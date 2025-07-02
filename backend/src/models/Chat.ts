import { Schema, model, Document } from "mongoose";
import { IUser } from "./User";

export interface IChat extends Document {
  participants: IUser[];
}
const chatSchema = new Schema<IChat>(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: [true, "Participants are required"],
    },
  },
  {
    timestamps: true,
  }
);

const Chat = model<IChat>("Chat", chatSchema);

export default Chat;
