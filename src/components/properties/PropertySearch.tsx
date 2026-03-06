import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { locations } from "@/services/properties";

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

const searchSuggestions = [
  ...locations.filter((l) => l !== "All Locations"),
  "Self-Contained",
  "Mini Flat",
  "Single Room",
  "Furnished",
  "Wi-Fi",
];

const PropertySearch = ({
  search,
  sortBy,
  onSearchChange,
  onSortChange,
  resultCount,
}: PropertySearchProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = search.trim()
    ? searchSuggestions.filter(
        (s) =>
          s.toLowerCase().includes(search.toLowerCase()) &&
          s.toLowerCase() !== search.toLowerCase(),
      )
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div ref={wrapperRef} className="relative flex-1 w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or location..."
          value={search}
          onChange={(e) => { onSearchChange(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === "Tab" && filtered.length > 0) {
              e.preventDefault();
              onSearchChange(filtered[0]);
              setShowSuggestions(false);
            } else if (e.key === "Escape") {
              setShowSuggestions(false);
            }
          }}
          className="pl-10 bg-background border-border/60 rounded-lg"
        />
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute z-50 top-full mt-1 w-full bg-background border border-border/60 rounded-lg shadow-lg overflow-hidden">
            {filtered.slice(0, 6).map((suggestion) => (
              <button
                key={suggestion}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSearchChange(suggestion);
                  setShowSuggestions(false);
                }}
              >
                <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {resultCount} {resultCount === 1 ? 'property' : 'properties'}
        </span>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[160px] rounded-lg">
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
