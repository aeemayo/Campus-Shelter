import { 
  Search, 
  Shield, 
  CreditCard, 
  MessageCircle, 
  Calendar, 
  Star 
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Smart Search",
    description: "Filter by location, budget, amenities, and room type. Find exactly what you need near FUTA.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Shield,
    title: "Verified Landlords",
    description: "All landlords are verified with ID and property ownership documents. Your safety is our priority.",
    color: "bg-success/10 text-success",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Pay rent and deposits securely online via Paystack. Cards, bank transfer, or USSD accepted.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Calendar,
    title: "Easy Scheduling",
    description: "Book property tours at your convenience. Get instant confirmations and reminders.",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: MessageCircle,
    title: "Direct Messaging",
    description: "Chat directly with landlords. Ask questions, negotiate, and get quick responses.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Star,
    title: "Reviews & Ratings",
    description: "Read honest reviews from fellow students. Make informed decisions with community feedback.",
    color: "bg-accent/10 text-accent",
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Why Campus Shelter?</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
            Everything You Need to Find Your Home
          </h2>
          <p className="text-muted-foreground">
            We've built the complete platform for FUTA students to find safe, affordable housing with zero hassle.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group p-6 rounded-2xl border border-border bg-card hover:shadow-primary-lg transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
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
