import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { fetchProperty, createProperty, updateProperty, fetchAdminUsers } from "@/services/properties";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const propertyFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priceMonthly: z.coerce.number().positive("Monthly price must be positive"),
  location: z.string().min(2, "Location is required"),
  rooms: z.coerce.number().int().positive("Rooms must be a positive integer"),
  bathrooms: z.coerce.number().int().positive("Bathrooms must be a positive integer"),
  roomType: z.enum(["SINGLE", "SELF_CON", "MINI_FLAT"]),
  landlordId: z.string().min(1, "Landlord selection is required"),
  furnished: z.boolean().default(false),
  wifi: z.boolean().default(false),
  water: z.boolean().default(false),
  security: z.boolean().default(false),
  electricityBackup: z.boolean().default(false),
  availableFrom: z.string().min(1, "Availability date is required"),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

const AdminPropertyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [landlords, setLandlords] = useState<any[]>([]);
  const isEditMode = !!id;

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priceMonthly: 0,
      location: "",
      rooms: 1,
      bathrooms: 1,
      roomType: "SINGLE",
      landlordId: "",
      furnished: false,
      wifi: false,
      water: false,
      security: false,
      electricityBackup: false,
      availableFrom: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    const loadLandlords = async () => {
      try {
        const response = await fetchAdminUsers("LANDLORD");
        if (response.data) setLandlords(response.data);
      } catch (error) {
        console.error("Failed to fetch landlords", error);
      }
    };

    const loadProperty = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await fetchProperty(id);
        if (response.data) {
          const p = response.data;
          form.reset({
            title: p.title,
            description: p.description,
            priceMonthly: p.priceMonthly,
            location: p.location,
            rooms: p.rooms,
            bathrooms: p.bathrooms,
            roomType: p.roomType as any,
            landlordId: p.landlordId,
            furnished: p.furnished,
            wifi: p.wifi,
            water: p.water,
            security: p.security,
            electricityBackup: p.electricityBackup,
            availableFrom: new Date(p.availableFrom).toISOString().split("T")[0],
          });
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load property details.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    loadLandlords();
    loadProperty();
  }, [id, form, toast]);

  const onSubmit = async (values: PropertyFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        ...values,
        availableFrom: new Date(values.availableFrom).toISOString(),
      };

      if (isEditMode) {
        await updateProperty(id as string, payload);
        toast({ title: "Success", description: "Property updated successfully." });
      } else {
        await createProperty(payload);
        toast({ title: "Success", description: "Property created successfully." });
      }
      navigate("/admin");
    } catch (error) {
      toast({ title: "Error", description: "Failed to save property.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-4xl mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-6">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="border-border/50 shadow-primary-sm">
            <CardHeader>
              <CardTitle>{isEditMode ? "Edit Property" : "Add New Property"}</CardTitle>
              <CardDescription>
                {isEditMode ? "Update the property listing details." : "Create a new property listing and assign it to a landlord."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl><Input placeholder="e.g. Luxury Self-Con at South Gate" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="landlordId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Landlord</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a landlord" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {landlords.map((l) => (
                                <SelectItem key={l.id} value={l.id}>{l.name} ({l.email})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Associate this property with a landlord account.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl><Input placeholder="e.g. Ilesha Road, Akure" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priceMonthly"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (Monthly)</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="roomType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SINGLE">Single Room</SelectItem>
                              <SelectItem value="SELF_CON">Self-Contained</SelectItem>
                              <SelectItem value="MINI_FLAT">Mini Flat</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="availableFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available From</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="rooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rooms</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bathrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bathrooms</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea rows={4} placeholder="Detailed description of the property..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormLabel>Amenities</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { name: "furnished", label: "Furnished" },
                        { name: "wifi", label: "Wi-Fi" },
                        { name: "water", label: "Water" },
                        { name: "security", label: "Security" },
                        { name: "electricityBackup", label: "Power Backup" },
                      ].map((item) => (
                        <FormField
                          key={item.name}
                          control={form.control}
                          name={item.name as any}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="font-normal">{item.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => navigate("/admin")} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button type="submit" className="gradient-primary" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      {isEditMode ? "Update Property" : "Save Property"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPropertyForm;
