export interface Property {
  id: string;
  title: string;
  type: "single-room" | "self-con" | "mini-flat" | "shared";
  location: string;
  price: number;
  priceType: "monthly" | "yearly";
  bedrooms: number;
  bathrooms: number;
  images: string[];
  amenities: string[];
  distance: string;
  rating: number;
  reviewCount: number;
  landlord: {
    name: string;
    verified: boolean;
    avatar?: string;
  };
  available: boolean;
  featured: boolean;
  furnished: boolean;
  description: string;
}

export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Modern Self-Contained Apartment",
    type: "self-con",
    location: "Ilesha Road",
    price: 150000,
    priceType: "yearly",
    bedrooms: 1,
    bathrooms: 1,
    images: [
      "/images/property1/room.png",
      "/images/property1/kitchen.png",
      "/images/property1/hallway.png",
      "/images/property1/bathroom.png",
    ],
    amenities: ["Wi-Fi", "Electricity Backup", "Water Supply", "Security"],
    distance: "5 mins from FUTA",
    rating: 4.8,
    reviewCount: 24,
    landlord: { name: "Mr. Adebayo", verified: true },
    available: true,
    featured: true,
    furnished: true,
    description: "A beautiful self-contained apartment perfect for students.",
  },
  {
    id: "2",
    title: "Spacious Single Room",
    type: "single-room",
    location: "FUTA South Gate",
    price: 80000,
    priceType: "yearly",
    bedrooms: 1,
    bathrooms: 1,
    images: [
      "/images/property3/frontyard.jpeg",
      "/images/property3/living-room.png",
      "/images/property3/bedroom.png",
      "/images/property3/bathroom.png",
    ],
    amenities: ["Water Supply", "Security"],
    distance: "2 mins from FUTA",
    rating: 4.5,
    reviewCount: 18,
    landlord: { name: "Mrs. Okonkwo", verified: true },
    available: true,
    featured: false,
    furnished: false,
    description: "Clean and spacious single room very close to campus.",
  },
  {
    id: "3",
    title: "Executive Mini Flat",
    type: "mini-flat",
    location: "FUTA North Gate",
    price: 250000,
    priceType: "yearly",
    bedrooms: 2,
    bathrooms: 1,
    images: [
      "/images/property2/frontyard.jpeg",
      "/images/property2/living-room.png",
      "/images/property2/bedroom.png",
      "/images/property2/bathroom.png",
    ],
    amenities: [
      "Wi-Fi",
      "Electricity Backup",
      "Water Supply",
      "Security",
      "Generator",
    ],
    distance: "3 mins from FUTA",
    rating: 4.9,
    reviewCount: 32,
    landlord: { name: "Chief Akinola", verified: true },
    available: true,
    featured: true,
    furnished: true,
    description: "Premium mini flat with all modern amenities.",
  },
  {
    id: "4",
    title: "Budget-Friendly Room",
    type: "single-room",
    location: "Aule",
    price: 60000,
    priceType: "yearly",
    bedrooms: 1,
    bathrooms: 1,
    images: [
     "/images/property4/frontyard.jpeg",
      "/images/property4/living-room.png",
      "/images/property4/bedroom.png",
      "/images/property4/bathroom.png",
    ],
    amenities: ["Water Supply"],
    distance: "10 mins from FUTA",
    rating: 4.2,
    reviewCount: 12,
    landlord: { name: "Mr. Taiwo", verified: false },
    available: true,
    featured: false,
    furnished: false,
    description: "Affordable room for budget-conscious students.",
  },
  {
    id: "5",
    title: "Cozy Self-Con Near Market",
    type: "self-con",
    location: "Ilesha Road",
    price: 130000,
    priceType: "yearly",
    bedrooms: 1,
    bathrooms: 1,
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=800",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=800",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=800",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?q=80&w=800",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?q=80&w=800",
    ],
    amenities: ["Electricity Backup", "Water Supply", "Security"],
    distance: "7 mins from FUTA",
    rating: 4.6,
    reviewCount: 15,
    landlord: { name: "Mrs. Bello", verified: true },
    available: true,
    featured: false,
    furnished: true,
    description: "Convenient location near market and transport.",
  },
  {
    id: "6",
    title: "Shared Apartment for Students",
    type: "shared",
    location: "FUTA South Gate",
    price: 45000,
    priceType: "yearly",
    bedrooms: 1,
    bathrooms: 1,
    images: [
      "/images/property6/living-room.png",
      "/images/property6/bedroom.png",
      "/images/property6/bathroom.jpeg",
      "/images/property6/kitchen.png",
    ],
    amenities: ["Wi-Fi", "Water Supply", "Security"],
    distance: "3 mins from FUTA",
    rating: 4.3,
    reviewCount: 28,
    landlord: { name: "Mr. Ogundimu", verified: true },
    available: true,
    featured: false,
    furnished: true,
    description: "Share with fellow students in a safe environment.",
  },
];

export const locations = [
  "All Locations",
  "Ilesha Road",
  "FUTA South Gate",
  "FUTA North Gate",
  "Aule",
  "FUTA Road",
  "Obanla",
];

export const propertyTypes = [
  { value: "all", label: "All Types" },
  { value: "single-room", label: "Single Room" },
  { value: "self-con", label: "Self-Contained" },
  { value: "mini-flat", label: "Mini Flat" },
  { value: "shared", label: "Shared Room" },
];

export const amenitiesList = [
  "Wi-Fi",
  "Electricity Backup",
  "Water Supply",
  "Security",
  "Generator",
  "AC",
  "Furnished",
];

export const priceRanges = [
  { value: "all", label: "Any Budget", min: 0, max: Infinity },
  { value: "budget", label: "Under ₦100k", min: 0, max: 100000 },
  { value: "mid", label: "₦100k - ₦200k", min: 100000, max: 200000 },
  { value: "premium", label: "₦200k - ₦300k", min: 200000, max: 300000 },
  { value: "luxury", label: "Above ₦300k", min: 300000, max: Infinity },
];
