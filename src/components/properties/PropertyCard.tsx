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
      className="group overflow-hidden border-border/60 hover:border-border transition-all duration-200 hover:shadow-primary-lg cursor-pointer"
      onClick={() => navigate(`/properties/${property.id}`)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {property.featured && (
            <Badge className="bg-primary text-primary-foreground font-semibold text-[10px] rounded-md">
              Featured
            </Badge>
          )}
          {!property.available && <Badge variant="destructive" className="text-[10px] rounded-md">Occupied</Badge>}
        </div>

        {/* Favorite */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onFavoriteToggle?.();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onFavoriteToggle?.();
          }}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="absolute top-3 right-3 w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white hover:scale-105 z-10 touch-manipulation"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavorite ? "fill-destructive text-destructive" : "text-foreground/40"
            }`}
          />
        </button>

        {/* Price */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-md px-3 py-1.5">
            <span className="text-base font-bold text-foreground">
              {formatPrice(property.price)}
            </span>
            <span className="text-xs text-muted-foreground ml-0.5">
              /{property.priceType === "yearly" ? "yr" : "mo"}
            </span>
          </div>
        </div>

        {/* Verified */}
        {property.landlord?.verified && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="success" className="text-[10px] rounded-md">
              <Shield className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors text-[15px]">
              {property.title}
            </h3>
            <Badge variant="outline" className="shrink-0 text-[10px] rounded-md font-medium">
              {typeLabels[property.type]}
            </Badge>
          </div>

          <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm">{property.location}</span>
            <span className="text-xs text-muted-foreground/60 ml-0.5">
              • {property.distance}
            </span>
          </div>
        </div>

        {/* Room details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Bed className="w-3.5 h-3.5" />
            <span>{property.bedrooms} Bed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-3.5 h-3.5" />
            <span>{property.bathrooms} Bath</span>
          </div>
          {property.furnished && (
            <Badge variant="secondary" className="text-[10px] rounded-md">
              Furnished
            </Badge>
          )}
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5">
          {property.amenities.slice(0, 4).map((amenity) => (
            <div
              key={amenity}
              className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md"
            >
              {amenityIcons[amenity]}
              <span>{amenity}</span>
            </div>
          ))}
          {property.amenities.length > 4 && (
            <div className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
              +{property.amenities.length - 4} more
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="pt-3 border-t border-border/50">
          <Button
            size="sm"
            asChild
            className="gradient-primary hover:opacity-90 w-full rounded-lg h-9"
          >
            <Link to={`/properties/${property.id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
