import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Divide, Shield } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { mockProperties } from "@/data/mockProperties";
import { useParams } from "react-router-dom";

interface ParamTypes extends Record<string, string> {
  id: string;
}

export default function RentalDetailsPage() {
  const { id } = useParams<ParamTypes>();
  const property = mockProperties.find((item) => item.id === id);
  const [activeImage, setActiveImage] = useState(property.images[0]);
  const [showAll, setShowAll] = useState(false);

  const thumbnails = showAll ? property.images : property.images.slice(0, 4);
  const remaining = property.images.length - 4;

  return (
    <section>
      <Header />
      <div className="pt-24 max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">{property.title}</h1>
          <p className="text-muted-foreground">{property.location}</p>
        </div>
        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <img
            src={activeImage}
            alt="main"
            className="md:col-span-2 h-[420px] w-full object-cover rounded-2xl cursor-pointer"
          />

          <div className="grid grid-cols-2 gap-4">
            {thumbnails.map((img, i) => {
              const isLastVisible = !showAll && i === 3 && remaining > 0;

              return (
                <div
                  key={i}
                  className="relative h-[200px] w-full cursor-pointer"
                  onClick={() => {
                    if (isLastVisible) {
                      setShowAll(true);
                    } else {
                      setActiveImage(img);
                    }
                  }}
                >
                  <img
                    src={img}
                    alt={`gallery-${i}`}
                    className={`h-full w-full object-cover rounded-2xl transition hover:opacity-80 ${
                      activeImage === img ? "ring-2 ring-primary" : ""
                    }`}
                  />

                  {isLastVisible && (
                    <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center text-white text-xl font-semibold">
                      +{remaining}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 text-sm">
                <Stat
                  label="Price"
                  value={`${formatNaira(property.price)}/ ${property.priceType === "yearly" ? "year" : "month"}`}
                />
                <Stat label="Bedrooms" value={property.bedrooms} />
                <Stat label="Bathrooms" value={property.bathrooms} />
                <Stat label="Distance" value={property.distance} />
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="description" className="space-y-4">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="history">Price History</TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <Card className="rounded-2xl shadow-sm">
                  <CardContent className="p-6 leading-relaxed text-sm text-muted-foreground space-y-3">
                    <p>{property.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="info">
                <Card className="rounded-2xl shadow-sm">
                  <CardContent className="p-6 text-sm text-muted-foreground space-y-2">
                    <p>Lease term: 12 months minimum</p>
                    <p>Available: March 1, 2026</p>
                    <p>Pets: Cats allowed, small dogs negotiable</p>
                    <p>Utilities: Tenant pays electric & internet</p>
                    <p>Parking: 1 reserved space + guest parking</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features">
                <Card className="rounded-2xl shadow-sm">
                  <CardContent className="p-6 text-sm text-muted-foreground grid grid-cols-2 gap-2">
                    {property.amenities.map((item) => (
                      <p>•{item}</p>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card className="rounded-2xl shadow-sm">
                  <CardContent className="p-6 text-sm text-muted-foreground space-y-2">
                    <p>2024: Listed at $2,650 / month</p>
                    <p>2025: Listed at $2,750 / month</p>
                    <p>2026: Current price $2,850 / month</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-medium">Agent Details</h3>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" />
                    <AvatarFallback>AM</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {property.landlord.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {property.landlord.verified && (
                        <Badge
                          variant="secondary"
                          className="bg-green-500/90 text-white border-0"
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
                <Button className="w-full rounded-xl">Contact Agent</Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-medium">Schedule a Tour</h3>

                <div className="space-y-2">
                  <Label>Select date</Label>
                  <div className="relative">
                    <Input type="date" />
                    <Calendar className="absolute right-3 top-3 h-4 w-4 opacity-50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Available time</Label>
                  <Input placeholder="12:00 PM" />
                </div>

                <Button className="w-full rounded-xl">Book Appointment</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

const formatNaira = (amount: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};
