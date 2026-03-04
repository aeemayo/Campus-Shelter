import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CtaIllustration from "@/components/illustrations/CtaIllustration";

const benefits = [
  "No agent fees — deal directly with landlords",
  "Verified properties with real photos",
  "Secure online payments with receipts",
  "24/7 support for students",
];

const CallToAction = () => {
  const { isAuthenticated, user } = useAuth();

  const dashboardLink = user?.role === "LANDLORD" ? "/landlord" : user?.role === "ADMIN" ? "/admin" : "/my-bookings";
  const dashboardLabel = user?.role === "LANDLORD" ? "Go to Dashboard" : user?.role === "ADMIN" ? "Admin Panel" : "My Bookings";

  return (
    <section id="call-to-action" className="py-24 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 gradient-hero" />

          <div className="relative z-10 px-8 py-20 sm:px-14 sm:py-24 lg:px-20">
            <div className="flex items-center justify-between gap-12">
            <div className="max-w-2xl mx-auto lg:mx-0 flex-1">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-6">
                {isAuthenticated ? "Explore your next" : "Ready to find"}
                <br />
                {isAuthenticated ? "perfect residence" : "your new home?"}
              </h2>
              <p className="text-white/60 text-lg mb-10 max-w-lg">
                {isAuthenticated
                  ? "Continue browsing verified properties or manage your account from your dashboard."
                  : "Join thousands of FUTA students who found their perfect accommodation through CampusShelter."}
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
                {isAuthenticated ? (
                  <>
                    <Button
                      asChild
                      size="lg"
                      className="bg-white text-foreground hover:bg-white/90 rounded-full px-7 font-semibold"
                    >
                      <Link to="/properties">
                        Browse Properties
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full px-7"
                    >
                      <Link to={dashboardLink}>{dashboardLabel}</Link>
                    </Button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>

            <div className="hidden lg:block flex-shrink-0 w-[340px] xl:w-[400px]">
              <CtaIllustration className="w-full h-auto" />
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;

