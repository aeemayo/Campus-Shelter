import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";

const benefits = [
  "No agent fees - deal directly with landlords",
  "Verified properties with real photos",
  "Secure online payments with receipts",
  "24/7 support for students",
];

const CallToAction = () => {
  return (
    <section id="call-to-action" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 gradient-hero" />
          
          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-primary-foreground/10 rounded-full blur-2xl" />

          {/* Content */}
          <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-20 lg:px-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                  Ready to Find Your New Home?
                </h2>
                <p className="text-primary-foreground/80 text-lg mb-8">
                  Join thousands of FUTA students who found their perfect accommodation through CampusShelter. Start your search today!
                </p>
                <ul className="space-y-3 mb-8">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3 text-primary-foreground/90">
                      <CheckCircle className="w-5 h-5 text-accent shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link to="/register">
                      Create Free Account
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                    <Link to="/properties">Browse Properties</Link>
                  </Button>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  {/* Mock Property Cards */}
                  <div className="bg-background rounded-2xl p-4 shadow-primary-xl transform rotate-3 hover:rotate-0 transition-transform">
                    <div className="w-full h-40 bg-muted rounded-xl mb-3" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="flex justify-between items-center pt-2">
                        <div className="h-5 bg-primary/20 rounded w-20" />
                        <div className="h-4 bg-accent/20 rounded w-16" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-4 -left-4 bg-background rounded-2xl p-4 shadow-primary-lg transform -rotate-6 hover:rotate-0 transition-transform">
                    <div className="w-48 h-32 bg-muted rounded-xl mb-3" />
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
