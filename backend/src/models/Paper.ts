import { Schema, model, Document } from "mongoose";

export interface IPaper extends Document {
  paperId: string;
  title: string;
  abstract?: string;
  url?: string;
  openAccessPdf?: {
    url: string;
    license: string;
    status: string;
  };
  fieldsOfStudy?: string[];
  publicationDate?: String;
  publicationTypes?: string[];
  authors?: string[];
}

const paperSchema = new Schema<IPaper>(
  {
    paperId: {
      type: String,
      required: [true, "Paper ID is required"],
      unique: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    abstract: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
    openAccessPdf: {
      type: {
        url: { type: String, required: false },
        license: { type: String, required: false },
        status: { type: String, required: false },
      },
      required: false,
    },
    fieldsOfStudy: {
      type: [String],
      default: [],
    },
    publicationDate: {
      type: String,
      required: false,
    },
    publicationTypes: {
      type: [String],
      default: [],
    },
    authors: {
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
