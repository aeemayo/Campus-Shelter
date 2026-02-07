import { useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/properties/PropertyCard";
import PropertyFilters, { FilterState } from "@/components/properties/PropertyFilters";
import PropertySearch from "@/components/properties/PropertySearch";
import { mockProperties, priceRanges } from "@/data/mockProperties";
import { Home } from "lucide-react";

const Properties = () => {
  const [filters, setFilters] = useState<FilterState>({
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

  const filteredProperties = useMemo(() => {
    let result = [...mockProperties];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.location.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    // Location filter
    if (filters.location !== 'All Locations') {
      result = result.filter((p) => p.location === filters.location);
    }

    // Property type filter
    if (filters.propertyType !== 'all') {
      result = result.filter((p) => p.type === filters.propertyType);
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      const range = priceRanges.find((r) => r.value === filters.priceRange);
      if (range) {
        result = result.filter((p) => p.price >= range.min && p.price <= range.max);
      }
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      result = result.filter((p) =>
        filters.amenities.every((a) => p.amenities.includes(a))
      );
    }

    // Quick filters
    if (filters.availableOnly) {
      result = result.filter((p) => p.available);
    }
    if (filters.furnishedOnly) {
      result = result.filter((p) => p.furnished);
    }
    if (filters.verifiedOnly) {
      result = result.filter((p) => p.landlord.verified);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return result;
  }, [filters]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="pt-24 pb-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Home className="w-4 h-4" />
            <span>Home</span>
            <span>/</span>
            <span className="text-foreground">Properties</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Find Your Perfect <span className="text-primary">Accommodation</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Browse through verified properties near FUTA. Filter by location, price, and amenities to find your ideal student housing.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <PropertyFilters
              filters={filters}
              onFilterChange={setFilters}
              resultCount={filteredProperties.length}
            />

            {/* Properties Grid */}
            <div className="flex-1">
              {/* Search and Sort */}
              <div className="mb-6">
                <PropertySearch
                  search={filters.search}
                  sortBy={filters.sortBy}
                  onSearchChange={(search) => setFilters({ ...filters, search })}
                  onSortChange={(sortBy) => setFilters({ ...filters, sortBy })}
                  resultCount={filteredProperties.length}
                />
              </div>

              {/* Mobile Filters */}
              <div className="lg:hidden mb-4">
                <PropertyFilters
                  filters={filters}
                  onFilterChange={setFilters}
                  resultCount={filteredProperties.length}
                />
              </div>

              {/* Results Grid */}
              {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Home className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No properties found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Properties;