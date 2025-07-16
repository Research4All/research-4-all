import { Schema, model, Document } from "mongoose";

export interface IHighlight extends Document {
  text: string;
  range: { startContainer: string, startOffset: number, endContainer: string, endOffset: number };
  color?: string; // Optional color for different highlight types
  paperMongoId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
}
const highlightSchema = new Schema<IHighlight>(
  {
    text: {
      type: String,
      required: [true, "Text is required"],
    },
    range: {
      type: {
        startContainer: { type: String, required: [true, "Start container is required"] },
        startOffset: { type: Number, required: [true, "Start offset is required"] },
        endContainer: { type: String, required: [true, "End container is required"] },
        endOffset: { type: Number, required: [true, "End offset is required"] },
      },
      required: [true, "Range is required"],
    },
    color: {
      type: String,
      enum: ["yellow", "green", "blue", "pink"],
      default: "yellow",
    },
    paperMongoId: {
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
