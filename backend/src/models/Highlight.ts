import { Schema, model, Document } from "mongoose";

export interface IHighlight extends Document {
  text: string;
  position: { x: number; y: number };
  color?: string; // Optional color for different highlight types
  paperId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
}
const highlightSchema = new Schema<IHighlight>(
  {
    text: {
      type: String,
      required: [true, "Text is required"],
    },
    position: {
      type: {
        x: { type: Number, required: [true, "X position is required"] },
        y: { type: Number, required: [true, "Y position is required"] },
      },
    },
    color: {
      type: String,
      enum: ["yellow", "green", "blue", "pink"],
      default: "yellow",
    },
    paperId: {
      type: Schema.Types.ObjectId,
      ref: "Paper",
      required: [true, "Paper ID is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Highlight = model<IHighlight>("Highlight", highlightSchema);

export default Highlight;
