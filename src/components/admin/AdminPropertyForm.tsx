import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChevronLeft,
  Loader2,
  Save,
  ImagePlus,
  X,
  GripVertical,
  MapPin,
  Keyboard,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  fetchProperty,
  createProperty,
  updateProperty,
  fetchAdminUsers,
} from "@/services/properties";
import { compressImage } from "@/lib/image-compress";
import { apiFetch } from "@/lib/api";
import LocationPicker from "@/components/LocationPicker";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// ─── CoordinatePicker ───────────────────────────────────────────────────────
// Allows admin to set property coordinates via map click OR manual lat/lng inputs.

function CoordinatePicker({
  lat,
  lng,
  onChange,
}: {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const [mode, setMode] = useState<"map" | "input">("map");
  const [inputLat, setInputLat] = useState(lat?.toString() ?? "");
  const [inputLng, setInputLng] = useState(lng?.toString() ?? "");

  const applyManual = () => {
    const parsedLat = parseFloat(inputLat);
    const parsedLng = parseFloat(inputLng);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      onChange(parsedLat, parsedLng);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Property Coordinates</p>
        <div className="flex rounded-lg border border-border overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setMode("map")}
            className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${mode === "map" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
          >
            <MapPin className="w-3 h-3" />
            Map
          </button>
          <button
            type="button"
            onClick={() => setMode("input")}
            className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${mode === "input" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
          >
            <Keyboard className="w-3 h-3" />
            Manual
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {mode === "map"
          ? "Click on the map to pin the property. FUTA gate distances will be calculated automatically."
          : "Enter latitude and longitude directly. Coordinates near FUTA: lat ~7.3197, lng ~5.1352."}
      </p>

      {mode === "map" ? (
        <LocationPicker
          lat={lat}
          lng={lng}
          onChange={onChange}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Latitude</label>
            <Input
              placeholder="e.g. 7.3197"
              value={inputLat}
              onChange={(e) => setInputLat(e.target.value)}
              onBlur={applyManual}
              className="h-10 rounded-lg font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Longitude</label>
            <Input
              placeholder="e.g. 5.1352"
              value={inputLng}
              onChange={(e) => setInputLng(e.target.value)}
              onBlur={applyManual}
              className="h-10 rounded-lg font-mono text-sm"
            />
          </div>
        </div>
      )}

      {lat && lng && (
        <p className="text-xs text-success font-medium">
          ✓ Coordinates set ({lat.toFixed(5)}, {lng.toFixed(5)}) — gate distances will show on the listing.
        </p>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────

const MAX_IMAGES = 8;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
const MAX_FILE_SIZE_MB = 10; // raw input limit; compressed output will be ≤500KB

interface ImageItem {
  id: string;
  url: string; // preview data-url or existing remote url
  file?: File; // only set for new uploads
  uploaded: boolean; // true when already on the server
}

const propertyFormSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priceMonthly: z.coerce.number().positive("Monthly price must be positive"),
  location: z.string().min(2, "Location is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  rooms: z.coerce.number().int().positive("Rooms must be a positive integer"),
  bathrooms: z.coerce
    .number()
    .int()
    .positive("Bathrooms must be a positive integer"),
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

  // ── Image upload state ──
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImageFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = MAX_IMAGES - images.length;
      if (remaining <= 0) {
        toast({
          title: "Limit Reached",
          description: `You can upload a maximum of ${MAX_IMAGES} images.`,
          variant: "destructive",
        });
        return;
      }
      const toAdd = fileArray.slice(0, remaining);
      const invalid = toAdd.filter(
        (f) =>
          !ACCEPTED_IMAGE_TYPES.includes(f.type) ||
          f.size > MAX_FILE_SIZE_MB * 1024 * 1024,
      );
      if (invalid.length > 0) {
        toast({
          title: "Invalid Files",
          description: `Some files were skipped. Only JPEG/PNG/WebP under ${MAX_FILE_SIZE_MB}MB are accepted.`,
          variant: "destructive",
        });
      }
      const valid = toAdd.filter(
        (f) =>
          ACCEPTED_IMAGE_TYPES.includes(f.type) &&
          f.size <= MAX_FILE_SIZE_MB * 1024 * 1024,
      );
      // Compress images before adding
      const compressed = await Promise.all(valid.map((f) => compressImage(f)));
      const newItems: ImageItem[] = compressed.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: URL.createObjectURL(file),
        file,
        uploaded: false,
      }));
      setImages((prev) => [...prev, ...newItems]);
    },
    [images.length, toast],
  );

  const removeImage = useCallback((imageId: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === imageId);
      if (item && !item.uploaded) URL.revokeObjectURL(item.url);
      return prev.filter((i) => i.id !== imageId);
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) addImageFiles(e.dataTransfer.files);
    },
    [addImageFiles],
  );

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
      landlordId: isLandlord && user?.id ? user.id : "",
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
            availableFrom: new Date(p.availableFrom)
              .toISOString()
              .split("T")[0],
            latitude: p.latitude ?? undefined,
            longitude: p.longitude ?? undefined,
          });
          // Load existing images
          if (p.images && p.images.length > 0) {
            setImages(
              p.images.map((url, idx) => ({
                id: `existing-${idx}`,
                url,
                uploaded: true,
              })),
            );
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load property details.",
          variant: "destructive",
        });
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

  const prepareImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];

    const newImages = images.filter((img) => !img.uploaded && img.file);
    if (newImages.length > 0) {
      setImageUploadProgress(`Uploading ${newImages.length} image${newImages.length > 1 ? "s" : ""}...`);
    }

    const results = await Promise.all(
      images.map(async (img) => {
        if (img.uploaded) return img.url; // already a stored URL
        if (!img.file) return null;

        const formData = new FormData();
        formData.append("file", img.file);

        try {
          const res = await apiFetch<{ success: true; data: { url: string } }>(
            "/api/properties/images",
            { method: "POST", body: formData }
          );
          return res.data.url;
        } catch (err) {
          console.error("Image upload failed", err);
          return null;
        }
      })
    );

    setImageUploadProgress(null);
    return results.filter((url): url is string => url !== null);
  };

  const onSubmit = async (values: PropertyFormValues) => {
    setIsLoading(true);
    try {
      // Compress and convert images to base64 for persistent storage
      const imageUrls = await prepareImages();

      const payload = {
        ...values,
        availableFrom: new Date(values.availableFrom).toISOString(),
        images: imageUrls,
      };

      if (isEditMode) {
        await updateProperty(id as string, payload);
        toast({
          title: "Success",
          description: "Property updated successfully.",
        });
      } else {
        await createProperty(payload);
        toast({
          title: "Property Submitted!",
          description:
            "Your property is now under review. Expect approval within 24-48 hours.",
        });
      }
      navigate(isLandlord ? "/landlord" : "/admin");
    } catch (error: any) {
      const message =
        error?.message || "Failed to save property. Please try again.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setImageUploadProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-4xl mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate(isLandlord ? "/landlord" : "/admin")}
            className="mb-6"
          >
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
                  <CardTitle className="text-2xl font-bold font-display tracking-tight">
                    {isEditMode ? "Edit Property" : "Add New Property"}
                  </CardTitle>
                  <CardDescription className="font-medium">
                    {isEditMode
                      ? "Update the property listing details."
                      : isLandlord
                        ? "Create a new property listing. It will require admin approval."
                        : "Create a new property listing and assign it to a landlord."}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-10">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-12"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {/* Section: Basic Information */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-6 w-1 bg-primary rounded-full" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                          Basic Information
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 rounded-2xl bg-muted/30 border border-border/40 transition-all hover:border-primary/20">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-sm font-bold">
                                Property Title
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="h-12 rounded-xl bg-background/50"
                                  placeholder="e.g. Luxury Self-Con at South Gate"
                                  {...field}
                                />
                              </FormControl>
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
                                <FormLabel className="text-sm font-bold">
                                  Assigned Landlord
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-12 rounded-xl bg-background/50">
                                      <SelectValue placeholder="Select a landlord" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="rounded-xl border-border/40 backdrop-blur-xl">
                                    {landlords.map((l) => (
                                      <SelectItem
                                        key={l.id}
                                        value={l.id}
                                        className="rounded-lg"
                                      >
                                        {l.name} ({l.email})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription className="text-[11px] font-medium">
                                  Associate this property with a landlord
                                  account.
                                </FormDescription>
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
                              <FormLabel className="text-sm font-bold">
                                Location
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="h-12 rounded-xl bg-background/50"
                                  placeholder="e.g. Ilesha Road, Akure"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Coordinates — map or manual input */}
                        <CoordinatePicker
                          lat={form.watch("latitude")}
                          lng={form.watch("longitude")}
                          onChange={(lat, lng) => {
                            form.setValue("latitude", lat);
                            form.setValue("longitude", lng);
                          }}
                        />

                        <FormField
                          control={form.control}
                          name="priceMonthly"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-bold">
                                Yearly Rent (₦)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="h-12 rounded-xl bg-background/50 font-bold text-primary"
                                  type="number"
                                  {...field}
                                />
                              </FormControl>
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
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                          Property Architecture
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 rounded-2xl bg-muted/30 border border-border/40 transition-all hover:border-primary/20">
                        <FormField
                          control={form.control}
                          name="roomType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-bold">
                                Room Category
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-12 rounded-xl bg-background/50">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl border-border/40 backdrop-blur-xl">
                                  <SelectItem
                                    value="SINGLE"
                                    className="rounded-lg"
                                  >
                                    Single Room
                                  </SelectItem>
                                  <SelectItem
                                    value="SELF_CON"
                                    className="rounded-lg"
                                  >
                                    Self-Contained
                                  </SelectItem>
                                  <SelectItem
                                    value="MINI_FLAT"
                                    className="rounded-lg"
                                  >
                                    Mini Flat
                                  </SelectItem>
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
                              <FormLabel className="text-sm font-bold">
                                Availability Date
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="h-12 rounded-xl bg-background/50"
                                  type="date"
                                  {...field}
                                />
                              </FormControl>
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
                                <FormLabel className="text-sm font-bold text-center block">
                                  Total Rooms
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    className="h-12 rounded-xl bg-background/50 text-center text-lg font-bold"
                                    type="number"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="bathrooms"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-bold text-center block">
                                  Total Bathrooms
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    className="h-12 rounded-xl bg-background/50 text-center text-lg font-bold"
                                    type="number"
                                    {...field}
                                  />
                                </FormControl>
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
                            <FormLabel className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                              Listings Description
                            </FormLabel>
                          </div>
                          <FormControl>
                            <Textarea
                              className="rounded-2xl border-border/40 bg-muted/20 focus:bg-background/50 transition-all p-4 min-h-[160px]"
                              placeholder="Provide a detailed and attractive description of your property..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-6 w-1 bg-primary rounded-full" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                          Key Amenities
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-muted/30 border border-border/40">
                        {[
                          { name: "furnished", label: "Furnished" },
                          { name: "wifi", label: "Wi-Fi" },
                          { name: "water", label: "24/7 Water" },
                          { name: "security", label: "Top Security" },
                          {
                            name: "electricityBackup",
                            label: "Solar/Inverter",
                          },
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
                                <FormLabel className="font-bold text-sm cursor-pointer group-hover:text-primary transition-colors">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    {/* ── Section: Property Images ── */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-6 w-1 bg-primary rounded-full" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                          Property Images
                        </h3>
                        <span className="text-xs font-medium text-muted-foreground bg-muted/50 rounded-full px-2.5 py-0.5">
                          {images.length} / {MAX_IMAGES}
                        </span>
                      </div>
                      <div className="p-6 rounded-2xl bg-muted/30 border border-border/40 transition-all hover:border-primary/20 space-y-5">
                        <p className="text-xs text-muted-foreground font-medium">
                          Upload images of your property. The first image will
                          be used as the cover photo. Accepted formats: JPEG,
                          PNG, WebP. Images are automatically compressed to
                          500KB for fast loading.
                        </p>

                        {/* Image previews grid */}
                        {images.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            <AnimatePresence mode="popLayout">
                              {images.map((img, index) => (
                                <motion.div
                                  key={img.id}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{ duration: 0.2 }}
                                  className="relative group aspect-[4/3] rounded-xl overflow-hidden border-2 border-border/40 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md"
                                >
                                  <img
                                    src={img.url}
                                    alt={`Property image ${index + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                  {/* Cover badge for first image */}
                                  {index === 0 && (
                                    <div className="absolute top-1.5 left-1.5 bg-primary/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                                      Cover
                                    </div>
                                  )}
                                  {/* Remove button */}
                                  <button
                                    type="button"
                                    onClick={() => removeImage(img.id)}
                                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-destructive/90 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive hover:scale-110 shadow-lg"
                                    aria-label={`Remove image ${index + 1}`}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                  {/* Overlay gradient */}
                                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* Drop zone */}
                        {images.length < MAX_IMAGES && (
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ${
                              isDragging
                                ? "border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/10"
                                : "border-border/50 hover:border-primary/40 hover:bg-muted/30"
                            } ${images.length > 0 ? "py-8" : "py-14"}`}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept={ACCEPTED_IMAGE_TYPES.join(",")}
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files)
                                  addImageFiles(e.target.files);
                                e.target.value = "";
                              }}
                            />
                            <div className="flex flex-col items-center gap-3 text-center px-4">
                              <div
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                  isDragging
                                    ? "bg-primary/10 text-primary scale-110"
                                    : "bg-muted/50 text-muted-foreground/50"
                                }`}
                              >
                                <ImagePlus className="w-7 h-7" />
                              </div>
                              <div>
                                <p
                                  className={`font-bold text-sm transition-colors ${
                                    isDragging
                                      ? "text-primary"
                                      : "text-foreground"
                                  }`}
                                >
                                  {isDragging
                                    ? "Drop images here"
                                    : images.length > 0
                                      ? "Add more images"
                                      : "Drag & drop your property images"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 font-medium">
                                  or{" "}
                                  <span className="text-primary">
                                    click to browse
                                  </span>{" "}
                                  · up to {MAX_IMAGES - images.length} more
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Upload progress indicator */}
                        {imageUploadProgress && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20"
                          >
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-sm font-medium text-primary">
                              {imageUploadProgress}
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  <div className="flex items-center justify-end gap-5 pt-8 border-t border-border/40">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        navigate(isLandlord ? "/landlord" : "/admin")
                      }
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
                          <span>
                            {isEditMode ? "Update Listing" : "Publish Property"}
                          </span>
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
