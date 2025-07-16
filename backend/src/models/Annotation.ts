import { Schema, model, Document, Types } from "mongoose";

export interface IAnnotation extends Document {
    text: string;
    comment: string;
    position: { x: number; y: number };
    paperId: Types.ObjectId;
    userId: Types.ObjectId;
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
  },
  {
    timestamps: true,
  }
);

const Annotation = model<IAnnotation>("Annotation", annotationSchema);

export default Annotation;
