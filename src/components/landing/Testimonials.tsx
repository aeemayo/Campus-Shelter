import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Adaeze Nwosu",
    role: "400L Computer Science",
    content:
      "Found a great self-con near South Gate within a week. The verified landlord feature gave me so much peace of mind — no more agent wahala.",
    rating: 5,
    initials: "AN",
  },
  {
    name: "Emmanuel Okafor",
    role: "300L Engineering",
    content:
      "Paid my rent online and got my receipt instantly. No more chasing landlords for paper receipts. The whole process was smooth.",
    rating: 5,
    initials: "EO",
  },
  {
    name: "Blessing Adekunle",
    role: "200L Biochemistry",
    content:
      "The search filters are amazing. I found exactly what I needed — a room with stable light and water. Highly recommend to every FUTA student.",
    rating: 5,
    initials: "BA",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-3">
            Testimonials
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Hear from FUTA students
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-card rounded-xl border border-border/60 p-7 flex flex-col shadow-primary-sm"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-warning fill-warning"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground/70 text-sm leading-relaxed flex-1 mb-7">
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-border/60">
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate">
                    {t.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
