import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    title: "Create an account",
    description:
      "Sign up with your email and complete your student profile in minutes.",
  },
  {
    number: "02",
    title: "Search & filter",
    description:
      "Browse verified properties. Filter by location, budget, room type, and amenities.",
  },
  {
    number: "03",
    title: "Visit & inspect",
    description:
      "Book a property tour at your convenience. Get confirmation instantly.",
  },
  {
    number: "04",
    title: "Book & move in",
    description:
      "Reserve your accommodation with secure online payment. Move in hassle-free.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-3">
            How It Works
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Four steps to your new home
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector on desktop */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-[calc(100%+0.5rem)] w-[calc(100%-3.5rem)] border-t-2 border-dashed border-border" />
              )}

              <div className="flex lg:flex-col items-start gap-4">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-white">
                    {step.number}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-base font-semibold text-foreground mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
          >
            Get started now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
