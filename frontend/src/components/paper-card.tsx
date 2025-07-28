import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Spinner } from '@/components/ui/spinner';
import type { Paper } from '@/types';

interface PaperCardProps {
  paper: Paper;
  handleSavePaper: (paper: Paper) => Promise<Paper | undefined>;
  onOpenModal: (paper: Paper) => void;
}

export function PaperCard({ paper, handleSavePaper, onOpenModal }: PaperCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveToggle = async () => {
    setIsLoading(true);
    try {
      await handleSavePaper(paper);
    } catch {
      throw new Error("Error toggling save state");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg flex-1">{paper.title}</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleSaveToggle}
              disabled={isLoading}
              className={`p-2 rounded-full transition-colors ${
                paper.saved 
                  ? 'text-blue-600 hover:text-blue-700' 
                  : 'text-gray-400 hover:text-blue-600'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                <Bookmark 
                  className={`w-5 h-5 ${paper.saved ? 'fill-current' : ''}`} 
                />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{paper.saved ? 'Unsave paper' : 'Save paper'}</p>
          </TooltipContent>
        </Tooltip>
      </div>
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
    </div>
  );
} 