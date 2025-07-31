import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

interface PaperSearchSortProps {
  search: string;
  setSearch: (search: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  showScoreSort?: boolean;
}

export function PaperSearchSort({ 
  search, 
  setSearch, 
  sortBy, 
  setSortBy, 
  showScoreSort = false 
}: PaperSearchSortProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center justify-between m-4">
      <Input
        placeholder="Search papers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[150px]"> Sort by: {sortBy} </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
            {showScoreSort && (
              <DropdownMenuRadioItem value="Relevance">
                Relevance
              </DropdownMenuRadioItem>
            )}
            <DropdownMenuRadioItem value="Newest">
              Newest
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Oldest">
              Oldest
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Title A-Z">Title A-Z</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Title Z-A">Title Z-A</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 