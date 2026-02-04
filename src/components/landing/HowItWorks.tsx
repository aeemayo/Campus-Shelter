import { CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    title: "Create Your Account",
    description: "Sign up with your FUTA email and complete your student profile in minutes.",
    color: "primary",
  },
  {
    number: "02",
    title: "Search & Filter",
    description: "Browse verified properties. Filter by location, budget, room type, and amenities.",
    color: "accent",
  },
  {
    number: "03",
    title: "Schedule a Visit",
    description: "Book a property tour at your convenience. Get confirmation instantly.",
    color: "success",
  },
  {
    number: "04",
    title: "Book & Pay Securely",
    description: "Reserve your accommodation with secure online payment. Move in hassle-free!",
    color: "warning",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">How It Works</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
            Find Your Home in 4 Simple Steps
          </h2>
          <p className="text-muted-foreground">
            We've simplified the house hunting process so you can focus on what matters - your studies.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-0.5 bg-border" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Step Number */}
                <div className={`w-16 h-16 rounded-2xl bg-${step.color} flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-primary-md`}>
                  <span className="font-display text-2xl font-bold text-primary-foreground">
                    {step.number}
                  </span>
                </div>

                {/* Arrow - Desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[calc(100%-1rem)] z-10">
                    <ArrowRight className="w-8 h-8 text-border" />
                  </div>
                )}

                {/* Content */}
                <div className="text-center lg:text-left">
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
