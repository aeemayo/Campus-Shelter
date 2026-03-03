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
import { motion } from "framer-motion";
import { Mail, Lock, Heart, Shield, Sparkles } from "lucide-react";

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
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
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
          <p className="text-muted-foreground mt-3 text-sm font-medium tracking-wide uppercase opacity-70">
            Find your perfect home near FUTA
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-50" />

            <CardHeader className="space-y-2 pb-8 pt-8">
              <CardTitle className="text-3xl text-center font-bold tracking-tight font-display">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center font-medium text-muted-foreground/70">
                Continue your premium housing search
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Email Protocol</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                            <Input
                              type="email"
                              placeholder="you@futa.edu.ng"
                              className="h-14 pl-12 rounded-2xl bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary/30 transition-all font-medium"
                              {...field}
                            />
                          </div>
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
                        <div className="flex items-center justify-between mb-1 ml-1">
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Security Key</FormLabel>
                          <Link
                            to="/forgot-password"
                            className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                          >
                            Reset Key?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                            <Input
                              type="password"
                              className="h-14 pl-12 rounded-2xl bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary/30 transition-all font-medium"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-1 ml-1">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="rounded-md border-white/20 data-[state=checked]:bg-primary"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-xs font-bold text-muted-foreground/80 cursor-pointer">
                            Persistent Session
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full gradient-primary hover:opacity-95 text-white font-black py-7 mt-4 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authorizing...</span>
                      </div>
                    ) : (
                      "Initiate Session"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="bg-white/10" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-background/20 backdrop-blur-xl px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    Neural Bridge
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-12 border-white/10 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors font-bold text-xs uppercase tracking-wider">
                  Google
                </Button>
                <Button variant="outline" className="h-12 border-white/10 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors font-bold text-xs uppercase tracking-wider">
                  Phone
                </Button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col items-center justify-center text-xs font-bold pt-4 pb-10">
              <span className="text-muted-foreground/60 uppercase tracking-widest">Awaiting access?</span>
              <Link
                to="/register"
                className="text-primary hover:text-primary/80 transition-colors underline underline-offset-8 decoration-primary/30 mt-2 uppercase tracking-[0.2em]"
              >
                Create Account
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
