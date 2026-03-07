import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Home, CalendarCheck, Key, UserPlus, ImagePlus, Clock,
  BarChart3, MessageSquare, Star, Shield, Bell, Heart, ArrowRight,
  ChevronRight, Wrench, FileText, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";

const studentSteps = [
  {
    icon: UserPlus,
    title: "Create your account",
    description: "Sign up with your email, verify your student ID, and complete your profile in under a minute.",
  },
  {
    icon: Search,
    title: "Search & filter",
    description: "Browse verified properties near FUTA. Filter by location, budget, room type, and amenities like Wi-Fi or water supply.",
  },
  {
    icon: CalendarCheck,
    title: "Book an inspection",
    description: "Pick from the landlord's available time slots and request a property tour. Get confirmation via messages.",
  },
  {
    icon: Key,
    title: "Book & move in",
    description: "Reserve your accommodation, sign your lease online, and move in hassle-free.",
  },
];

const landlordSteps = [
  {
    icon: UserPlus,
    title: "Register as a landlord",
    description: "Create your account, submit verification documents, and get approved by our admin team.",
  },
  {
    icon: ImagePlus,
    title: "List your property",
    description: "Add photos, set your price, describe amenities, and specify the location. Your listing goes live after approval.",
  },
  {
    icon: Clock,
    title: "Set inspection slots",
    description: "Define available time slots for property tours. Students pick a slot and you get notified instantly.",
  },
  {
    icon: BarChart3,
    title: "Manage bookings",
    description: "Review booking requests, approve or decline, upload lease documents, and track maintenance requests from your dashboard.",
  },
];

const studentFeatures = [
  { icon: Search, title: "Smart search", description: "Search by property name, location, or amenities with instant autocomplete suggestions." },
  { icon: Heart, title: "Save favorites", description: "Bookmark properties you love. Your favorites sync across devices when you're logged in." },
  { icon: MessageSquare, title: "Direct messaging", description: "Chat directly with landlords. Ask questions, negotiate, or coordinate inspections." },
  { icon: Bell, title: "Booking notifications", description: "Get notified when your booking status changes — approved, declined, or pending." },
  { icon: Star, title: "Rate & review", description: "After moving in, rate your stay and leave a review to help fellow students." },
  { icon: Wrench, title: "Report issues", description: "Submit maintenance requests directly from your bookings page." },
];

const landlordFeatures = [
  { icon: Home, title: "Property dashboard", description: "View all your listings, occupancy status, and inspection slot counts at a glance." },
  { icon: FileText, title: "Lease management", description: "Upload lease documents for approved bookings. Students can view and download them." },
  { icon: MessageSquare, title: "Tenant messaging", description: "Communicate with prospective and current tenants directly through the platform." },
  { icon: CheckCircle2, title: "Booking control", description: "Approve or decline booking requests. See student contact info and verification status." },
  { icon: Wrench, title: "Maintenance tracking", description: "Receive and manage maintenance reports from tenants with full descriptions." },
  { icon: Shield, title: "Verified badge", description: "Complete verification to earn a trusted landlord badge, boosting student confidence." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState<"student" | "landlord">("student");
  const { isAuthenticated, user } = useAuth();

  const steps = activeTab === "student" ? studentSteps : landlordSteps;
  const features = activeTab === "student" ? studentFeatures : landlordFeatures;

  const ctaLink = isAuthenticated
    ? user?.role === "LANDLORD" ? "/landlord" : "/properties"
    : "/register";
  const ctaLabel = isAuthenticated
    ? user?.role === "LANDLORD" ? "Go to dashboard" : "Browse properties"
    : "Get started free";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="How It Works"
        description="Learn how CampusShelter connects FUTA students with verified landlords. See the step-by-step process for finding and listing accommodation."
        path="/how-it-works"
      />
      <Header bgColor="white" />

      {/* Hero */}
      <section className="pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Home className="w-4 h-4" />
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">How It Works</span>
          </div>

          <div className="max-w-2xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
              How <span className="text-primary">CampusShelter</span> Works
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Whether you're a student searching for your next home or a landlord looking to fill vacancies, here's how the platform works for you.
            </p>
          </div>
        </div>
      </section>

      {/* Tab switcher */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="inline-flex rounded-lg bg-muted p-1 gap-1">
            <button
              onClick={() => setActiveTab("student")}
              className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === "student"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              I'm a Student
            </button>
            <button
              onClick={() => setActiveTab("landlord")}
              className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === "landlord"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              I'm a Landlord
            </button>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-foreground tracking-tight mb-10">
            {activeTab === "student" ? "Find your home in 4 steps" : "Start earning in 4 steps"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={`${activeTab}-step-${i}`}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative rounded-xl border border-border bg-white p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-white">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <step.icon className="w-5 h-5 text-primary/60" />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>

                {/* Connector line on desktop */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-6 border-t-2 border-dashed border-border" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-foreground tracking-tight mb-3">
            {activeTab === "student" ? "Built for students" : "Tools for landlords"}
          </h2>
          <p className="text-muted-foreground text-sm mb-10 max-w-lg">
            {activeTab === "student"
              ? "Everything you need to find, compare, and secure your ideal accommodation."
              : "Everything you need to list, manage, and fill your properties efficiently."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={`${activeTab}-feat-${i}`}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex gap-4 rounded-xl border border-border bg-white p-5"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <feat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">
                    {feat.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-4">
            Ready to {activeTab === "student" ? "find your home" : "list your property"}?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {activeTab === "student"
              ? "Join thousands of FUTA students who found their perfect accommodation through CampusShelter."
              : "Reach verified FUTA students looking for accommodation. List your property in minutes."}
          </p>
          <Button asChild size="lg" className="gradient-primary hover:opacity-90">
            <Link to={ctaLink} className="gap-2">
              {ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;
