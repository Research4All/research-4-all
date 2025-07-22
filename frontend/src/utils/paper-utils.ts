import type { Paper } from '@/types';

export function filterAndSortPapers(
  papers: Paper[], 
  search: string, 
  sortBy: string
): Paper[] {
  const filteredPapers = papers.filter((paper: Paper) =>
    paper.title.toLowerCase().includes(search.toLowerCase())
  );

  return filteredPapers.sort((a: Paper, b: Paper) => {
    switch (sortBy) {
      case "Relevance":
        if (a.score !== undefined && b.score !== undefined) {
          return b.score - a.score;
        } else if (a.score !== undefined) {
          return -1;
        } else if (b.score !== undefined) {
          return 1;
        }
        return 0;
      
      case "Newest":
        return (
          new Date(b.publicationDate).getTime() -
          new Date(a.publicationDate).getTime()
        );
      
      case "Oldest":
        return (
          new Date(a.publicationDate).getTime() -
          new Date(b.publicationDate).getTime()
        );
      
      case "Title A-Z":
        return a.title.localeCompare(b.title);
      
      case "Title Z-A":
        return b.title.localeCompare(a.title);
      
      default:
        return 0;
    }
  });
} 