import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "1. Introduction",
    content: `CampusShelter ("we", "our", or "us") is committed to protecting the privacy of students, landlords, and all users of our platform. This Privacy Policy explains what personal information we collect, how we use it, who we share it with, and your rights regarding that information. By using CampusShelter, you consent to the data practices described here.`,
  },
  {
    title: "2. Information We Collect",
    content: `We collect information you provide directly when you register and use our platform:

• Account information: Name, email address, phone number, password, and user role (Student or Landlord).
• Profile information: Department, level, preferred areas (Students); property ownership documents, bank details for payouts (Landlords).
• Booking information: Property selections, lease dates, booking requests, and payment transaction records.
• Communications: Messages exchanged through our in-app messaging system, maintenance requests, and reviews.
• Usage data: Pages visited, search queries, filter selections, favourited properties, and browser/device information collected automatically through cookies and similar technologies.`,
  },
  {
    title: "3. How We Use Your Information",
    content: `We use collected information to:

• Provide, maintain, and improve the CampusShelter platform.
• Create and manage your account and authenticate your identity.
• Process bookings and facilitate payments between Students and Landlords via Paystack.
• Enable communication between users through in-app messaging.
• Send notifications about bookings, payment confirmations, lease renewals, and new listings.
• Display personalised property recommendations based on your search history and preferences.
• Verify Landlord identity and property ownership for trust and safety.
• Monitor platform activity to detect fraud, abuse, and policy violations.
• Generate aggregated analytics (e.g., popular locations, booking trends) to improve the service.`,
  },
  {
    title: "4. Information Sharing",
    content: `We do not sell your personal information. We may share it in the following circumstances:

• With other users: Your name and profile information are visible to other users as needed (e.g., a Student sees the Landlord's name and contact on a property listing; a Landlord sees the Student's name when they submit a booking).
• Payment processors: Payment data is shared with Paystack to process transactions securely. CampusShelter does not store your card or bank account numbers.
• Service providers: We may use third-party services for hosting, analytics, or email delivery that process data on our behalf under strict confidentiality agreements.
• Legal requirements: We may disclose information if required by law, regulation, or legal process, or to protect the rights, safety, and property of CampusShelter and its users.`,
  },
  {
    title: "5. Data Storage & Security",
    content: `Your data is stored on secure, cloud-hosted infrastructure. We implement industry-standard security measures including encrypted connections (HTTPS), secure password hashing, and access controls to protect your information. While no method of transmission over the internet is 100% secure, we continuously review and improve our security practices.`,
  },
  {
    title: "6. Cookies & Local Storage",
    content: `CampusShelter uses browser local storage to persist your authentication session, remember your search preferences, and store your favourited properties for a personalised experience. We may also use cookies for analytics purposes. You can clear local storage and cookies through your browser settings, though this may affect platform functionality.`,
  },
  {
    title: "7. Your Rights",
    content: `Depending on your location, you may have the following rights regarding your personal data:

• Access: Request a copy of the personal data we hold about you.
• Correction: Request corrections to inaccurate or incomplete data.
• Deletion: Request deletion of your account and associated data, subject to legal retention requirements.
• Portability: Request your data in a machine-readable format.
• Objection: Object to certain data processing activities.

To exercise any of these rights, please contact us at hello@campusshelter.com.`,
  },
  {
    title: "8. Data Retention",
    content: `We retain your personal information for as long as your account is active or as needed to provide you with our services. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law (e.g., financial records for tax purposes). Anonymised and aggregated data may be retained indefinitely for analytics.`,
  },
  {
    title: "9. Children's Privacy",
    content: `CampusShelter is intended for users who are at least 16 years old. We do not knowingly collect personal information from anyone under the age of 16. If we discover that we have inadvertently collected data from a user under 16, we will delete it promptly.`,
  },
  {
    title: "10. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes by posting a notice on the platform and updating the "Last Revised" date below. Continued use of the Service after any changes constitutes your acceptance of the revised policy.`,
  },
  {
    title: "11. Contact Us",
    content: `If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:

Email: hello@campusshelter.com
Phone: +234 800 123 4567
Address: FUTA, Akure, Ondo State, Nigeria`,
  },
];

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Privacy Policy" description="How CampusShelter collects, uses, and protects your personal data." path="/privacy" />
      <Header />
      <main>
        {/* Hero */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 to-background" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                How we collect, use, and protect your information on
                CampusShelter.
              </p>
              <p className="text-sm text-muted-foreground/70 mt-3">
                Last revised: March 1, 2026
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="pb-24 lg:pb-32">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="space-y-10">
              {sections.map((section) => (
                <div key={section.title}>
                  <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                    {section.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
