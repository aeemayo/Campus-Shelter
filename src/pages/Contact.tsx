import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
    Mail,
    Phone,
    MapPin,
    Send,
    MessageSquare,
    Clock,
} from "lucide-react";

const contactChannels = [
    {
        icon: Mail,
        title: "Email Us",
        description: "Our team typically replies within 24 hours.",
        detail: "hello@campusshelter.com",
        href: "mailto:hello@campusshelter.com",
    },
    {
        icon: Phone,
        title: "Call Us",
        description: "Mon – Fri, 8 AM – 6 PM WAT.",
        detail: "+234 800 123 4567",
        href: "tel:+2348001234567",
    },
    {
        icon: MapPin,
        title: "Visit Us",
        description: "We're right in the heart of the FUTA community.",
        detail: "FUTA, Akure, Ondo State, Nigeria",
        href: "#",
    },
    {
        icon: Clock,
        title: "Office Hours",
        description: "Monday – Friday",
        detail: "8:00 AM – 6:00 PM WAT",
        href: "#",
    },
];

const Contact = () => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            toast({
                title: "Missing fields",
                description: "Please fill in your name, email, and message.",
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);
        // Simulate submission
        await new Promise((r) => setTimeout(r, 1200));
        setIsSubmitting(false);
        toast({
            title: "Message sent!",
            description:
                "Thank you for reaching out. We'll get back to you as soon as possible.",
        });
        setForm({ name: "", email: "", subject: "", message: "" });
    };

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
                                <MessageSquare className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                                Get in Touch
                            </h1>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Have a question, feedback, or need help? Our team is ready to
                                assist you with anything related to your housing search.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact Channels */}
                <section className="pb-12">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
                            {contactChannels.map((ch) => (
                                <a
                                    key={ch.title}
                                    href={ch.href}
                                    className="group block p-6 rounded-2xl border border-border/60 bg-card hover:shadow-primary-md transition-shadow"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                        <ch.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="font-display text-sm font-semibold text-foreground mb-1">
                                        {ch.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {ch.description}
                                    </p>
                                    <p className="text-sm font-medium text-foreground">
                                        {ch.detail}
                                    </p>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Form */}
                <section className="pb-24 lg:pb-32">
                    <div className="container mx-auto px-4 max-w-2xl">
                        <div className="p-8 sm:p-10 rounded-2xl border border-border/60 bg-card shadow-primary-md">
                            <h2 className="font-display text-xl font-semibold mb-1">
                                Send us a message
                            </h2>
                            <p className="text-sm text-muted-foreground mb-8">
                                Fill out the form below and we'll respond as soon as possible.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="contact-name"
                                            className="text-sm font-medium"
                                        >
                                            Name <span className="text-destructive">*</span>
                                        </label>
                                        <Input
                                            id="contact-name"
                                            name="name"
                                            placeholder="Your full name"
                                            value={form.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="contact-email"
                                            className="text-sm font-medium"
                                        >
                                            Email <span className="text-destructive">*</span>
                                        </label>
                                        <Input
                                            id="contact-email"
                                            name="email"
                                            type="email"
                                            placeholder="you@futa.edu.ng"
                                            value={form.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="contact-subject"
                                        className="text-sm font-medium"
                                    >
                                        Subject
                                    </label>
                                    <Input
                                        id="contact-subject"
                                        name="subject"
                                        placeholder="What is this about?"
                                        value={form.subject}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="contact-message"
                                        className="text-sm font-medium"
                                    >
                                        Message <span className="text-destructive">*</span>
                                    </label>
                                    <Textarea
                                        id="contact-message"
                                        name="message"
                                        placeholder="Tell us how we can help…"
                                        rows={5}
                                        value={form.message}
                                        onChange={handleChange}
                                        className="resize-none"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full gradient-primary hover:opacity-90 text-white font-medium py-6 rounded-full"
                                >
                                    {isSubmitting ? (
                                        "Sending…"
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Send Message
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Contact;
