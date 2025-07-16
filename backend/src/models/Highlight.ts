import { Schema, model, Document, Types } from "mongoose";

export interface IHighlight extends Document {
    text: string;
    position: { x: number; y: number };
    color?: string; // Optional color for different highlight types
    paperId: Types.ObjectId;
    userId: Types.ObjectId;
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
  },
  {
    timestamps: true,
  }
);

const Highlight = model<IHighlight>("Highlight", highlightSchema);

export default Highlight;
