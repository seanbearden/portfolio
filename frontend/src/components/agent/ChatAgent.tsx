import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: Date;
}

interface ChatAgentProps {
  /**
   * If true, the component will take up the full width/height of its container
   * and will not use fixed positioning. Useful for iframes.
   */
  embedded?: boolean;
}

export function ChatAgent({ embedded = false }: ChatAgentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm Sean's portfolio agent. How can I help you today?",
      sender: "agent",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    // Notify parent about open/close state if embedded
    if (window.parent !== window) {
      window.parent.postMessage({ type: "chat-agent:state", isOpen }, "*");
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");

    // Simulate agent response (Placeholder logic)
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm currently a placeholder. Phase 2 will bring my full intelligence online! You can reach Sean at seanbearden@seanbearden.com.",
        sender: "agent",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentResponse]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const toggleChat = () => setIsOpen(!isOpen);

  const chatWindow = (
    <Card className={cn(
      "flex flex-col overflow-hidden shadow-2xl border-primary/20",
      embedded ? "h-svh w-full rounded-none border-none" : "h-[500px] w-[350px] sm:w-[400px]"
    )}>
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b p-4 bg-primary text-primary-foreground">
        <div className="flex items-center gap-2 font-semibold">
          <MessageSquare className="h-5 w-5" />
          <span>Portfolio Agent</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary-foreground/10 text-primary-foreground" onClick={toggleChat} aria-label="Minimize chat">
            <Minus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary-foreground/10 text-primary-foreground" onClick={toggleChat} aria-label="Close chat">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col max-w-[85%] rounded-2xl p-3 text-sm",
              msg.sender === "user"
                ? "ml-auto bg-primary text-primary-foreground rounded-tr-none"
                : "bg-muted text-muted-foreground rounded-tl-none"
            )}
          >
            {msg.text}
            <span className="mt-1 text-[10px] opacity-70">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-4 flex gap-2 bg-background">
        <input
          type="text"
          placeholder="Ask me anything..."
          aria-label="Ask the portfolio agent a question"
          className="flex-1 bg-muted border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          size="icon"
          className="rounded-full h-9 w-9"
          onClick={handleSend}
          disabled={!inputValue.trim()}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );

  const bubble = (
    <Button
      size="icon"
      className={cn(
        "h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95",
        isOpen ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
      )}
      onClick={toggleChat}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
    </Button>
  );

  if (embedded) {
    return (
      <div className="h-svh w-full flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="bubble"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              {bubble}
            </motion.div>
          ) : (
            <motion.div
              key="window"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="h-full w-full"
            >
              {chatWindow}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            {chatWindow}
          </motion.div>
        )}
      </AnimatePresence>
      {bubble}
    </div>
  );
}
