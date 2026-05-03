import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, User, Bot, AlertTriangle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  isError?: boolean;
  links?: { name: string; url: string }[];
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          session_id: sessionId,
        }),
      });

      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please wait a moment.");
      }

      if (!response.ok) {
        throw new Error("Failed to reach the agent. Please try again later.");
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: data.response,
        isError: data.safety_trigger,
        links: data.links,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: error.message || "An unexpected error occurred.",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto flex flex-col h-[600px] shadow-xl border-border bg-card/50 backdrop-blur-md">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Chat with Sean's Resume
          <Badge variant="secondary" className="ml-auto text-[10px] px-2 py-0">Phase 2 Beta</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-muted">
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Bot className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Ask me anything about Sean's background!</p>
            <p className="text-sm">Try: "What is Sean's PhD in?" or "What are his top skills?"</p>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex w-max max-w-[80%] flex-col gap-2 rounded-2xl px-4 py-3 text-sm shadow-sm",
              m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted/80 text-foreground",
              m.isError && "border-2 border-destructive/50 bg-destructive/10"
            )}
          >
            <div className="flex items-center gap-2 mb-1 opacity-70">
              {m.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {m.role === "user" ? "You" : "Assistant"}
              </span>
              {m.isError && <AlertTriangle className="h-3 w-3 text-destructive" />}
            </div>
            <p className="leading-relaxed">{m.content}</p>

            {m.links && m.links.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-border/50">
                {m.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-[11px] font-medium transition-colors hover:bg-accent border border-border shadow-sm"
                  >
                    <FileText className="h-3 w-3" />
                    {link.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex w-max max-w-[80%] flex-col gap-2 rounded-2xl px-4 py-3 text-sm bg-muted/80 animate-pulse">
            <div className="flex items-center gap-2 mb-1 opacity-70">
              <Bot className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Assistant</span>
            </div>
            <div className="h-4 w-24 bg-foreground/10 rounded" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className="p-4 border-t bg-muted/30">
        <form onSubmit={handleSend} className="flex w-full items-center gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
