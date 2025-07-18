import { Schema, model, Document, Types } from "mongoose";

export interface IAnnotation extends Document {
  text: string;
  comment: string;
  range: {
    startOffset: number;
    endOffset: number;
    nodeData: string;
    nodeHTML: string;
    nodeTagName: string;
  };
  position: { x: number; y: number };
  paperMongoId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
}
const annotationSchema = new Schema<IAnnotation>(
  {
    text: {
      type: String,
      required: [true, "Text is required"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
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
    position: {
      type: {
        x: { type: Number, required: [true, "X position is required"] },
        y: { type: Number, required: [true, "Y position is required"] },
      },
      required: [true, "Position is required"],
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

const Annotation = model<IAnnotation>("Annotation", annotationSchema);

export default Annotation;
