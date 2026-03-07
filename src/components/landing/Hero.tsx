import { Button } from "@/components/ui/button";
import { Search, MapPin, Home, Shield, Users, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import HeroIllustration from "@/components/illustrations/HeroIllustration";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useLocations } from "@/hooks/use-properties";
const propertyTypeItems = ["Self-Contained", "Mini Flat", "Single Room"];
const amenityItems = ["Furnished", "Wi-Fi", "Electricity Backup", "Water Supply", "Security"];

const Hero = () => {
  const navigate = useNavigate();
  const locationItems = useLocations();
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    setOpen(false);
    const query = new URLSearchParams();
    query.set("location", value);
    navigate(`/properties?${query.toString()}`);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchValue.trim()) {
      navigate("/properties");
      return;
    }
    const query = new URLSearchParams();
    query.set("location", searchValue.trim());
    navigate(`/properties?${query.toString()}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.06),_transparent_60%)]" />

      <motion.div
        className="relative z-10 container mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between gap-12">
        <div className="max-w-3xl flex-1">
          {/* Trust signal */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-8"
          >
            <Shield className="w-3.5 h-3.5 text-white/80" />
            <span className="text-white/80 text-xs font-medium tracking-wide">
              Trusted by 2,000+ FUTA students
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.08] tracking-tighter mb-6"
          >
            Student housing,
            <br />
            without the stress.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-white/60 text-lg max-w-xl mb-12 leading-relaxed"
          >
            Verified landlords, real photos, secure payments. Find your next place near FUTA in minutes.
          </motion.p>

          {/* Search */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSearch}
            className="bg-white rounded-xl p-2 shadow-primary-xl max-w-2xl"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <div ref={wrapperRef} className="relative flex-1">
                <Command
                  className="rounded-lg bg-muted/40 overflow-visible"
                  shouldFilter={true}
                >
                  <CommandInput
                    placeholder="Search locations, room types, amenities..."
                    value={searchValue}
                    onValueChange={(value) => {
                      setSearchValue(value);
                      if (!open) setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setOpen(false);
                        (e.target as HTMLInputElement).blur();
                      }
                      if (e.key === "Enter" && !open) {
                        handleSearch();
                      }
                    }}
                    className="h-11 text-sm"
                  />
                  {open && (
                    <CommandList className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-border/60 bg-white shadow-lg">
                      <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
                        No results found. Try a different search.
                      </CommandEmpty>

                      <CommandGroup heading="Locations">
                        {locationItems.map((loc) => (
                          <CommandItem
                            key={loc}
                            value={loc}
                            onSelect={handleSelect}
                            className="gap-2.5 py-2.5 px-3 cursor-pointer"
                          >
                            <MapPin className="w-4 h-4 text-primary/60 shrink-0" />
                            <span className="text-sm">{loc}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>

                      <CommandSeparator />

                      <CommandGroup heading="Property Types">
                        {propertyTypeItems.map((type) => (
                          <CommandItem
                            key={type}
                            value={type}
                            onSelect={handleSelect}
                            className="gap-2.5 py-2.5 px-3 cursor-pointer"
                          >
                            <Home className="w-4 h-4 text-primary/60 shrink-0" />
                            <span className="text-sm">{type}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>

                      <CommandSeparator />

                      <CommandGroup heading="Amenities">
                        {amenityItems.map((amenity) => (
                          <CommandItem
                            key={amenity}
                            value={amenity}
                            onSelect={handleSelect}
                            className="gap-2.5 py-2.5 px-3 cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4 text-primary/60 shrink-0" />
                            <span className="text-sm">{amenity}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  )}
                </Command>
              </div>
              <Button
                type="submit"
                className="h-11 px-6 gradient-primary hover:opacity-90 rounded-lg shrink-0"
              >
                <Search className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>
          </motion.form>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-x-10 gap-y-3 mt-12 text-sm"
          >
            <div className="flex items-center gap-2 text-white/60">
              <Home className="w-4 h-4" />
              <span><strong className="text-white font-semibold">500+</strong> properties</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Shield className="w-4 h-4" />
              <span><strong className="text-white font-semibold">150+</strong> verified landlords</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Users className="w-4 h-4" />
              <span><strong className="text-white font-semibold">2,000+</strong> students housed</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="hidden lg:block flex-shrink-0 w-[400px] xl:w-[480px]"
        >
          <HeroIllustration className="w-full h-auto drop-shadow-2xl" />
        </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
