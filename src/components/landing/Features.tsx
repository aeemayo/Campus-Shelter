import {
  Search,
  Shield,
  CreditCard,
  MessageCircle,
  Calendar,
  Star,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Smart Search",
    description:
      "Filter by location, budget, amenities, and room type to find exactly what you need.",
  },
  {
    icon: Shield,
    title: "Verified Landlords",
    description:
      "Every landlord is ID-verified with property ownership documents on file.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description:
      "Pay rent online via Paystack — cards, bank transfer, or USSD. Receipts instant.",
  },
  {
    icon: Calendar,
    title: "Easy Scheduling",
    description:
      "Book property tours at your convenience with instant confirmation.",
  },
  {
    icon: MessageCircle,
    title: "Direct Messaging",
    description:
      "Chat directly with landlords. Ask questions and get quick responses.",
  },
  {
    icon: Star,
    title: "Student Reviews",
    description:
      "Read honest reviews from fellow students to make informed decisions.",
  },
];

const Features = () => {
  return (
    <section className="py-24 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-3">
            Why CampusShelter
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Everything you need to find home
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/60 rounded-xl overflow-hidden border border-border/60">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card p-8 lg:p-10"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center mb-5">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
