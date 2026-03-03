import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";

const benefits = [
  "No agent fees — deal directly with landlords",
  "Verified properties with real photos",
  "Secure online payments with receipts",
  "24/7 support for students",
];

const CallToAction = () => {
  return (
    <section id="call-to-action" className="py-20">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 gradient-hero" />

          <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-20 lg:px-20">
            <div className="max-w-2xl mx-auto lg:mx-0">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
                Ready to find
                <br />
                your new home?
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-lg">
                Join thousands of FUTA students who found their perfect
                accommodation through CampusShelter.
              </p>

              <ul className="space-y-2.5 mb-10">
                {benefits.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-2.5 text-white/85 text-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl"
                >
                  <Link to="/register">
                    Create free account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                >
                  <Link to="/properties">Browse properties</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
