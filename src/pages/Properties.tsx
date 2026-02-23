import { useState, useMemo, useEffect, useRef } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/properties/PropertyCard";
import PropertyFilters, {
  FilterState,
} from "@/components/properties/PropertyFilters";
import PropertySearch from "@/components/properties/PropertySearch";
import { mockProperties, priceRanges } from "@/data/mockProperties";
import { useProperties } from "@/hooks/use-properties";
import { useUserActivity } from "@/hooks/use-user-activity";
import { toFrontendProperty } from "@/lib/propertyAdapter";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Home, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import type { RoomType } from "@/services/properties";

const Properties = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    location: "All Locations",
    propertyType: "all",
    priceRange: "all",
    amenities: [],
    sortBy: "featured",
    availableOnly: false,
    furnishedOnly: false,
    verifiedOnly: false,
  });

  const {
    favorites,
    lastFilters,
    saveFilters,
    saveSearch,
    toggleFavorite,
    markViewed,
  } = useUserActivity(isAuthenticated ? user?.id : undefined);
  const hydratedFiltersRef = useRef(false);

  const normalizeRoomType = (value: string): FilterState["propertyType"] => {
    const normalized = value.trim().toLowerCase();

    if (normalized.includes("self")) return "self-con";
    if (normalized.includes("mini")) return "mini-flat";
    if (normalized.includes("single")) return "single-room";

    return "all";
  };

  useEffect(() => {
    if (hydratedFiltersRef.current) return;

    const locationParam = searchParams.get("location")?.trim() ?? "";
    const roomTypeParam = searchParams.get("roomType")?.trim() ?? "";
    const mappedPropertyType = roomTypeParam
      ? normalizeRoomType(roomTypeParam)
      : "all";

    setFilters((current) => {
      const base = lastFilters ?? current;
      const next = { ...base };

      if (locationParam) {
        next.location = "All Locations";
        next.search = locationParam;
      }

      if (roomTypeParam) {
        if (mappedPropertyType !== "all") {
          next.propertyType = mappedPropertyType;
        } else {
          next.search = [next.search, roomTypeParam].filter(Boolean).join(" ");
        }
      }

      return next;
    });

    hydratedFiltersRef.current = true;
  }, [lastFilters, searchParams]);

  useEffect(() => {
    if (!hydratedFiltersRef.current) return;
    saveFilters(filters);
    saveSearch(filters.search);
  }, [filters, saveFilters, saveSearch]);

  // ─── Build API query params from current filters ───────────
  const apiParams = useMemo(() => {
    const p: Record<string, unknown> = { limit: 50 };
    if (filters.location !== "All Locations") p.location = filters.location;
    if (filters.furnishedOnly) p.furnished = true;
    if (filters.amenities.includes("Wi-Fi")) p.wifi = true;
    if (filters.priceRange !== "all") {
      const range = priceRanges.find((r) => r.value === filters.priceRange);
      if (range) {
        if (range.min > 0) p.minPrice = range.min;
        if (range.max < Infinity) p.maxPrice = range.max;
      }
    }
    const roomTypeMap: Record<string, RoomType> = {
      "single-room": "SINGLE",
      "self-con": "SELF_CON",
      "mini-flat": "MINI_FLAT",
    };
    if (filters.propertyType !== "all" && roomTypeMap[filters.propertyType]) {
      p.roomType = roomTypeMap[filters.propertyType];
    }
    return p;
  }, [filters]);

  const firstName = user?.name?.trim().split(" ")[0] ?? "";

  const {
    data: apiResponse,
    isLoading: apiLoading,
    isError,
  } = useProperties(apiParams);

  // Convert API data → frontend shape, or fall back to mock
  const baseProperties = useMemo(() => {
    if (apiResponse?.data && apiResponse.data.length > 0) {
      return apiResponse.data.map(toFrontendProperty);
    }
    return mockProperties; // fallback
  }, [apiResponse]);

  const filteredProperties = useMemo(() => {
    let result = [...baseProperties];

    if (favoritesOnly) {
      result = result.filter((property) => favorites.includes(property.id));
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.location.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower),
      );
    }

    // Location filter
    if (filters.location !== "All Locations") {
      result = result.filter((p) => p.location === filters.location);
    }

    // Property type filter
    if (filters.propertyType !== "all") {
      result = result.filter((p) => p.type === filters.propertyType);
    }

    // Price range filter
    if (filters.priceRange !== "all") {
      const range = priceRanges.find((r) => r.value === filters.priceRange);
      if (range) {
        result = result.filter(
          (p) => p.price >= range.min && p.price <= range.max,
        );
      }
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      result = result.filter((p) =>
        filters.amenities.every((a) => p.amenities.includes(a)),
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
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      case "featured":
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return result;
  }, [baseProperties, favoritesOnly, favorites, filters]);

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
            Find Your Perfect{" "}
            <span className="text-primary">Accommodation</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Browse through verified properties near FUTA. Filter by location,
            price, and amenities to find your ideal student housing.
          </p>
          {isAuthenticated && (
            <p className="text-sm text-primary mt-2">
              Welcome back{firstName ? `, ${firstName}` : ""}. We saved your
              last filters and favorites.
            </p>
          )}
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
                  onSearchChange={(search) =>
                    setFilters({ ...filters, search })
                  }
                  onSortChange={(sortBy) => setFilters({ ...filters, sortBy })}
                  resultCount={filteredProperties.length}
                />
                {isAuthenticated && (
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <span className="text-sm text-muted-foreground">
                      Favorites only
                    </span>
                    <Switch
                      checked={favoritesOnly}
                      onCheckedChange={setFavoritesOnly}
                      aria-label="Show favorites only"
                    />
                  </div>
                )}
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
              {apiLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                  <p className="text-muted-foreground">Loading properties...</p>
                </div>
              ) : filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      isFavorite={favorites.includes(property.id)}
                      onFavoriteToggle={() => toggleFavorite(property.id)}
                      onViewDetails={() => markViewed(property.id)}
                    />
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
