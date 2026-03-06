import { useState, useMemo, useEffect, useRef } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMessages, sendMessage, ApiMessage } from "@/services/messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Info,
  Loader2,
  MessageSquare,
  ArrowLeft,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const Messages = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { partnerId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");

  // Fetch all messages (to derive conversations)
  const { data: messagesResponse, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: () => fetchMessages(),
    enabled: isAuthenticated,
    refetchInterval: 5000, // Poll every 5s
  });

  // Conversations derivation
  const conversations = useMemo(() => {
    if (!messagesResponse?.data) return [];

    const map = new Map();
    messagesResponse.data.forEach((msg: ApiMessage) => {
      const otherId = msg.senderId === user?.id ? msg.receiverId : msg.senderId;
      const otherUser = msg.senderId === user?.id ? msg.receiver : msg.sender;

      if (!map.has(otherId) || new Date(msg.createdAt) > new Date(map.get(otherId).lastMessage.createdAt)) {
        map.set(otherId, {
          userId: otherId,
          user: otherUser,
          lastMessage: msg,
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  }, [messagesResponse, user?.id]);

  // Selected conversation messages
  const { data: conversationResponse, isLoading: conversationLoading } = useQuery({
    queryKey: ["messages", partnerId],
    queryFn: () => fetchMessages(partnerId),
    enabled: !!partnerId && isAuthenticated,
    refetchInterval: 3000, // Poll faster when in active chat
  });

  const activeMessages = useMemo(() => {
    return conversationResponse?.data?.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ) || [];
  }, [conversationResponse]);

  const activePartner = useMemo(() => {
    if (!partnerId) return null;
    return conversations.find(c => c.userId === partnerId)?.user ||
           (activeMessages.length > 0 ? (activeMessages[0].senderId === partnerId ? activeMessages[0].sender : activeMessages[0].receiver) : null);
  }, [partnerId, conversations, activeMessages]);

  const sendMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ["messages", partnerId] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to send message", description: err.message, variant: "destructive" });
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !partnerId) return;

    sendMutation.mutate({
      receiverId: partnerId,
      content: messageInput.trim(),
    });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessages]);

  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Messages" description="Your CampusShelter messages with landlords and students." path="/messages" noIndex />
      <Header />

      <main className="flex-1 pt-20 pb-4 overflow-hidden h-[calc(100vh-80px)]">
        <div className="container mx-auto h-full px-4 flex gap-6">

          {/* Sidebar: Conversation List */}
          <div className={`w-full lg:w-96 h-full flex-col ${partnerId ? 'hidden lg:flex' : 'flex'}`}>
            <Card className="h-full border-border/60 shadow-primary-sm bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-display font-bold tracking-tight">Messages</h1>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MessageSquare className="w-5 h-5" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-9 bg-muted/40 border-none rounded-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                {messagesLoading ? (
                  <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                ) : conversations.length > 0 ? (
                  <div className="divide-y divide-border/30">
                    {conversations
                      .filter(c => c.user?.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((conv) => (
                      <Link
                        key={conv.userId}
                        to={`/messages/${conv.userId}`}
                        className={`flex items-center gap-4 p-4 hover:bg-primary/5 transition-colors cursor-pointer ${partnerId === conv.userId ? 'bg-primary/5 border-l-4 border-primary' : ''}`}
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary/10 text-primary uppercase">
                            {conv.user?.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold truncate">{conv.user?.name}</span>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {format(new Date(conv.lastMessage.createdAt), 'HH:mm')}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {conv.lastMessage.senderId === user?.id ? 'You: ' : ''}
                            {conv.lastMessage.content}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                      <MessageSquare className="w-8 h-8 text-primary/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                  </div>
                )}
              </ScrollArea>
            </Card>
          </div>

          {/* Chat Window */}
          <div className={`flex-1 h-full flex flex-col ${!partnerId ? 'hidden lg:flex' : 'flex'}`}>
            {partnerId ? (
              <Card className="flex-1 border-border/60 shadow-primary-sm bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col relative">

                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="lg:hidden rounded-full" asChild>
                      <Link to="/messages">
                        <ArrowLeft className="w-5 h-5" />
                      </Link>
                    </Button>
                    <Avatar className="w-10 h-10 border-2 border-primary/10">
                      <AvatarFallback className="bg-primary/10 text-primary uppercase font-bold">
                        {activePartner?.name?.slice(0, 2) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-bold leading-none mb-1 tracking-tight">{activePartner?.name || "User"}</h2>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-success"></span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Online</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
                      <Info className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  {conversationLoading && activeMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {activeMessages.map((msg, idx) => {
                        const isMe = msg.senderId === user?.id;
                        const showDate = idx === 0 ||
                          format(new Date(msg.createdAt), 'yyyy-MM-dd') !== format(new Date(activeMessages[idx-1].createdAt), 'yyyy-MM-dd');

                        return (
                          <div key={msg.id} className="space-y-4">
                            {showDate && (
                              <div className="flex items-center gap-4 py-2">
                                <div className="h-[1px] flex-1 bg-border/30"></div>
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                                  {format(new Date(msg.createdAt), 'MMMM d, yyyy')}
                                </span>
                                <div className="h-[1px] flex-1 bg-border/30"></div>
                              </div>
                            )}
                            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                {!isMe && (
                                  <Avatar className="w-6 h-6 border border-border/60 shrink-0 mb-1">
                                    <AvatarFallback className="text-[8px] bg-muted">
                                      {msg.sender?.name?.slice(0, 1) || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                <div className="space-y-1">
                                  <div className={`p-3 rounded-xl text-sm shadow-primary-sm ${
                                    isMe
                                      ? 'gradient-primary text-white rounded-br-none'
                                      : 'bg-muted/80 backdrop-blur-sm text-foreground rounded-bl-none'
                                  }`}>
                                    {msg.content}
                                  </div>
                                  <p className={`text-[9px] text-muted-foreground ${isMe ? 'text-right' : 'text-left'}`}>
                                    {format(new Date(msg.createdAt), 'HH:mm')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t bg-background/30 backdrop-blur-sm">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      className="flex-1 bg-muted/40 border-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      disabled={sendMutation.isPending}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="rounded-lg gradient-primary shadow-lg shadow-primary/20 aspect-square h-10 w-10 shrink-0"
                      disabled={!messageInput.trim() || sendMutation.isPending}
                    >
                      {sendMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                </div>

              </Card>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <div className="max-w-xs space-y-4">
                  <div className="w-20 h-20 rounded-xl gradient-primary flex items-center justify-center mx-auto opacity-20 rotate-12">
                    <MessageSquare className="w-10 h-10 text-primary-foreground -rotate-12" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">Select a conversation</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Choose a conversation from the left to start chatting with agents or students.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
