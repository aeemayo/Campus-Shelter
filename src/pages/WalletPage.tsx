import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWallet, fundWallet, type WalletTransaction } from "@/services/wallet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Loader2,
  Home,
  ChevronRight,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const PRESET_AMOUNTS = [1_000, 5_000, 10_000, 50_000];

const txTypeConfig: Record<
  WalletTransaction["type"],
  {
    icon: typeof ArrowDownLeft;
    label: string;
    colorClass: string;
    sign: string;
    badgeVariant: "success" | "destructive" | "outline";
  }
> = {
  FUND: {
    icon: ArrowDownLeft,
    label: "Funded",
    colorClass: "text-emerald-600",
    sign: "+",
    badgeVariant: "success",
  },
  RENT_PAYMENT: {
    icon: ArrowUpRight,
    label: "Rent Payment",
    colorClass: "text-red-500",
    sign: "-",
    badgeVariant: "destructive",
  },
  REFUND: {
    icon: RotateCcw,
    label: "Refund",
    colorClass: "text-emerald-600",
    sign: "+",
    badgeVariant: "success",
  },
};

export default function WalletPage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [fundOpen, setFundOpen] = useState(false);
  const [amount, setAmount] = useState("");

  const { data: walletResponse, isLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: fetchWallet,
    enabled: isAuthenticated,
  });

  const wallet = walletResponse?.data;
  const transactions = wallet?.transactions || [];

  const fundMutation = useMutation({
    mutationFn: (amt: number) => fundWallet(amt),
    onSuccess: (res) => {
      setFundOpen(false);
      setAmount("");
      window.location.href = res.data.authorizationUrl;
    },
    onError: (err: any) => {
      toast({
        title: "Funding failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleFund = () => {
    const parsed = Number(amount);
    if (!parsed || parsed < 500 || parsed > 1_000_000) {
      toast({
        title: "Invalid amount",
        description: "Enter an amount between ₦500 and ₦1,000,000.",
        variant: "destructive",
      });
      return;
    }
    fundMutation.mutate(parsed);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Wallet"
        description="Manage your CampusShelter wallet balance and transactions."
        path="/wallet"
        noIndex
      />
      <Header />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Home className="w-4 h-4" />
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Wallet</span>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Page heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
                My <span className="text-primary">Wallet</span>
              </h1>
              <p className="text-muted-foreground mt-2">
                Fund your wallet and pay for bookings instantly.
              </p>
            </motion.div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Loading wallet...</p>
              </div>
            ) : (
              <>
                {/* Balance Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <Card className="border-border/40 bg-background/60 backdrop-blur-md shadow-primary-md overflow-hidden mb-8">
                    <div className="relative">
                      {/* Gradient background */}
                      <div className="absolute inset-0 gradient-primary opacity-[0.08]" />
                      <CardContent className="relative p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2.5 text-muted-foreground mb-1">
                              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-white" />
                              </div>
                              <p className="text-sm font-medium">
                                Available Balance
                              </p>
                            </div>
                            <p className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-foreground">
                              ₦{(wallet?.balance || 0).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            className="gradient-primary rounded-lg h-11 px-6 text-sm font-semibold shrink-0"
                            onClick={() => setFundOpen(true)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Fund Wallet
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>

                {/* Transaction History */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-display font-bold text-foreground tracking-tight">
                      Transaction <span className="text-primary">History</span>
                    </h2>
                    {transactions.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {transactions.length} transaction
                        {transactions.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>

                  {transactions.length > 0 ? (
                    <Card className="border-border/40 bg-background/60 backdrop-blur-md shadow-primary-md overflow-hidden">
                      <CardContent className="p-0">
                        <div className="divide-y divide-border/40">
                          {transactions.map((tx, i) => {
                            const config = txTypeConfig[tx.type];
                            const Icon = config.icon;

                            return (
                              <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/30 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <Icon className="w-4 h-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-sm">
                                      {tx.description}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {new Date(tx.createdAt).toLocaleDateString(
                                        "en-NG",
                                        {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 pl-12 sm:pl-0">
                                  <Badge variant={config.badgeVariant}>
                                    {config.label}
                                  </Badge>
                                  <div className="text-right">
                                    <p
                                      className={`font-bold text-sm whitespace-nowrap ${config.colorClass}`}
                                    >
                                      {config.sign}₦{tx.amount.toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      Bal: ₦{tx.balanceAfter.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed border-border/60">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Receipt className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 tracking-tight">
                        No transactions yet
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Fund your wallet to get started.
                      </p>
                      <Button
                        className="gradient-primary rounded-lg"
                        onClick={() => setFundOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Fund Wallet
                      </Button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Fund Wallet Dialog */}
      <Dialog open={fundOpen} onOpenChange={(open) => !open && setFundOpen(false)}>
        <DialogContent className="sm:max-w-[420px] rounded-xl">
          <DialogHeader>
            <DialogTitle>Fund Wallet</DialogTitle>
            <DialogDescription>
              Enter an amount or choose a preset to add funds via Paystack.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Amount (₦)</Label>
              <Input
                type="number"
                placeholder="e.g. 5000"
                min={500}
                max={1_000_000}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-lg text-lg font-semibold h-12"
              />
              <p className="text-xs text-muted-foreground">
                Min ₦500 &middot; Max ₦1,000,000
              </p>
            </div>

            {/* Preset amounts */}
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  variant={Number(amount) === preset ? "default" : "outline"}
                  size="sm"
                  className="rounded-lg text-xs"
                  onClick={() => setAmount(String(preset))}
                >
                  ₦{preset.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setFundOpen(false);
                setAmount("");
              }}
              disabled={fundMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              className="gradient-primary rounded-lg"
              disabled={!amount || fundMutation.isPending}
              onClick={handleFund}
            >
              {fundMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              <TrendingUp className="w-4 h-4 mr-1.5" />
              Fund ₦{Number(amount || 0).toLocaleString()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
