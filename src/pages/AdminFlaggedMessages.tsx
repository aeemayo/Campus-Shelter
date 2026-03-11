import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchFlaggedMessages, unflagMessage, type ApiMessage } from "@/services/messages";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  AlertTriangle,
  Search,
  Loader2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";

export default function AdminFlaggedMessages() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-flagged-messages", page, search],
    queryFn: () => fetchFlaggedMessages(page, search || undefined),
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => unflagMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-flagged-messages"] });
      toast({ title: "Message resolved", description: "The message has been unflagged successfully." });
    },
    onError: (err: any) => {
      toast({
        title: "Failed to resolve",
        description: err?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const messages = data?.data ?? [];
  const meta = data?.meta;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Flagged Messages" noIndex />
      <Header bgColor="white" />

      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 gap-1.5"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Flagged Messages</h1>
                <p className="text-sm text-muted-foreground">
                  Messages flagged for containing possible bank account numbers
                </p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or content..."
                  className="pl-9 w-64"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Button type="submit" size="sm">Search</Button>
            </form>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
            </div>
          ) : messages.length === 0 ? (
            <Card className="border-border/40">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold">No flagged messages</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {search ? "No results match your search." : "No messages have been flagged yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {messages.map((msg: ApiMessage) => (
                <Card key={msg.id} className="border-amber-200/60 dark:border-amber-800/40 bg-amber-50/30 dark:bg-amber-950/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="outline" className="text-xs font-medium">
                            From: {msg.sender?.name ?? "Unknown"}
                          </Badge>
                          <span className="text-muted-foreground text-xs">→</span>
                          <Badge variant="outline" className="text-xs font-medium">
                            To: {msg.receiver?.name ?? "Unknown"}
                          </Badge>
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[10px]">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Flagged
                          </Badge>
                        </div>

                        <div className="p-3 rounded-lg bg-background border border-border/40 mb-2">
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>
                            {msg.flaggedAt && format(new Date(msg.flaggedAt), "MMM d, yyyy HH:mm")}
                          </span>
                          {msg.flagReason && (
                            <span className="text-amber-600 dark:text-amber-400">
                              {msg.flagReason}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 gap-1.5 text-green-700 border-green-300 hover:bg-green-50 hover:text-green-800 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/40"
                        disabled={resolveMutation.isPending}
                        onClick={() => resolveMutation.mutate(msg.id)}
                      >
                        {resolveMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        Resolve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
