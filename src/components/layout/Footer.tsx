import { Link } from "react-router-dom";
import { Home, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Home className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">
                Campus<span className="text-primary">Shelter</span>
              </span>
            </Link>
            <p className="text-background/60 text-sm leading-relaxed max-w-xs">
              Connecting FUTA students with verified landlords. Find your perfect
              home away from home.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Quick Links</h4>
            <nav className="flex flex-col gap-2.5">
              <Link to="/properties" className="text-background/60 hover:text-primary transition-colors text-sm">
                Browse Properties
              </Link>
              <Link to="/how-it-works" className="text-background/60 hover:text-primary transition-colors text-sm">
                How It Works
              </Link>
              <Link to="/for-landlords" className="text-background/60 hover:text-primary transition-colors text-sm">
                List Your Property
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Support</h4>
            <nav className="flex flex-col gap-2.5">
              <Link to="/faq" className="text-background/60 hover:text-primary transition-colors text-sm">
                FAQs
              </Link>
              <Link to="/contact" className="text-background/60 hover:text-primary transition-colors text-sm">
                Contact Us
              </Link>
              <Link to="/terms" className="text-background/60 hover:text-primary transition-colors text-sm">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-background/60 hover:text-primary transition-colors text-sm">
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Contact</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5 text-sm text-background/60">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>FUTA, Akure, Ondo State</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-background/60">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>hello@campusshelter.com</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-background/60">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+234 800 123 4567</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-background/10 text-center text-xs text-background/40">
          &copy; {new Date().getFullYear()} CampusShelter. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
