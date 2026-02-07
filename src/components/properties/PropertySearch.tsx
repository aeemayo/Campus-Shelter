import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpDown } from "lucide-react";

interface PropertySearchProps {
  search: string;
  sortBy: string;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: string) => void;
  resultCount: number;
}

const sortOptions = [
  { value: 'featured', label: 'Featured First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
];

const PropertySearch = ({
  search,
  sortBy,
  onSearchChange,
  onSortChange,
  resultCount,
}: PropertySearchProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Search Input */}
      <div className="relative flex-1 w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search properties..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-background border-border"
        />
      </div>

      {/* Results count and Sort */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {resultCount} {resultCount === 1 ? 'property' : 'properties'} found
        </span>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default PropertySearch;