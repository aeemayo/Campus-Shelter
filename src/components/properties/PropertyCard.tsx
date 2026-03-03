import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MapPin,
  Star,
  Bed,
  Bath,
  Shield,
  Wifi,
  Zap,
  Droplets,
} from "lucide-react";
import { Property } from "@/services/properties";
import { Link, useNavigate } from "react-router-dom";

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  onViewDetails?: () => void;
}

const amenityIcons: Record<string, React.ReactNode> = {
  "Wi-Fi": <Wifi className="w-3 h-3" />,
  "Electricity Backup": <Zap className="w-3 h-3" />,
  "Water Supply": <Droplets className="w-3 h-3" />,
  Security: <Shield className="w-3 h-3" />,
};

const PropertyCard = ({
  property,
  isFavorite = false,
  onFavoriteToggle,
  onViewDetails,
}: PropertyCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const typeLabels: Record<string, string> = {
    "single-room": "Single Room",
    "self-con": "Self-Contained",
    "mini-flat": "Mini Flat",
    shared: "Shared Room",
  };

  const navigate = useNavigate();

  return (
    <Card
      className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
      onClick={() => navigate(`/properties/${property.id}`)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {property.featured && (
            <Badge className="bg-accent text-accent-foreground font-semibold">
              Featured
            </Badge>
          )}
          {!property.available && <Badge variant="destructive">Occupied</Badge>}
        </div>

        {/* Favorite button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle?.();
          }}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-background hover:scale-110  z-10"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"
            }`}
          />
        </button>

        {/* Price tag */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-background/95 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <span className="text-lg font-bold text-foreground">
              {formatPrice(property.price)}
            </span>
            <span className="text-sm text-muted-foreground">
              /{property.priceType === "yearly" ? "year" : "month"}
            </span>
          </div>
        </div>

        {/* Verified badge */}
        {property.landlord.verified && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="success">
              <Shield className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Title and type */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {property.title}
            </h3>
            <Badge variant="outline" className="shrink-0 text-xs">
              {typeLabels[property.type]}
            </Badge>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm">{property.location}</span>
            <span className="text-xs text-muted-foreground/70">
              • {property.distance}
            </span>
          </div>
        </div>

        {/* Room details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms} Bed</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms} Bath</span>
          </div>
          {property.furnished && (
            <Badge variant="secondary" className="text-xs">
              Furnished
            </Badge>
          )}
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5">
          {property.amenities.slice(0, 4).map((amenity) => (
            <div
              key={amenity}
              className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full"
            >
              {amenityIcons[amenity]}
              <span>{amenity}</span>
            </div>
          ))}
          {property.amenities.length > 4 && (
            <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
              +{property.amenities.length - 4} more
            </div>
          )}
        </div>

        {/* Rating and CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <Button
            size="sm"
            asChild
            className="gradient-primary hover:opacity-90 w-full"
          >
            <Link to={`/properties/${property.id}`} onClick={onViewDetails}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
