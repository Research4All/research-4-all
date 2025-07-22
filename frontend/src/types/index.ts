// Paper related types
export interface Paper {
  paperId: string;
  _id?: string;
  title: string;
  abstract?: string;
  url?: string;
  openAccessPdf?: {
    url: string;
    license: string;
    status: string;
  };
  fieldsOfStudy?: string[];
  publicationDate: Date;
  publicationTypes?: string[];
  authors?: (string | { name: string })[];
  score?: number; // Optional field for relevance score
}

// User/Mentor related types
export interface User {
  _id: string;
  username: string;
  email: string;
  role: "Student" | "Mentor";
  interests: string[];
}

export interface Mentor extends User {
  role: "Mentor";
  similarity?: number;
}

// Grid related types
export interface GridCols {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
} 