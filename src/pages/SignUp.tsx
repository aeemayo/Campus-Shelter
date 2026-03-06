import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

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
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  Building2,
  Check,
  Home,
  Upload,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

interface EyeButtonProps {
  showPassword: boolean;
  onSetShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
}
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { register: registerUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const initialRole =
    (searchParams.get("role")?.toUpperCase() as "STUDENT" | "LANDLORD") ||
    "STUDENT";

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
        const { compressImage } = await import("@/lib/image-compress");
        const compressedFile = await compressImage(values.idCard);
        const res = await uploadDocument(compressedFile, "ID_CARD");
        idCardUrl = res.data.url;
      }

      await registerUser({
        name: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
        role: values.role,
        idCardUrl: idCardUrl || undefined,
      });
      toast({
        title: "Account created!",
        description: "Welcome to CampusShelter.",
      });
      navigate(values.role === "LANDLORD" ? "/landlord" : "/properties");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Registration failed. Please try again.";
      toast({
        title: "Sign up failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/60 to-background flex items-center justify-center p-4 py-12">
      <SEO title="Create Account" description="Sign up for CampusShelter to find or list student accommodation near FUTA." path="/register" />
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <Home className="w-4.5 h-4.5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Campus<span className="text-primary">Shelter</span>
            </h1>
          </Link>
          <p className="text-muted-foreground mt-2 text-sm">
            Student housing made simple
          </p>
        </div>

        <Card className="border-border/50 shadow-primary-lg">
          <CardHeader className="space-y-1.5 pb-6 text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Create your account
            </CardTitle>
            <CardDescription>
              {selectedRole === "STUDENT"
                ? "Sign up to find and book student accommodation near FUTA"
                : "Register as a landlord to list your properties"}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>I am a</FormLabel>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {
                            id: "STUDENT",
                            label: "Student",
                            desc: "Looking for accommodation",
                            icon: User,
                          },
                          {
                            id: "LANDLORD",
                            label: "Landlord",
                            desc: "Listing my property",
                            icon: Building2,
                          },
                        ].map((role) => (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => {
                              field.onChange(role.id);
                              setSearchParams(
                                { role: role.id.toLowerCase() },
                                { replace: true },
                              );
                            }}
                            className={cn(
                              "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                              field.value === role.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/30",
                            )}
                          >
                            <div
                              className={cn(
                                "p-2.5 rounded-lg transition-colors",
                                field.value === role.id
                                  ? "bg-primary text-white"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              <role.icon className="w-5 h-5" />
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-sm">
                                {role.label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {role.desc}
                              </p>
                            </div>
                            {field.value === role.id && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Tomilola Adebayo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@futa.edu.ng"
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
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+234 80x xxx xxxx"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword === true ? `text` : `password`}
                              {...field}
                            />
                            <EyeComponent
                              showPassword={showPassword}
                              onSetShowPassword={setShowPassword}
                            />
                          </div>
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
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={
                                showPasswordConfirm === true
                                  ? `text`
                                  : `password`
                              }
                              {...field}
                            />
                            <EyeComponent
                              showPassword={showPasswordConfirm}
                              onSetShowPassword={setShowPasswordConfirm}
                            />
                          </div>
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
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <FormField
                        control={form.control}
                        name="idCard"
                        render={({ field: { value, onChange, ...field } }) => (
                          <FormItem>
                            <FormLabel>Government ID</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="file"
                                  accept="image/*,.pdf"
                                  className="opacity-0 absolute inset-0 z-10 cursor-pointer h-20"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) onChange(file);
                                  }}
                                  {...field}
                                />
                                <div
                                  className={cn(
                                    "h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-colors",
                                    value
                                      ? "bg-green-50 border-green-300 dark:bg-green-950/20 dark:border-green-700"
                                      : "border-border hover:border-primary/40",
                                  )}
                                >
                                  {value ? (
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                      <Check className="w-4 h-4" />
                                      <span className="text-sm font-medium">
                                        {(value as File).name}
                                      </span>
                                    </div>
                                  ) : (
                                    <>
                                      <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                                      <span className="text-xs text-muted-foreground">
                                        Upload your ID (image or PDF)
                                      </span>
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

                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <div className="leading-none">
                        <FormLabel className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                          I agree to the{" "}
                          <Link
                            to="/terms"
                            className="text-primary hover:text-primary/80 underline underline-offset-2"
                          >
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link
                            to="/privacy"
                            className="text-primary hover:text-primary/80 underline underline-offset-2"
                          >
                            Privacy Policy
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full gradient-primary hover:opacity-90 text-white font-medium py-6 mt-2 rounded-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating account...
                    </div>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex justify-center pb-8 pt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to={`/login${selectedRole === "LANDLORD" ? "?role=landlord" : ""}`}
                className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function EyeComponent({ showPassword, onSetShowPassword }: EyeButtonProps) {
  if (showPassword) {
    return (
      <Eye
        className="absolute right-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground cursor-pointer"
        onClick={() => onSetShowPassword((p) => !p)}
      />
    );
  } else {
    return (
      <EyeOff
        className="absolute right-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground cursor-pointer"
        onClick={() => onSetShowPassword((p) => !p)}
      />
    );
  }
}
