import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const faqCategories = [
  {
    title: "Getting Started",
    faqs: [
      {
        q: "What is CampusShelter?",
        a: "CampusShelter is a platform designed specifically for FUTA students to discover, compare, and book verified off-campus accommodation. We connect students directly with vetted landlords, making the housing search simple, transparent, and safe.",
      },
      {
        q: "Who can use CampusShelter?",
        a: "Any FUTA student looking for off-campus housing can sign up as a Student. Property owners and agents in the FUTA vicinity can register as Landlords to list their properties on the platform.",
      },
      {
        q: "Is it free to create an account?",
        a: "Yes! Creating a Student or Landlord account on CampusShelter is completely free. You only pay when you choose to book a property.",
      },
      {
        q: "How do I sign up?",
        a: "Click the 'Get Started' button on the homepage, fill in your name, email, phone number, and password, then select your role (Student or Landlord). You'll be up and running in under a minute.",
      },
    ],
  },
  {
    title: "Searching & Booking",
    faqs: [
      {
        q: "How do I find properties near FUTA?",
        a: "Head to the Properties page and use the filters to narrow results by location (e.g. Ilesha Road, FUTA South Gate, Aule, Obanla), room type (Single Room, Self-Con, Mini Flat), budget range, and amenities like Wi-Fi, water supply, or electricity backup.",
      },
      {
        q: "Can I schedule a physical tour before booking?",
        a: "Absolutely. On any property detail page you can request a tour. The landlord will confirm a convenient time, and you'll receive a notification once it's scheduled.",
      },
      {
        q: "How does the booking process work?",
        a: "Once you've found the right place, click 'Book Now' on the property page, choose your desired lease dates, and submit your booking request. The landlord reviews your request and either approves or suggests changes. You'll be notified every step of the way.",
      },
      {
        q: "Can I cancel a booking?",
        a: "Cancellation policies depend on the landlord's terms. If your booking is still pending approval, you can withdraw it at no cost. Once approved, please refer to the lease agreement for cancellation details.",
      },
    ],
  },
  {
    title: "Payments",
    faqs: [
      {
        q: "What payment methods are supported?",
        a: "We integrate with Paystack, so you can pay via debit/credit card, bank transfer, or USSD — whichever is most convenient for you.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. All payments are processed through Paystack's PCI-DSS compliant infrastructure. CampusShelter never stores your card details directly.",
      },
      {
        q: "Can I pay rent in installments?",
        a: "Some landlords allow split payments. If available, you'll see the installment option during checkout. Otherwise, the full rent amount is due at booking confirmation.",
      },
    ],
  },
  {
    title: "For Landlords",
    faqs: [
      {
        q: "How do I list my property?",
        a: "After registering as a Landlord, navigate to your Landlord Dashboard and click 'Add Property'. Fill in the details — title, location, price, room type, amenities, photos — and submit. An admin will review and approve your listing.",
      },
      {
        q: "Is there a fee to list a property?",
        a: "Listing a property on CampusShelter is currently free. We may introduce optional premium placement features in the future.",
      },
      {
        q: "How do I get paid?",
        a: "Once a student's booking is confirmed and payment is received, funds are automatically disbursed to your registered bank account via Paystack payouts.",
      },
      {
        q: "How do I handle maintenance requests?",
        a: "Students can submit maintenance requests through their profile. You'll see all incoming requests in your Landlord Dashboard, where you can update the status and track resolution.",
      },
    ],
  },
  {
    title: "Safety & Trust",
    faqs: [
      {
        q: "Are the landlords verified?",
        a: "Yes. Every landlord goes through an identity verification process (NIN/ID and property ownership documents) before their listings go live. Verified landlords display a badge on their profile.",
      },
      {
        q: "What if I have a dispute with a landlord?",
        a: "You can report issues through the in-app messaging system or contact our support team. Our admin team reviews disputes and takes appropriate action, including suspending accounts that violate our policies.",
      },
      {
        q: "How do reviews work?",
        a: "After your tenancy, you can rate and review the property and landlord on a 1–5 star scale with written feedback. Landlords can respond to reviews. This helps fellow students make informed decisions.",
      },
    ],
  },
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="FAQ"
        description="Frequently asked questions about using CampusShelter for student housing near FUTA."
        path="/faq"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqCategories.flatMap((category) =>
            category.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
              },
            }))
          ),
        }}
      />
      <Header />
      <main>
        {/* Hero */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 to-background" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="w-7 h-7 text-white" />
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Everything you need to know about finding and booking
                accommodation near FUTA through CampusShelter.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="pb-24 lg:pb-32">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="space-y-12">
              {faqCategories.map((category) => (
                <div key={category.title}>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 rounded-full gradient-primary inline-block" />
                    {category.title}
                  </h2>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.faqs.map((faq, i) => (
                      <AccordionItem
                        key={i}
                        value={`${category.title}-${i}`}
                        className="border border-border/60 rounded-xl px-5 data-[state=open]:shadow-primary-md transition-shadow"
                      >
                        <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-4">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>

            {/* Still have questions */}
            <div className="mt-16 text-center p-8 rounded-2xl bg-secondary/50 border border-border/50">
              <h3 className="font-display text-lg font-semibold mb-2">
                Still have questions?
              </h3>
              <p className="text-muted-foreground text-sm mb-5">
                We're here to help. Reach out to our support team anytime.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 gradient-primary text-white text-sm font-medium px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
