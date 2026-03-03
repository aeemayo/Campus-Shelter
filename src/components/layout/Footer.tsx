import { Link } from "react-router-dom";
import { Home, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Home className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight">
                Campus<span className="text-primary">Shelter</span>
              </span>
            </Link>
            <p className="text-background/50 text-sm leading-relaxed max-w-xs">
              Connecting FUTA students with verified landlords. Find your perfect
              home away from home.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h4 className="font-semibold text-sm tracking-wide uppercase text-background/70">Quick Links</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/properties" className="text-background/50 hover:text-background transition-colors text-sm">
                Browse Properties
              </Link>
              <Link to="/how-it-works" className="text-background/50 hover:text-background transition-colors text-sm">
                How It Works
              </Link>
              <Link to="/for-landlords" className="text-background/50 hover:text-background transition-colors text-sm">
                List Your Property
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-5">
            <h4 className="font-semibold text-sm tracking-wide uppercase text-background/70">Support</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/faq" className="text-background/50 hover:text-background transition-colors text-sm">
                FAQs
              </Link>
              <Link to="/contact" className="text-background/50 hover:text-background transition-colors text-sm">
                Contact Us
              </Link>
              <Link to="/terms" className="text-background/50 hover:text-background transition-colors text-sm">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-background/50 hover:text-background transition-colors text-sm">
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <h4 className="font-semibold text-sm tracking-wide uppercase text-background/70">Contact</h4>
            <div className="flex flex-col gap-3.5">
              <div className="flex items-start gap-3 text-sm text-background/50">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>FUTA, Akure, Ondo State</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-background/50">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>hello@campusshelter.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-background/50">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+234 800 123 4567</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-background/10 text-center text-sm text-background/30">
          &copy; {new Date().getFullYear()} CampusShelter. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
