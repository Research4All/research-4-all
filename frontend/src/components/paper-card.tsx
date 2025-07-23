import type { Paper } from '@/types';

interface PaperCardProps {
  paper: Paper;
  handleSavePaper: (paper: Paper) => Promise<Paper | undefined>;
  onOpenModal: (paper: Paper) => void;
}

export function PaperCard({ paper, handleSavePaper, onOpenModal }: PaperCardProps) {
  return (
    <div className="bg-white rounded shadow p-4">
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
        <button
          onClick={() => onOpenModal(paper)}
          className="text-blue-500 hover:underline cursor-pointer bg-none border-none p-0"
        >
          View PDF
        </button>
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
  );
} 