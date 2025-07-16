import { Schema, model, Document, Types } from "mongoose";

export interface IAnnotation extends Document {
  text: string;
  comment: string;
  range: { startContainer: string, startOffset: number, endContainer: string, endOffset: number };
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
        startContainer: { type: String, required: [true, "Start container is required"] },
        startOffset: { type: Number, required: [true, "Start offset is required"] },
        endContainer: { type: String, required: [true, "End container is required"] },
        endOffset: { type: Number, required: [true, "End offset is required"] },
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
