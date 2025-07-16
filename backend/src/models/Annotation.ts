import { Schema, model, Document, Types } from "mongoose";

export interface IAnnotation extends Document {
  text: string;
  comment: string;
  position: { x: number; y: number };
  paperId: Schema.Types.ObjectId;
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
    position: {
      type: {
        x: { type: Number, required: [true, "X position is required"] },
        y: { type: Number, required: [true, "Y position is required"] },
      },
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

const Annotation = model<IAnnotation>("Annotation", annotationSchema);

export default Annotation;
