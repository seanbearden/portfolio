import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Send } from "lucide-react";
import { Mascot, type MascotState } from "@/assets/Mascot";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AgentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<MascotState>("idle");
  const shouldReduce = useReducedMotion();
  // Vite exposes `import.meta.env.DEV` (true on `npm run dev`, false in
  // production builds). Used to gate the dev-only state-cycle handler.
  const isDev = import.meta.env.DEV;

  const togglePopup = () => setIsOpen(!isOpen);

  // Dev-only: cycle the mascot through states by clicking it. Stripped at
  // production build time via the isDev gate below.
  const cycleState = (e: React.MouseEvent) => {
    e.stopPropagation();
    const states: MascotState[] = ["idle", "thinking", "error", "refusal"];
    const currentIndex = states.indexOf(state);
    setState(states[(currentIndex + 1) % states.length]);
  };

  const statusLabel =
    state === "thinking" ? "Thinking..."
    : state === "error" ? "Error"
    : state === "refusal" ? "Out of scope"
    : "Online";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-80 sm:w-96"
          >
            <Card className="flex h-[450px] flex-col border-border bg-card/95 shadow-2xl backdrop-blur-md">
              {/* Header */}
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-3">
                  {isDev ? (
                    <div className="cursor-pointer" onClick={cycleState} title="Click to cycle states (Dev mode)">
                      <Mascot state={state} size={32} />
                    </div>
                  ) : (
                    <Mascot state={state} size={32} />
                  )}
                  <div>
                    <h3 className="text-sm font-semibold">Portfolio Agent</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                      {statusLabel}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={togglePopup}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>

              {/* Chat Content (Placeholder) */}
              <div className="flex-1 overflow-y-auto p-4 text-sm space-y-4">
                <div className="rounded-lg bg-muted p-3 text-muted-foreground">
                  Hello! I'm Sean's portfolio agent. Ask me anything about his background, projects, or publications.
                </div>
                {state === "error" && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-destructive border border-destructive/20 text-xs">
                    I'm having trouble connecting right now. Please try again later.
                  </div>
                )}
                {state === "refusal" && (
                  <div className="rounded-lg bg-amber-500/10 p-3 text-amber-600 border border-amber-500/20 text-xs">
                    I can only discuss Sean's professional background and the content on this site.
                  </div>
                )}
              </div>

              {/* Input (Placeholder) */}
              <div className="border-t p-4">
                <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="text"
                    placeholder="Ask a question..."
                    aria-label="Ask the portfolio agent a question"
                    className="flex-1 rounded-md border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    disabled={state === "thinking"}
                  />
                  <Button
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    disabled={state === "thinking"}
                    aria-label="Send message"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={shouldReduce ? undefined : { scale: 1.05 }}
        whileTap={shouldReduce ? undefined : { scale: 0.95 }}
        onClick={togglePopup}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
          isOpen ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
        )}
        aria-label={isOpen ? "Close agent" : "Open agent"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="mascot"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Mascot state={state} size={36} contrast={true} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
