interface Paper {
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
  publicationDate: Date;
  publicationTypes?: string[];
  authors?: string[]; // Optional field for authors
}

interface PaperGridProps {
  papers: Paper[];
  handleSavePaper: (paper: Paper) => void;
}

export function PaperGrid({ papers, handleSavePaper }: PaperGridProps) {
  // const [papers, setPapers] = useState([]);

  interface Paper {
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
    publicationDate: Date;
    publicationTypes?: string[];
    authors?: string[]; // Optional field for authors
  }

  return (
    <div>
      <h2>Recommended Papers</h2>
      {papers.length > 0 ? (
        <div className="grid grid-cols-4 gap-4 m-4">
          {papers.map((paper: Paper) => (
            <div key={paper.paperId} className="bg-white rounded shadow p-4">
              <h3 className="font-semibold text-lg mb-2">{paper.title}</h3>
              <p className="text-sm text-gray-600 mb-1">
                Publication Date:{" "}
                {paper.publicationDate ? (
                  <span>
                    {paper.publicationDate instanceof Date
                      ? paper.publicationDate.toLocaleDateString()
                      : paper.publicationDate}
                  </span>
                ) : (
                  <span className="text-gray-400">Unknown</span>
                )}
              </p>
              {paper.openAccessPdf?.url && (
                <a
                  href={paper.openAccessPdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Open Access PDF
                </a>
              )}
              <div className="mt-2">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer w-full"
                  onClick={() => {
                    handleSavePaper(paper);
                  }}
                >
                  Save paper
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No papers found.</p>
      )}
    </div>
  );
}
