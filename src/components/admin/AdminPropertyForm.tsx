import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
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
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [landlords, setLandlords] = useState<any[]>([]);
  const isEditMode = !!id;
  const isLandlord = user?.role === "LANDLORD";

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
      if (isLandlord) return;
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

    if (isLandlord && user?.id) {
      form.setValue("landlordId", user.id);
    }
    loadLandlords();
    loadProperty();
  }, [id, form, toast, isLandlord, user?.id]);

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
        toast({ title: "Success", description: "Property created successfully. It will be live once approved by an admin." });
      }
      navigate(isLandlord ? "/landlord" : "/admin");
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
          <Button variant="ghost" onClick={() => navigate(isLandlord ? "/landlord" : "/admin")} className="mb-6">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="border-border/40 bg-background/60 backdrop-blur-md shadow-primary-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
            <CardHeader className="pb-8 border-b border-border/40 relative">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Save className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold font-display tracking-tight">{isEditMode ? "Edit Property" : "Add New Property"}</CardTitle>
                  <CardDescription className="font-medium">
                    {isEditMode ? "Update the property listing details." : isLandlord ? "Create a new property listing. It will require admin approval." : "Create a new property listing and assign it to a landlord."}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {/* Section: Basic Information */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-6 w-1 bg-primary rounded-full" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Basic Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 rounded-2xl bg-muted/30 border border-border/40 transition-all hover:border-primary/20">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-sm font-bold">Property Title</FormLabel>
                              <FormControl><Input className="h-12 rounded-xl bg-background/50" placeholder="e.g. Luxury Self-Con at South Gate" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {!isLandlord && (
                          <FormField
                            control={form.control}
                            name="landlordId"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel className="text-sm font-bold">Assigned Landlord</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-12 rounded-xl bg-background/50">
                                      <SelectValue placeholder="Select a landlord" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="rounded-xl border-border/40 backdrop-blur-xl">
                                    {landlords.map((l) => (
                                      <SelectItem key={l.id} value={l.id} className="rounded-lg">{l.name} ({l.email})</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription className="text-[11px] font-medium">Associate this property with a landlord account.</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-bold">Location</FormLabel>
                              <FormControl><Input className="h-12 rounded-xl bg-background/50" placeholder="e.g. Ilesha Road, Akure" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="priceMonthly"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-bold">Monthly Rent (₦)</FormLabel>
                              <FormControl><Input className="h-12 rounded-xl bg-background/50 font-bold text-primary" type="number" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Section: Property Details */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-6 w-1 bg-primary rounded-full" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Property Architecture</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 rounded-2xl bg-muted/30 border border-border/40 transition-all hover:border-primary/20">
                        <FormField
                          control={form.control}
                          name="roomType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-bold">Room Category</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 rounded-xl bg-background/50"><SelectValue /></SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl border-border/40 backdrop-blur-xl">
                                  <SelectItem value="SINGLE" className="rounded-lg">Single Room</SelectItem>
                                  <SelectItem value="SELF_CON" className="rounded-lg">Self-Contained</SelectItem>
                                  <SelectItem value="MINI_FLAT" className="rounded-lg">Mini Flat</SelectItem>
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
                              <FormLabel className="text-sm font-bold">Availability Date</FormLabel>
                              <FormControl><Input className="h-12 rounded-xl bg-background/50" type="date" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4 md:col-span-2">
                          <FormField
                            control={form.control}
                            name="rooms"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-bold text-center block">Total Rooms</FormLabel>
                                <FormControl><Input className="h-12 rounded-xl bg-background/50 text-center text-lg font-bold" type="number" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="bathrooms"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-bold text-center block">Total Bathrooms</FormLabel>
                                <FormControl><Input className="h-12 rounded-xl bg-background/50 text-center text-lg font-bold" type="number" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-6 w-1 bg-primary rounded-full" />
                            <FormLabel className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Listings Description</FormLabel>
                          </div>
                          <FormControl><Textarea className="rounded-2xl border-border/40 bg-muted/20 focus:bg-background/50 transition-all p-4 min-h-[160px]" placeholder="Provide a detailed and attractive description of your property..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-6 w-1 bg-primary rounded-full" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Key Amenities</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-muted/30 border border-border/40">
                        {[
                          { name: "furnished", label: "Furnished" },
                          { name: "wifi", label: "Wi-Fi" },
                          { name: "water", label: "24/7 Water" },
                          { name: "security", label: "Top Security" },
                          { name: "electricityBackup", label: "Solar/Inverter" },
                        ].map((item) => (
                          <FormField
                            key={item.name}
                            control={form.control}
                            name={item.name as any}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 space-y-0 p-3 rounded-xl hover:bg-background/40 transition-all cursor-pointer group">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="w-5 h-5 rounded-md border-primary/30 data-[state=checked]:bg-primary transition-all shadow-sm"
                                  />
                                </FormControl>
                                <FormLabel className="font-bold text-sm cursor-pointer group-hover:text-primary transition-colors">{item.label}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  <div className="flex items-center justify-end gap-5 pt-8 border-t border-border/40">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => navigate(isLandlord ? "/landlord" : "/admin")}
                      disabled={isLoading}
                      className="rounded-xl px-8 h-12 font-bold text-muted-foreground hover:text-foreground"
                    >
                      Discard Changes
                    </Button>
                    <Button
                      type="submit"
                      className="gradient-primary rounded-xl px-10 h-12 shadow-xl shadow-primary/20 font-bold tracking-tight"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-5 h-5" />
                          <span>{isEditMode ? "Update Listing" : "Publish Property"}</span>
                        </div>
                      )}
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
