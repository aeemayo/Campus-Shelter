import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
  rememberMe: z.boolean().optional(),
});

type SignInFormValues = z.infer<typeof formSchema>;

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: SignInFormValues) {
    setIsLoading(true);
    try {
      await login({ email: values.email, password: values.password });
      toast({ title: "Welcome back!", description: "You've signed in successfully." });
      navigate("/properties");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      toast({ title: "Sign in failed", description: message, variant: "destructive" });
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
            Find your perfect home near FUTA
          </p>
        </div>

        <Card className="border-border/50 shadow-primary-lg">
          <CardHeader className="space-y-1.5 pb-8">
            <CardTitle className="text-2xl text-center font-semibold tracking-tight text-foreground">
              Sign in to your account
            </CardTitle>
            <CardDescription className="text-center">
              Access your dashboard and continue your housing search
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link
                          to="/forgot-password"
                          className="text-sm text-primary hover:text-primary/80 underline underline-offset-2"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-1">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium leading-none cursor-pointer">
                          Remember me
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full gradient-primary hover:opacity-90 text-white font-medium py-6 mt-3 rounded-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
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
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 ml-1"
            >
              Sign up
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
