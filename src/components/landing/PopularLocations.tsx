import { MapPin, Home, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const locations = [
  {
    name: "Ilesha Road",
    properties: 120,
    image: "/images/property1/hallway.png",
    popular: true,
  },
  {
    name: "FUTA South Gate",
    properties: 85,
    image: "/images/property3/frontyard.jpeg",
    popular: true,
  },
  {
    name: "North Gate",
    properties: 65,
    image: "/images/property2/frontyard.jpeg",
    popular: false,
  },
  {
    name: "Aule",
    properties: 78,
    image: "/images/property4/frontyard.jpeg",
    popular: true,
  },
  {
    name: "FUTA South Gate",
    properties: 32,
    image: "/images/property6/living-room.png",
    popular: false,
  },
];

const DEFAULT_LOCATION_IMAGE = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=750&fit=crop&q=80";

const PopularLocations = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Popular Areas</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-3">
              Explore Locations Near FUTA
            </h2>
          </div>
          <Link 
            to="/properties" 
            className="text-primary font-medium flex items-center gap-2 hover:gap-3 transition-all"
          >
            View all locations
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {locations.map((location) => (
            <Link
              key={location.name}
              to={`/properties?location=${encodeURIComponent(location.name)}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] hover:shadow-primary-lg transition-all duration-300"
            >
              {/* Background Image */}
              <img
                src={location.image}
                alt={location.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = DEFAULT_LOCATION_IMAGE;
                }}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              
              {/* Popular Badge */}
              {location.popular && (
                <div className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded-full">
                  Popular
                </div>
              )}

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-primary-foreground">
                <div className="flex items-center gap-1 mb-1">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs opacity-80">FUTA Area</span>
                </div>
                <h3 className="font-display font-semibold text-lg group-hover:text-accent transition-colors">
                  {location.name}
                </h3>
                <div className="flex items-center gap-1 text-sm opacity-80">
                  <Home className="w-3 h-3" />
                  <span>{location.properties} properties</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularLocations;
