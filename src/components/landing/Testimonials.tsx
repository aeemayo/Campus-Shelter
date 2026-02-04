import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Adaeze Nwosu",
    role: "400L Computer Science",
    content: "CampusShelter made finding accommodation so easy! I found a great self-con near South Gate within a week. The verified landlord feature gave me peace of mind.",
    rating: 5,
    avatar: "AN",
  },
  {
    name: "Emmanuel Okafor",
    role: "300L Engineering",
    content: "No more stress dealing with agents! I paid my rent online and got my receipt instantly. The whole process was smooth and transparent.",
    rating: 5,
    avatar: "EO",
  },
  {
    name: "Blessing Adekunle",
    role: "200L Biochemistry",
    content: "The search filters are amazing. I found exactly what I needed - a room with stable electricity and good water supply. Highly recommend!",
    rating: 5,
    avatar: "BA",
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Testimonials</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
            What Students Are Saying
          </h2>
          <p className="text-muted-foreground">
            Don't just take our word for it. Hear from FUTA students who found their perfect home.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.name}
              className="bg-card rounded-2xl p-6 border border-border hover:shadow-primary-lg transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="mb-4">
                <Quote className="w-10 h-10 text-primary/20" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground/80 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
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
