import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { locations, propertyTypes, amenitiesList, priceRanges } from "@/services/properties";

export interface FilterState {
  search: string;
  location: string;
  propertyType: string;
  priceRange: string;
  amenities: string[];
  sortBy: string;
  availableOnly: boolean;
  furnishedOnly: boolean;
  verifiedOnly: boolean;
}

interface PropertyFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  resultCount: number;
}

const PropertyFilters = ({ filters, onFilterChange, resultCount }: PropertyFiltersProps) => {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    updateFilter('amenities', newAmenities);
  };

  const resetFilters = () => {
    onFilterChange({
      search: '',
      location: 'All Locations',
      propertyType: 'all',
      priceRange: 'all',
      amenities: [],
      sortBy: 'featured',
      availableOnly: false,
      furnishedOnly: false,
      verifiedOnly: false,
    });
  };

  const activeFilterCount = [
    filters.location !== 'All Locations',
    filters.propertyType !== 'all',
    filters.priceRange !== 'all',
    filters.amenities.length > 0,
    filters.availableOnly,
    filters.furnishedOnly,
    filters.verifiedOnly,
  ].filter(Boolean).length;

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Location */}
      <div className="space-y-2">
        <Label className="text-foreground font-medium">Location</Label>
        <Select
          value={filters.location}
          onValueChange={(value) => updateFilter('location', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Property Type */}
      <div className="space-y-2">
        <Label className="text-foreground font-medium">Property Type</Label>
        <Select
          value={filters.propertyType}
          onValueChange={(value) => updateFilter('propertyType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {propertyTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label className="text-foreground font-medium">Budget (per year)</Label>
        <Select
          value={filters.priceRange}
          onValueChange={(value) => updateFilter('priceRange', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select budget" />
          </SelectTrigger>
          <SelectContent>
            {priceRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick Filters */}
      <div className="space-y-3">
        <Label className="text-foreground font-medium">Quick Filters</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="available"
              checked={filters.availableOnly}
              onCheckedChange={(checked) => updateFilter('availableOnly', checked as boolean)}
            />
            <label htmlFor="available" className="text-sm text-muted-foreground cursor-pointer">
              Available only
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="furnished"
              checked={filters.furnishedOnly}
              onCheckedChange={(checked) => updateFilter('furnishedOnly', checked as boolean)}
            />
            <label htmlFor="furnished" className="text-sm text-muted-foreground cursor-pointer">
              Furnished only
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified"
              checked={filters.verifiedOnly}
              onCheckedChange={(checked) => updateFilter('verifiedOnly', checked as boolean)}
            />
            <label htmlFor="verified" className="text-sm text-muted-foreground cursor-pointer">
              Verified landlords only
            </label>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <Label className="text-foreground font-medium">Amenities</Label>
        <div className="grid grid-cols-2 gap-2">
          {amenitiesList.map((amenity) => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={amenity}
                checked={filters.amenities.includes(amenity)}
                onCheckedChange={() => toggleAmenity(amenity)}
              />
              <label htmlFor={amenity} className="text-sm text-muted-foreground cursor-pointer">
                {amenity}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Reset */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={resetFilters}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset All Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                {activeFilterCount} active
              </span>
            )}
          </div>
          <FiltersContent />
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                {resultCount} properties found
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FiltersContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default PropertyFilters;