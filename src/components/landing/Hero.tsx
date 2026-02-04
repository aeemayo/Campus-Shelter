import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Home, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 gradient-hero" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-accent/10 rounded-full blur-2xl animate-float" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 animate-fade-in">
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span className="text-primary-foreground text-sm font-medium">
              Trusted by 2,000+ FUTA Students
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Find Your Perfect
            <span className="block text-accent">Student Home</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Discover verified accommodations near FUTA. Safe, affordable housing with trusted landlords, online payments, and seamless booking.
          </p>

          {/* Search Box */}
          <div className="bg-background rounded-2xl p-3 shadow-primary-xl max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Enter location (e.g., Ilesha Road)" 
                  className="pl-10 h-12 border-0 bg-muted/50 focus-visible:ring-primary"
                />
              </div>
              <div className="relative flex-1">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Room type (Self-con, Mini flat...)" 
                  className="pl-10 h-12 border-0 bg-muted/50 focus-visible:ring-primary"
                />
              </div>
              <Button className="h-12 px-8 gradient-primary hover:opacity-90 transition-opacity">
                <Search className="w-5 h-5 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-12 max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="text-center">
              <div className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground">500+</div>
              <div className="text-primary-foreground/70 text-sm">Properties</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground">150+</div>
              <div className="text-primary-foreground/70 text-sm">Verified Landlords</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground">2K+</div>
              <div className="text-primary-foreground/70 text-sm">Happy Students</div>
            </div>
          </div>

          {/* CTA Links */}
          <div className="flex flex-wrap justify-center gap-4 mt-10 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <Button variant="outline" asChild className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
              <Link to="/properties">Browse All Properties</Link>
            </Button>
            <Button variant="ghost" asChild className="text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/for-landlords">List Your Property →</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
