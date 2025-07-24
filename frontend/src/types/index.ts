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
  following?: User[];
  followers?: User[];
  followingCount?: number;
  followersCount?: number;
  isFollowing?: boolean;
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

export interface Annotation {
  id?: string;
  text: string;
  comment: string;
  position: { x: number; y: number };
  timestamp: Date;
  range?: {
    startOffset: number;
    endOffset: number;
    nodeData: string;
    nodeHTML: string;
    nodeTagName: string;
  };
  _id?: string;
  userId?: {
    _id: string;
    username: string;
    email: string;
  };
}

export interface Highlight {
  id?: string;
  text: string;
  position: { x: number; y: number };
  timestamp: Date;
  range?: {
    startOffset: number;
    endOffset: number;
    nodeData: string;
    nodeHTML: string;
    nodeTagName: string;
  };
  color?: string; // Optional color for different highlight types
  _id?: string;
}