import { useState, useEffect } from "react";

export function PaperGrid() {
  const [papers, setPapers] = useState([]);

  interface paper {
    paperId: string;
    title: string;
    publicationDate: string;
    publicationTypes: string[];
    openAccessPdf?: string;
  }

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/papers");
        const data = await response.json();
        setPapers(data.data);
      } catch (error) {
        console.error("Error fetching papers:", error);
      }
    };
    fetchPapers();
  }, []);

  return (
    <div>
      <h2>Recommended Papers</h2>
      {papers.length > 0 ? (
        <ul>
          {papers.map((paper: paper) => (
            <li key={paper.paperId}>
              <h3>{paper.title}</h3>
              <p>Publication Date: {paper.publicationDate}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No papers found.</p>
      )}
    </div>
  );
}
