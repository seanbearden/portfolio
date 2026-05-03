import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { resolveOldUrl } from "@/utils/redirects";
import { motion, useReducedMotion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    const redirect = resolveOldUrl(location.pathname);
    if (redirect) {
      navigate(redirect, { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative w-64 h-64 mb-8 text-primary">
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Background grid for a "lab" feel */}
          <path d="M 0 100 L 200 100" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" />
          <path d="M 100 0 L 100 200" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" />

          {/* Superposition states (Ghost waves) */}
          {!shouldReduce && (
            <>
              <motion.path
                d="M 20 100 Q 60 20 100 100 T 180 100"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeOpacity="0.2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 0.2, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <motion.path
                d="M 20 100 Q 60 180 100 100 T 180 100"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeOpacity="0.2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 0.2, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1.5 }}
              />
            </>
          )}

          {/* The Collapsed State (The "404" Spike) */}
          <motion.path
            d="M 20 100 L 80 100 L 100 30 L 120 100 L 180 100"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={shouldReduce ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* The Measurement/Observation marker */}
          <motion.circle
            cx="100"
            cy="30"
            r="5"
            fill="currentColor"
            initial={shouldReduce ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5, type: "spring" }}
          />

          {/* Annotation text in SVG */}
          <motion.text
            x="105"
            y="25"
            fill="currentColor"
            fontSize="10"
            className="font-mono italic opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 2 }}
          >
            |ψ⟩ collapsed
          </motion.text>
        </svg>
      </div>

      <motion.h1
        className="text-7xl font-black tracking-tighter"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        404
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="space-y-2 mt-4"
      >
        <p className="text-xl font-medium">This URL collapsed before observation.</p>
        <p className="text-muted-foreground italic font-mono text-sm">
          Error: State vector not found in this eigenbasis.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mt-12"
      >
        <Link
          to="/"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "px-8 rounded-full shadow-lg hover:shadow-primary/20 transition-all"
          )}
        >
          Return to Ground State
        </Link>
      </motion.div>
    </div>
  );
}
