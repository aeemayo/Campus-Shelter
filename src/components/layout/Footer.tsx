import { Link } from "react-router-dom";
import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Home className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">
                Campus<span className="text-primary">Shelter</span>
              </span>
            </Link>
            <p className="text-background/70 text-sm">
              Connecting FUTA students with verified landlords. Find your perfect home away from home.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-background/60 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-lg">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/properties" className="text-background/70 hover:text-primary transition-colors text-sm">
                Browse Properties
              </Link>
              <Link to="/how-it-works" className="text-background/70 hover:text-primary transition-colors text-sm">
                How It Works
              </Link>
              <Link to="/for-landlords" className="text-background/70 hover:text-primary transition-colors text-sm">
                List Your Property
              </Link>
              <Link to="/guides" className="text-background/70 hover:text-primary transition-colors text-sm">
                Student Guides
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-lg">Support</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/faq" className="text-background/70 hover:text-primary transition-colors text-sm">
                FAQs
              </Link>
              <Link to="/contact" className="text-background/70 hover:text-primary transition-colors text-sm">
                Contact Us
              </Link>
              <Link to="/terms" className="text-background/70 hover:text-primary transition-colors text-sm">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-background/70 hover:text-primary transition-colors text-sm">
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-lg">Contact Us</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm text-background/70">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>FUTA, Akure, Ondo State</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-background/70">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>hello@campusshelter.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-background/70">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+234 800 123 4567</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-background/10 text-center text-sm text-background/60">
          <p>© {new Date().getFullYear()} CampusShelter. All rights reserved. Made with ❤️ for FUTA students.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
