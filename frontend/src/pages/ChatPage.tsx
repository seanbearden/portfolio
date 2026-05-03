import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, User, Bot, Loader2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatPage() {
  const [searchParams] = useSearchParams();
  const backend = searchParams.get("backend") || "cr"; // 'cr' for Cloud Run, 'ae' for Agent Engine
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Sean's virtual assistant. I can answer questions about his Ph.D. research in memcomputing, his transition to data science, or his professional experience. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/chat?backend=${backend}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }].map(m => ({
            role: m.role,
            content: m.content
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 flex flex-col h-[calc(100vh-200px)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chat with My Resume</h1>
          <p className="text-muted-foreground mt-1">Ask anything about Sean's career or research.</p>
        </div>
        <Badge variant={backend === "ae" ? "secondary" : "outline"} className="flex gap-1 items-center px-3 py-1">
          <Info className="h-3 w-3" />
          Backend: {backend === "ae" ? "Vertex AI Agent Engine" : "Cloud Run"}
        </Badge>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 bg-card/50 backdrop-blur-sm border-border">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
                  msg.role === "user" ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border"
                )}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={cn(
                  "rounded-2xl px-4 py-2 text-sm leading-relaxed",
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border bg-muted border-border">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl px-4 py-2 text-sm bg-muted flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                Thinking...
              </div>
            </div>
          )}
        </CardContent>

        <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about memcomputing, UCSD, or data science..."
            className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-4">
        This agent uses LangGraph and Gemini 1.5. You can toggle backends by adding <code className="bg-muted px-1 rounded">?backend=ae</code> to the URL.
      </p>
    </div>
  );
}
