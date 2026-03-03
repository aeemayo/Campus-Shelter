// ─── Adapter: Backend API property → Frontend Property shape ─
import { Property, ApiProperty, RoomType } from "@/services/properties";

const roomTypeMap: Record<string, Property["type"]> = {
  SINGLE: "single-room",
  SELF_CON: "self-con",
  MINI_FLAT: "mini-flat",
};

/**
 * Converts a backend ApiProperty to the frontend Property interface
 * used by PropertyCard and other UI components.
 */
export function toFrontendProperty(p: ApiProperty): Property {
  const amenities: string[] = [];
  if (p.wifi) amenities.push("Wi-Fi");
  if (p.electricityBackup) amenities.push("Electricity Backup");
  if (p.water) amenities.push("Water Supply");
  if (p.security) amenities.push("Security");

  // Compute average rating from reviews if present
  let avgRating = 0;
  let reviewCount = 0;
  if (p.reviews && p.reviews.length > 0) {
    reviewCount = p.reviews.length;
    avgRating =
      Math.round(
        (p.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10
      ) / 10;
  } else if (p._count) {
    reviewCount = p._count.reviews;
  }

  return {
    id: p.id,
    title: p.title,
    type: roomTypeMap[p.roomType] ?? "single-room",
    location: p.location,
    price: p.priceMonthly,
    priceMonthly: p.priceMonthly,
    priceWeekly: p.priceWeekly,
    priceType: "monthly",
    bedrooms: p.rooms,
    bathrooms: p.bathrooms,
    images: p.images && p.images.length > 0
      ? p.images
      : ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"],
    amenities,
    distance: `${p.distanceFromFUTA} km from FUTA`,
    rating: avgRating,
    reviewCount,
    availableFrom: p.availableFrom,
    approved: p.approved,
    landlord: p.landlord ? {
      id: p.landlord.id,
      name: p.landlord.name,
      email: p.landlord.email,
      phone: p.landlord.phone,
      verified: true,
    } : {
      name: "Landlord",
      verified: true
    },
    available: new Date(p.availableFrom) <= new Date(),
    featured: false,
    furnished: p.furnished,
    description: p.description,
  };
}
