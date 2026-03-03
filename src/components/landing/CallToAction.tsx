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
    <section id="call-to-action" className="py-24 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 gradient-hero" />

          <div className="relative z-10 px-8 py-20 sm:px-14 sm:py-24 lg:px-20">
            <div className="max-w-2xl mx-auto lg:mx-0">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-6">
                Ready to find
                <br />
                your new home?
              </h2>
              <p className="text-white/60 text-lg mb-10 max-w-lg">
                Join thousands of FUTA students who found their perfect
                accommodation through CampusShelter.
              </p>

              <ul className="space-y-3 mb-12">
                {benefits.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-3 text-white/75 text-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-white/50 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-foreground hover:bg-white/90 rounded-full px-7 font-semibold"
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
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full px-7"
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
