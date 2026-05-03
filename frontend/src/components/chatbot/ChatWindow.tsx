import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatWindow() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Sean's AI assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [lastUserMessage, setLastUserMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const shouldReduce = useReducedMotion();

  // Cancel any in-flight stream when the component unmounts. Without this,
  // a long-running stream would keep updating state on a dead component
  // (warning) and waste bandwidth.
  React.useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const scrollToBottom = React.useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle textarea auto-resize
  React.useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = async (e?: React.FormEvent, retryMessage?: string) => {
    e?.preventDefault();
    const userMessage = (retryMessage || input).trim();
    if (!userMessage || isLoading) return;

    // Cancel any prior in-flight stream before starting a new one.
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Determine the messages to send + the next render state. On retry, drop
    // any partial assistant turn so we don't send malformed history.
    let nextMessages: Message[];
    if (retryMessage) {
      const last = messages[messages.length - 1];
      nextMessages =
        last && last.role === "assistant" && !last.content
          ? messages.slice(0, -1)
          : messages;
    } else {
      setInput("");
      setLastUserMessage(userMessage);
      nextMessages = [...messages, { role: "user", content: userMessage }];
    }
    setMessages(nextMessages);

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Too many requests. Please try again later.");
        }
        throw new Error("Failed to connect to the chatbot. Please try again.");
      }

      if (!response.body) {
        throw new Error("No response body received.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let partialLine = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = (partialLine + chunk).split("\n");
        partialLine = lines.pop() || "";

        // Accumulate content from ALL lines in this chunk, then do one
        // setMessages per chunk instead of per token. Prior code triggered
        // a re-render for every parsed line, which is excessive on a busy
        // stream.
        let chunkContent = "";
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;

          const data = trimmedLine.slice(6);
          if (data === "[DONE]") break;

          let content = data;
          try {
            if (data.startsWith("{") && data.endsWith("}")) {
              const parsed = JSON.parse(data);
              content = parsed.content || parsed.text || data;
            }
          } catch {
            // Keep raw
          }
          chunkContent += content;
        }

        if (chunkContent) {
          assistantContent += chunkContent;
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.role === "assistant") {
              newMessages[newMessages.length - 1] = {
                ...lastMsg,
                content: assistantContent,
              };
            }
            return newMessages;
          });
        }
      }
    } catch (err) {
      // AbortError is expected when we cancel a prior stream or when the
      // component unmounts mid-stream. Don't show it to the user.
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      // Remove empty assistant placeholder if it was added before the throw.
      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].role === "assistant" && !prev[prev.length - 1].content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hi! I'm Sean's AI assistant. How can I help you today?",
      },
    ]);
    setError(null);
    setInput("");
  };

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col max-w-[90%] rounded-2xl px-4 py-2 text-sm shadow-sm",
              msg.role === "user"
                ? "ml-auto bg-primary text-primary-foreground rounded-tr-none"
                : "mr-auto bg-card border border-border rounded-tl-none"
            )}
          >
            <div
              className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted prose-pre:p-2 prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80"
              aria-live={msg.role === "assistant" && i === messages.length - 1 ? "polite" : "off"}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && !messages[messages.length - 1].content && (
          <div className="mr-auto bg-card border border-border rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 shadow-sm" aria-label="Thinking...">
             <span className={cn("h-1.5 w-1.5 rounded-full bg-muted-foreground/40", !shouldReduce && "animate-bounce")} />
             <span className={cn("h-1.5 w-1.5 rounded-full bg-muted-foreground/40", !shouldReduce && "animate-bounce [animation-delay:0.2s]")} />
             <span className={cn("h-1.5 w-1.5 rounded-full bg-muted-foreground/40", !shouldReduce && "animate-bounce [animation-delay:0.4s]")} />
          </div>
        )}
        {error && (
          <div className="mx-auto max-w-[90%] rounded-lg bg-destructive/10 p-3 text-center text-xs text-destructive border border-destructive/20 shadow-sm">
            <p>{error}</p>
            <Button
              variant="link"
              size="xs"
              onClick={() => handleSend(undefined, lastUserMessage)}
              className="mt-1 h-auto p-0 text-destructive font-bold underline"
            >
              Retry
            </Button>
          </div>
        )}
      </div>

      <div className="border-t bg-background p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <form
          onSubmit={handleSend}
          className="relative flex items-end gap-2"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={resetChat}
            className="shrink-0 h-9 w-9 rounded-full text-muted-foreground hover:bg-muted"
            title="Reset conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="w-full resize-none rounded-2xl border border-input bg-muted/50 px-4 py-2.5 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary max-h-32 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 rounded-full p-1.5 text-primary hover:bg-primary/10 disabled:text-muted-foreground disabled:hover:bg-transparent transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>
        <p className="mt-2 text-[10px] text-center text-muted-foreground">
          AI assistant may provide inaccurate info. Verify important facts.
        </p>
      </div>
    </div>
  );
}
