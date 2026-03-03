import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { User, Building2, Check, Mail, Lock, Phone, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

const formSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    phone: z
      .string()
      .min(10, { message: "Enter a valid phone number" })
      .optional(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
    role: z.enum(["STUDENT", "LANDLORD"]),
    idCard: z.any().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms & conditions.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof formSchema>;

export default function SignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register: registerUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const initialRole = (searchParams.get("role")?.toUpperCase() as "STUDENT" | "LANDLORD") || "STUDENT";

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: initialRole,
      acceptTerms: false,
      idCard: undefined,
    },
  });

  const selectedRole = form.watch("role");

  // Sync role from URL if it changes
  useEffect(() => {
    if (searchParams.has("role")) {
      const role = searchParams.get("role")?.toUpperCase();
      if (role === "STUDENT" || role === "LANDLORD") {
        form.setValue("role", role);
      }
    }
  }, [searchParams, form]);

  async function onSubmit(values: SignUpFormValues) {
    if (values.role === "LANDLORD" && !values.idCard) {
      toast({
        title: "ID Required",
        description: "Please upload a government ID to register as a landlord.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let idCardUrl = "";
      if (values.role === "LANDLORD" && values.idCard) {
        const { uploadDocument } = await import("@/services/documents");
        const res = await uploadDocument(values.idCard, "ID_CARD");
        // @ts-ignore - res.data might have url or fileUrl
        idCardUrl = res.data.fileUrl || res.data.url;
      }

      await registerUser({
        name: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
        role: values.role,
        idCardUrl: idCardUrl || undefined,
      } as any);
      toast({ title: "Account created!", description: "Welcome to CampusShelter." });
      navigate(values.role === "LANDLORD" ? "/landlord" : "/properties");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Registration failed. Please try again.";
      toast({ title: "Sign up failed", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4 py-12 md:py-20">
      {/* Abstract Background */}
      <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }} />

      <div className="w-full max-w-xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-10"
        >
          <Link to="/" className="flex items-center gap-3 group">
            <div className="gradient-primary text-white p-2.5 rounded-2xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tight font-display text-gradient-primary">
              CampusShelter
            </h1>
          </Link>
          <p className="text-muted-foreground mt-3 text-sm font-medium tracking-widest uppercase opacity-70">
            Elevating the FUTA Housing Experience
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-50" />

            <CardHeader className="space-y-2 pb-8 pt-10">
              <CardTitle className="text-3xl text-center font-bold tracking-tight font-display">
                {selectedRole === "STUDENT" ? "Create Student Entity" : "Register as Provider"}
              </CardTitle>
              <CardDescription className="text-center font-medium text-muted-foreground/70 max-w-sm mx-auto">
                {selectedRole === "STUDENT"
                  ? "Access the most exclusive student housing network at FUTA"
                  : "Join our elite network of verified property providers"}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 md:px-10 pb-10">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Account Specification</FormLabel>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { id: "STUDENT", label: "Student", desc: "Renter", icon: User },
                            { id: "LANDLORD", label: "Landlord", desc: "Provider", icon: Building2 }
                          ].map((role) => (
                            <button
                              key={role.id}
                              type="button"
                              onClick={() => field.onChange(role.id)}
                              className={cn(
                                "relative flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300",
                                field.value === role.id
                                  ? "border-primary bg-primary/5 shadow-inner"
                                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                              )}
                            >
                              <div className={cn(
                                "p-3 rounded-xl transition-all duration-300",
                                field.value === role.id ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-white/10 text-muted-foreground"
                              )}>
                                <role.icon className="w-6 h-6" />
                              </div>
                              <div className="text-center">
                                <p className="font-bold text-sm tracking-tight">{role.label}</p>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50 mt-0.5">{role.desc}</p>
                              </div>
                              {field.value === role.id && (
                                <motion.div
                                  layoutId="active-role"
                                  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-sm"
                                >
                                  <Check className="w-3 h-3" />
                                </motion.div>
                              )}
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-6">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-primary" />
                      Personal Documentation
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Legal Designation</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Tomilola Adebayo"
                                className="h-14 rounded-2xl bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary/30 transition-all font-medium"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Digital Address</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="you@futa.edu.ng"
                                className="h-14 rounded-2xl bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary/30 transition-all font-medium"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Mobile Link (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="+234 80x xxx xxxx"
                                className="h-14 rounded-2xl bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary/30 transition-all font-medium"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Initialize Key</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                className="h-14 rounded-2xl bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary/30 transition-all font-medium"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Verify Key</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                className="h-14 rounded-2xl bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary/30 transition-all font-medium"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <AnimatePresence>
                      {selectedRole === "LANDLORD" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <FormField
                            control={form.control}
                            name="idCard"
                            render={({ field: { value, onChange, ...field } }) => (
                              <FormItem className="pt-2">
                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Verification Credential (ID)</FormLabel>
                                <FormControl>
                                  <div className="relative group">
                                    <Input
                                      type="file"
                                      accept="image/*,.pdf"
                                      className="h-24 py-8 rounded-2xl bg-white/5 border-white/10 border-dashed border-2 cursor-pointer opacity-0 absolute inset-0 z-10"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) onChange(file);
                                      }}
                                      {...field}
                                    />
                                    <div className={cn(
                                      "h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300",
                                      value ? "bg-success/5 border-success/30" : "bg-white/5 border-white/10 group-hover:border-primary/30"
                                    )}>
                                      {value ? (
                                        <div className="flex items-center gap-2 text-success">
                                          <ShieldCheck className="w-5 h-5" />
                                          <span className="font-bold text-sm">{(value as File).name}</span>
                                        </div>
                                      ) : (
                                        <>
                                          <Building2 className="w-6 h-6 text-muted-foreground/30 mb-1" />
                                          <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">Upload Credentials</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2 ml-1">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="rounded-md border-white/20 data-[state=checked]:bg-primary mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-xs font-bold text-muted-foreground/60 leading-relaxed cursor-pointer">
                            I verify compliance with the
                            <Link to="/terms" className="text-primary hover:text-primary/80 transition-colors mx-1 underline decoration-primary/20">Terms Hierarchy</Link>
                            and acknowledge the
                            <Link to="/privacy" className="text-primary hover:text-primary/80 transition-colors mx-1 underline decoration-primary/20">Privacy Protocol</Link>.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full gradient-primary hover:opacity-95 text-white font-black py-8 mt-4 rounded-2xl shadow-2xl shadow-primary/20 transition-all active:scale-[0.99] uppercase tracking-[0.3em] text-xs"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating Entity...</span>
                      </div>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 mr-3 opacity-70" />
                        Establish Account
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="relative my-12">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="bg-white/10" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-background/40 backdrop-blur-3xl px-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
                    Legacy Connect
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-14 border-white/10 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors font-bold text-xs uppercase tracking-[0.2em]">
                  Google
                </Button>
                <Button variant="outline" className="h-14 border-white/10 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors font-bold text-xs uppercase tracking-[0.2em]">
                  Phone
                </Button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col items-center justify-center text-xs font-bold pt-4 pb-12 bg-white/5">
              <span className="text-muted-foreground/40 uppercase tracking-[0.2em]">Known Entity?</span>
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 transition-colors underline underline-offset-8 decoration-primary/30 mt-3 uppercase tracking-[0.3em]"
              >
                Access Session
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
