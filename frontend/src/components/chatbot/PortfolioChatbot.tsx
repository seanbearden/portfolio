import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { MessageSquare, X } from "lucide-react";
import { ChatWindow } from "./ChatWindow";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export function PortfolioChatbot() {
  const [open, setOpen] = React.useState(false);
  const shouldReduce = useReducedMotion();

  React.useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#chat") {
        setOpen(true);
      }
    };

    const handleOpenEvent = () => {
      setOpen(true);
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("open-chatbot", handleOpenEvent);

    // Check initial hash
    if (window.location.hash === "#chat") {
      setOpen(true);
    }

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("open-chatbot", handleOpenEvent);
    };
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && window.location.hash === "#chat") {
      // Remove hash without scrolling
      window.history.pushState(
        "",
        document.title,
        window.location.pathname + window.location.search
      );
    }
    if (isOpen) {
      sessionStorage.setItem("chatbot-open", "true");
    } else {
      sessionStorage.removeItem("chatbot-open");
    }
  };

  // Restore state on mount
  React.useEffect(() => {
    if (sessionStorage.getItem("chatbot-open") === "true") {
      setOpen(true);
    }
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger
        className={cn(
          buttonVariants({ size: "icon-lg" }),
          "fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95"
        )}
        aria-label="Chat with my resume"
      >
        <MessageSquare className="h-6 w-6" />
      </Dialog.Trigger>

      <Dialog.Portal keepMounted>
        <AnimatePresence>
          {open && (
            <>
              <Dialog.Backdrop
                render={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                  />
                }
              />

              <Dialog.Popup
                render={
                  <motion.div
                    initial={
                      shouldReduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }
                    }
                    animate={
                      shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
                    }
                    exit={
                      shouldReduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }
                    }
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="fixed right-0 bottom-0 z-50 flex h-full w-full flex-col bg-background shadow-2xl sm:right-6 sm:bottom-24 sm:h-[600px] sm:max-h-[calc(100vh-120px)] sm:w-[400px] sm:rounded-2xl sm:border sm:border-border"
                  />
                }
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
                    <div>
                      <Dialog.Title className="text-lg font-bold leading-none">
                        Sean's Resume AI
                      </Dialog.Title>
                      <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                        Ask about my experience, skills, or projects.
                      </Dialog.Description>
                    </div>
                    <Dialog.Close
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-sm" }),
                        "rounded-full"
                      )}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </Dialog.Close>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <ChatWindow />
                  </div>
                </div>
              </Dialog.Popup>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
