import { Schema, model, Document } from "mongoose";

export interface IPaper extends Document {
  paperId: string;
  url: string;
  title: string;
  abstract: string;
  publicationDate: Date;
  fieldsOfStudy: string[];
  authors: string[];

  keywords: string[]; // unsure if this field exists
  // openAccessPdf ?: string; // Optional field for open access PDF URL
  // Could be useful for reading paper directly from the app
}

const paperSchema = new Schema<IPaper>(
  {
    paperId: {
      type: String,
      required: [true, "Paper ID is required"],
      unique: true,
    },
    url: {
      type: String,
      required: [true, "URL is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    abstract: {
      type: String,
      required: false,
    },
    publicationDate: {
      type: Date,
    },
    fieldsOfStudy: {
      type: [String],
      default: [],
    },
    authors: {
      type: [String],
      default: [],
    },
    keywords: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Paper = model<IPaper>("Paper", paperSchema);

export default Paper;
