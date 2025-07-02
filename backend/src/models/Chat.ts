import { Schema, model, Document } from "mongoose";

export interface IChat extends Document {
  participants: string[];
}
const chatSchema = new Schema<IChat>(
  {
    participants: {
      type: [String],
      required: [true, "Participants are required"],
    },
  },
  {
    timestamps: true,
  }
);

const Chat = model<IChat>("Chat", chatSchema);

export default Chat;
