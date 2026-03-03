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
import { User, Building2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
    setIsLoading(true);
    try {
      await registerUser({
        name: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
        role: values.role,
      });
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
    <div className="min-h-screen bg-gradient-to-b from-secondary/60 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-2.5">
            <div className="gradient-primary text-white p-2 rounded-lg shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15.75a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198c.03-.028.061-.056.091-.085L12 5.432z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gradient-primary">
              CampusShelter
            </h1>
          </div>
          <p className="text-muted-foreground mt-1.5 text-sm text-center">
            {selectedRole === "STUDENT"
              ? "Find your perfect home near FUTA"
              : "List your property and reach students"}
          </p>
        </div>

        <Card className="border-border/50 shadow-primary-lg overflow-hidden">
          <CardHeader className="space-y-1.5 pb-6">
            <CardTitle className="text-2xl text-center font-semibold tracking-tight text-foreground">
              {selectedRole === "STUDENT" ? "Join as a Student" : "Register as a Landlord"}
            </CardTitle>
            <CardDescription className="text-center">
              {selectedRole === "STUDENT"
                ? "Join thousands of FUTA students finding safe housing"
                : "Professional management for your student properties"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {/* Role Selection Cards */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select your account type</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => field.onChange("STUDENT")}
                          className={cn(
                            "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left",
                            field.value === "STUDENT"
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border/60 hover:border-border hover:bg-muted/50"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-lg",
                            field.value === "STUDENT" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                          )}>
                            <User className="w-5 h-5" />
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-sm">Student</p>
                            <p className="text-[10px] text-muted-foreground">I want to rent</p>
                          </div>
                          {field.value === "STUDENT" && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => field.onChange("LANDLORD")}
                          className={cn(
                            "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left",
                            field.value === "LANDLORD"
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border/60 hover:border-border hover:bg-muted/50"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-lg",
                            field.value === "LANDLORD" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                          )}>
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-sm">Landlord</p>
                            <p className="text-[10px] text-muted-foreground">I want to list</p>
                          </div>
                          {field.value === "LANDLORD" && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="opacity-50" />

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
                      <FormLabel>Phone Number (optional)</FormLabel>
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
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
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-1">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium leading-none cursor-pointer">
                          I agree to the
                          <Link
                            to="/terms"
                            className="text-primary hover:text-primary/80 underline underline-offset-2 ml-1"
                          >
                            Terms of Service
                          </Link>
                          and
                          <Link
                            to="/privacy"
                            className="text-primary hover:text-primary/80 underline underline-offset-2 ml-1"
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
                  className="w-full gradient-primary hover:opacity-90 text-white font-medium py-6 mt-3 rounded-full shadow-primary-sm"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : selectedRole === "STUDENT" ? "Sign Up as Student" : "Sign Up as Landlord"}
                </Button>
              </form>
            </Form>

            <div className="relative my-8">
              <Separator className="bg-border/60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground/70">
                  or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="border-border rounded-full">
                Google
              </Button>
              <Button variant="outline" className="border-border rounded-full">
                Phone
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center text-sm text-muted-foreground pt-4 pb-8">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 ml-1"
            >
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
