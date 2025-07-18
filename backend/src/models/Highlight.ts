import { Schema, model, Document } from "mongoose";

export interface IHighlight extends Document {
  text: string;
  range: {
    startOffset: number;
    endOffset: number;
    nodeData: string;
    nodeHTML: string;
    nodeTagName: string;
  };
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
        startOffset: { type: Number, required: [true, "Start offset is required"] },
        endOffset: { type: Number, required: [true, "End offset is required"] },
        nodeData: { type: String, required: [true, "Node data is required"] },
        nodeHTML: { type: String, required: [true, "Node HTML is required"] },
        nodeTagName: { type: String, required: [true, "Node tag name is required"] },
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
