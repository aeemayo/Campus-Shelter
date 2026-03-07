import { useState, useRef, useEffect } from "react";
import { ArrowUpDown, MapPin, Home, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { locations } from "@/services/properties";

interface PropertySearchProps {
  search: string;
  sortBy: string;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: string) => void;
  resultCount: number;
}

const sortOptions = [
  { value: "featured", label: "Featured First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest First" },
];

const locationItems = locations.filter((l) => l !== "All Locations");

const propertyTypeItems = ["Self-Contained", "Mini Flat", "Single Room"];

const amenityItems = [
  "Furnished",
  "Wi-Fi",
  "Electricity Backup",
  "Water Supply",
  "Security",
];

const PropertySearch = ({
  search,
  sortBy,
  onSearchChange,
  onSortChange,
  resultCount,
}: PropertySearchProps) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectItem = (value: string) => {
    onSearchChange(value);
    setOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div ref={wrapperRef} className="relative flex-1 w-full sm:max-w-md">
        <Command
          className="rounded-lg border border-border/60 bg-background shadow-sm overflow-visible"
          shouldFilter={true}
        >
          <CommandInput
            placeholder="Search locations, property types..."
            value={search}
            onValueChange={(value) => {
              onSearchChange(value);
              if (!open) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                (e.target as HTMLInputElement).blur();
              }
            }}
          />
          {open && (
            <CommandList className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-border/60 bg-background shadow-lg">
              <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
                No results found. Try a different search.
              </CommandEmpty>

              <CommandGroup heading="Locations">
                {locationItems.map((loc) => (
                  <CommandItem
                    key={loc}
                    value={loc}
                    onSelect={selectItem}
                    className="gap-2.5 py-2.5 px-3 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-primary/60 shrink-0" />
                    <span className="text-sm">{loc}</span>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Property Types">
                {propertyTypeItems.map((type) => (
                  <CommandItem
                    key={type}
                    value={type}
                    onSelect={selectItem}
                    className="gap-2.5 py-2.5 px-3 cursor-pointer"
                  >
                    <Home className="w-4 h-4 text-primary/60 shrink-0" />
                    <span className="text-sm">{type}</span>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Amenities">
                {amenityItems.map((amenity) => (
                  <CommandItem
                    key={amenity}
                    value={amenity}
                    onSelect={selectItem}
                    className="gap-2.5 py-2.5 px-3 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-primary/60 shrink-0" />
                    <span className="text-sm">{amenity}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          )}
        </Command>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {resultCount} {resultCount === 1 ? "property" : "properties"}
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
