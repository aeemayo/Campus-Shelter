import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Home, Shield, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [roomType, setRoomType] = useState("");

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = new URLSearchParams();
    if (location.trim()) query.set("location", location.trim());
    if (roomType.trim()) query.set("roomType", roomType.trim());
    const search = query.toString();
    navigate(search ? `/properties?${search}` : "/properties");
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
        <div className="max-w-3xl">
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
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Location (e.g. Ilesha Road)"
                  className="pl-9 h-11 border-0 bg-muted/40 rounded-lg text-sm focus-visible:ring-1 focus-visible:ring-primary"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="relative flex-1">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Room type (Self-con, Mini flat...)"
                  className="pl-9 h-11 border-0 bg-muted/40 rounded-lg text-sm focus-visible:ring-1 focus-visible:ring-primary"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                />
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
      </motion.div>
    </section>
  );
};

export default Hero;
