import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useProperties } from "@/hooks/use-properties";
import { toFrontendProperty } from "@/lib/propertyAdapter";

const LOCATION_CONFIG = [
  { name: "Ilesha Road",    keywords: ["ilesha"],       image: "/images/property1/hallway.png",    tag: "Most Popular"    },
  { name: "FUTA South Gate",keywords: ["south gate"],   image: "/images/property3/frontyard.jpeg", tag: "Student Favorite" },
  { name: "North Gate",     keywords: ["north gate"],   image: "/images/property2/frontyard.jpeg", tag: null              },
  { name: "Aule",           keywords: ["aule"],         image: "/images/property4/frontyard.jpeg", tag: "Growing Fast"    },
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=750&fit=crop&q=80";

const PopularLocations = () => {
  const { data: apiResponse } = useProperties({ limit: 200 });

  const locations = useMemo(() => {
    const all = apiResponse?.data?.map(toFrontendProperty) ?? [];
    return LOCATION_CONFIG.map((loc) => {
      const count = all.filter((p) =>
        loc.keywords.some((kw) =>
          p.location?.toLowerCase().includes(kw.toLowerCase())
        )
      ).length;
      return { ...loc, properties: count };
    });
  }, [apiResponse]);

  return (
    <section className="py-24 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-3">
              Popular Areas
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Explore Near FUTA
            </h2>
          </div>
          <Link
            to="/properties"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
          >
            All locations
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {locations.map((loc) => (
            <Link
              key={loc.name}
              to={`/properties?location=${encodeURIComponent(loc.name)}`}
              className="group relative block rounded-xl overflow-hidden aspect-[3/4]"
            >
              <img
                src={loc.image}
                alt={loc.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                }}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {loc.tag && (
                <div className="absolute top-3 left-3 bg-white/90 text-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                  {loc.tag}
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-display font-semibold text-white text-lg mb-1 group-hover:text-white/90 transition-colors">
                  {loc.name}
                </h3>
                <div className="flex items-center gap-1.5 text-white/60 text-xs">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {apiResponse
                      ? loc.properties > 0
                        ? `${loc.properties} ${loc.properties === 1 ? "property" : "properties"} available`
                        : "Browse properties"
                      : "Loading..."}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="sm:hidden mt-8 text-center">
          <Link
            to="/properties"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            View all locations
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularLocations;
