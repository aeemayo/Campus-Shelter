import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ScrollText } from "lucide-react";

const sections = [
    {
        title: "1. Acceptance of Terms",
        content: `By accessing or using the CampusShelter platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our Service. These terms apply to all users of the platform, including Students, Landlords, and Administrators.`,
    },
    {
        title: "2. Eligibility",
        content: `You must be at least 16 years of age and a student of the Federal University of Technology, Akure (FUTA), or a property owner/agent in the FUTA vicinity, to create an account. By registering, you represent that all information you provide is accurate and up to date.`,
    },
    {
        title: "3. Account Responsibilities",
        content: `You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized access. CampusShelter reserves the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.`,
    },
    {
        title: "4. Property Listings",
        content: `Landlords are solely responsible for the accuracy of their property listings, including descriptions, pricing, images, and availability. CampusShelter reviews listings for quality and compliance but does not guarantee the accuracy of any listing. All listings are subject to admin approval before going live.`,
    },
    {
        title: "5. Bookings & Payments",
        content: `When a Student submits a booking request, it constitutes an intent to lease the property for the specified dates. Bookings are subject to Landlord approval. Payments are processed securely through Paystack. CampusShelter is not a party to the lease agreement between Students and Landlords but facilitates the transaction. Refund eligibility depends on the booking status and the Landlord's cancellation policy.`,
    },
    {
        title: "6. User Conduct",
        content: `You agree not to: (a) use the platform for any unlawful purpose; (b) post false, misleading, or fraudulent content; (c) harass, threaten, or abuse other users; (d) attempt to gain unauthorized access to any part of the Service; (e) scrape, crawl, or extract data from the platform without written permission. Violation of these rules may result in immediate account suspension or termination.`,
    },
    {
        title: "7. Reviews & Content",
        content: `Students may leave reviews and ratings for properties and landlords. Reviews must be honest, relevant, and based on genuine experience. CampusShelter reserves the right to remove reviews that contain hate speech, spam, personally identifiable information, or content that violates these terms. Landlords may respond to reviews publicly.`,
    },
    {
        title: "8. Intellectual Property",
        content: `All content on CampusShelter — including text, design, logos, icons, and software — is the property of CampusShelter or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works from our content without explicit written consent.`,
    },
    {
        title: "9. Limitation of Liability",
        content: `CampusShelter acts as a marketplace connecting Students and Landlords. We do not own, manage, or inspect properties listed on the platform. We are not liable for: (a) the condition, safety, or legality of listed properties; (b) the actions or omissions of any user; (c) any loss or damage arising from the use of our Service beyond what is required by applicable law.`,
    },
    {
        title: "10. Dispute Resolution",
        content: `In the event of a dispute between a Student and a Landlord, both parties should first attempt to resolve the issue through our in-app messaging system. If a resolution cannot be reached, either party may contact our support team for mediation. CampusShelter's decision in any mediated dispute is advisory and non-binding unless otherwise agreed.`,
    },
    {
        title: "11. Modifications to Terms",
        content: `We reserve the right to update or modify these Terms of Service at any time. Changes will be posted on this page with an updated "Last Revised" date. Continued use of the Service after changes constitutes acceptance of the revised terms.`,
    },
    {
        title: "12. Governing Law",
        content: `These Terms of Service are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from these terms shall be subject to the jurisdiction of the courts in Akure, Ondo State.`,
    },
    {
        title: "13. Contact",
        content: `If you have any questions about these Terms of Service, please contact us at hello@campusshelter.com or visit our Contact page.`,
    },
];

const Terms = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main>
                {/* Hero */}
                <section className="relative py-20 lg:py-28 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 to-background" />
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-2xl mx-auto text-center">
                            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                                <ScrollText className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                                Terms of Service
                            </h1>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Please read these terms carefully before using CampusShelter.
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

export default Terms;
