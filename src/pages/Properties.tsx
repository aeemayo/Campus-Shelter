import { useState, useMemo, useEffect, useRef } from "react";
import SEO from "@/components/SEO";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/properties/PropertyCard";
import PropertyFilters, {
  FilterState,
} from "@/components/properties/PropertyFilters";
import PropertySearch from "@/components/properties/PropertySearch";
import { priceRanges } from "@/services/properties";
import { useProperties } from "@/hooks/use-properties";
import { useUserActivity } from "@/hooks/use-user-activity";
import { toFrontendProperty } from "@/lib/propertyAdapter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Home, Loader2, ChevronRight } from "lucide-react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { RoomType } from "@/services/properties";
import { PropertyCardSkeleton } from "@/components/ui/skeleton-loaders";
import { motion, AnimatePresence } from "framer-motion";

const Properties = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
    if (filters.search.trim()) {
      // Server-side search across title, location, and description
      p.search = filters.search.trim();
    }
    if (filters.location !== "All Locations") {
      p.location = filters.location;
    }
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

  // Convert API data → frontend shape
  const baseProperties = useMemo(() => {
    return apiResponse?.data?.map(toFrontendProperty) || [];
  }, [apiResponse]);

  // Client-side filters for things NOT handled by the API
  const filteredProperties = useMemo(() => {
    let result = [...baseProperties];

    if (favoritesOnly) {
      result = result.filter((property) => favorites.includes(property.id));
    }

    // Amenities filter (API only handles wifi; rest are client-side)
    if (filters.amenities.length > 0) {
      result = result.filter((p) =>
        filters.amenities.every((a) => p.amenities.includes(a)),
      );
    }

    // Quick filters not sent to API
    if (filters.availableOnly) {
      result = result.filter((p) => p.available);
    }
    if (filters.verifiedOnly) {
      result = result.filter((p) => p.landlord.verified);
    }

    // Sorting (client-side only)
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
        result.sort((a, b) => b.id.localeCompare(a.id));
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
      <SEO
        title="Browse Properties"
        description="Explore verified student accommodation near FUTA. Filter by room type, price, amenities, and location to find your perfect home."
        path="/properties"
      />
      <Header bgColor="white" />

      {/* Page Header */}
      <section className="pt-28 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Home className="w-4 h-4" />
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Properties</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
            Find Your <span className="text-primary">Perfect Home</span>
          </h1>

          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
            Browse verified student accommodation near FUTA. Filter by location,
            price, and amenities.
          </p>

          {isAuthenticated && firstName && (
            <p className="text-sm text-primary mt-3 font-medium">
              Welcome back, {firstName}
            </p>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="lg:flex lg:gap-10">
            {/* Filters Sidebar */}
            <div className="hidden lg:block">
              <PropertyFilters
                filters={filters}
                onFilterChange={setFilters}
                resultCount={filteredProperties.length}
              />
            </div>
            {/* Mobile Filters */}{" "}
            <div className="lg:hidden mb-4">
              <PropertyFilters
                filters={filters}
                onFilterChange={setFilters}
                resultCount={filteredProperties.length}
              />{" "}
            </div>
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

              {/* Results Grid */}
              <AnimatePresence mode="popLayout">
                {isError ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 bg-destructive/5 rounded-xl border-2 border-dashed border-destructive/30"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Home className="w-8 h-8 text-destructive" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2 tracking-tight">
                      Something went wrong
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      We couldn't load properties right now. Please check your connection and try again.
                    </p>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                    >
                      Try again
                    </Button>
                  </motion.div>
                ) : apiLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                  >
                    {[...Array(6)].map((_, i) => (
                      <PropertyCardSkeleton key={i} />
                    ))}
                  </motion.div>
                ) : filteredProperties.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                  >
                    {filteredProperties.map((property, idx) => (
                      <motion.div
                        key={property.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <PropertyCard
                          property={property}
                          isFavorite={favorites.includes(property.id)}
                          onFavoriteToggle={() => {
                            if (!isAuthenticated) {
                              toast({ title: "Sign in required", description: "Please sign in to save favorites.", variant: "destructive" });
                              navigate(`/login?redirect=${encodeURIComponent("/properties")}`);
                              return;
                            }
                            toggleFavorite(property.id);
                          }}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed border-border/60"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Home className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2 tracking-tight">
                      No properties found
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      No properties match your current filters. Try adjusting
                      your search criteria.
                    </p>
                    <Button
                      onClick={() =>
                        setFilters({
                          search: "",
                          location: "All Locations",
                          propertyType: "all",
                          priceRange: "all",
                          amenities: [],
                          sortBy: "featured",
                          availableOnly: false,
                          furnishedOnly: false,
                          verifiedOnly: false,
                        })
                      }
                    >
                      Clear filters
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Properties;
