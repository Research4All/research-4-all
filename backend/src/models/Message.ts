import { Schema, model, Document } from "mongoose";

export interface IMessage extends Document {
  chatId: string;
  senderId: string;
  content: string;
}
const messageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: String,
      required: [true, "Chat ID is required"],
    },
    senderId: {
      type: String,
      required: [true, "Sender ID is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Message = model<IMessage>("Message", messageSchema);

export default Message;
