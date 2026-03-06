import { useState } from "react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { forgotPassword } from "@/services/auth";
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
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
});

type ForgotPasswordFormValues = z.infer<typeof formSchema>;

export default function ForgotPassword() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsLoading(true);
    try {
      await forgotPassword(values.email);
      setIsSubmitted(true);
      toast({
        title: "Reset link sent",
        description: "Check your email for the password reset link.",
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      toast({ title: "Request failed", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/60 to-background flex items-center justify-center p-4">
      <SEO title="Reset Password" description="Reset your CampusShelter account password." path="/forgot-password" noIndex />
      <div className="w-full max-w-md">
        <Card className="border-border/50 shadow-primary-lg">
          <CardHeader className="space-y-1.5 pb-8 text-center">
            <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 self-start">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to login
            </Link>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
              Forgot password?
            </CardTitle>
            <CardDescription>
              No worries, we'll send you reset instructions.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!isSubmitted ? (
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

                  <Button
                    type="submit"
                    className="w-full gradient-primary hover:opacity-90 text-white font-medium py-6 mt-3 rounded-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="w-12 h-12 text-success" />
                </div>
                <h3 className="text-lg font-medium tracking-tight mb-2">Check your email</h3>
                <p className="text-muted-foreground mb-8">
                  We've sent a password reset link to <span className="font-semibold">{form.getValues("email")}</span>.
                </p>
                <Button variant="outline" className="w-full rounded-full" onClick={() => setIsSubmitted(false)}>
                  Resend Email
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center pb-8 pt-4">
            <Link
              to="/login"
              className="text-sm text-primary hover:text-primary/80 font-medium underline underline-offset-4"
            >
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
