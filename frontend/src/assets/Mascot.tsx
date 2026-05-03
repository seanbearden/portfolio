import { motion, useReducedMotion, type Easing } from "framer-motion";
import { cn } from "@/lib/utils";

export type MascotState = "idle" | "thinking" | "error" | "refusal";

interface MascotProps {
  state?: MascotState;
  className?: string;
  size?: number;
  contrast?: boolean; // Use for primary-colored backgrounds
}

export function Mascot({ state = "idle", className, size = 40, contrast = false }: MascotProps) {
  const shouldReduce = useReducedMotion();

  const getColors = () => {
    if (contrast) {
      return {
        core: "fill-primary-foreground",
        glow: "bg-primary-foreground/20",
        orbit: "stroke-primary-foreground/40",
        features: "text-primary",
      };
    }
    switch (state) {
      case "error":
        return {
          core: "fill-destructive",
          glow: "bg-destructive/20",
          orbit: "stroke-destructive/40",
          features: "text-destructive-foreground",
        };
      case "refusal":
        // Amber is intentional here — distinct from `destructive` (error) and
        // semantically "caution" rather than "broken". The theme has no
        // `warning` token; if one is added later, swap these. Same amber
        // appears on the AgentPopup refusal banner for consistency.
        return {
          core: "fill-amber-500",
          glow: "bg-amber-500/20",
          orbit: "stroke-amber-500/40",
          features: "text-amber-50",
        };
      case "thinking":
        return {
          core: "fill-primary",
          glow: "bg-primary/30",
          orbit: "stroke-primary/60",
          features: "text-primary-foreground",
        };
      default:
        return {
          core: "fill-primary",
          glow: "bg-primary/20",
          orbit: "stroke-primary/30",
          features: "text-primary-foreground",
        };
    }
  };

  const colors = getColors();

  const orbitTransition = {
    duration: state === "thinking" ? 1.5 : 3,
    repeat: Infinity,
    ease: "linear" as Easing,
  };

  const floatTransition = {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut" as Easing,
  };

  return (
    <div
      data-testid="mascot-root"
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Glow Effect */}
      <motion.div
        data-testid="mascot-glow"
        className={cn("absolute rounded-full blur-xl", colors.glow)}
        style={{ width: size * 1.2, height: size * 1.2 }}
        animate={
          shouldReduce
            ? {}
            : {
                scale: state === "thinking" ? [1, 1.2, 1] : [1, 1.1, 1],
                opacity: state === "thinking" ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3],
              }
        }
        transition={floatTransition}
      />

      <svg
        viewBox="0 0 100 100"
        className="relative z-10 h-full w-full overflow-visible"
      >
        {/* Orbits */}
        {!shouldReduce && (
          <g data-testid="mascot-orbits">
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              strokeWidth="1"
              className={colors.orbit}
              animate={{ rotate: 360 }}
              transition={orbitTransition}
              style={{ transformOrigin: "50px 50px" }}
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="0.5"
              strokeDasharray="4 4"
              className={colors.orbit}
              animate={{ rotate: -360 }}
              transition={{ ...orbitTransition, duration: orbitTransition.duration * 1.5 }}
              style={{ transformOrigin: "50px 50px" }}
            />
          </g>
        )}

        {/* Core Body */}
        <motion.g
          data-testid="mascot-body"
          animate={
            shouldReduce
              ? {}
              : state === "error"
              ? { x: [0, -2, 2, -2, 2, 0] }
              : { y: [0, -4, 0] }
          }
          transition={state === "error" ? { duration: 0.2, repeat: Infinity } : floatTransition}
        >
          <circle data-testid="mascot-core" cx="50" cy="50" r="30" className={colors.core} />

          {/* Eyes */}
          <g data-testid="mascot-features" fill="currentColor" className={colors.features}>
            {state === "idle" && (
              <>
                <motion.circle
                  cx="40"
                  cy="45"
                  r="4"
                  animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
                />
                <motion.circle
                  cx="60"
                  cy="45"
                  r="4"
                  animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
                />
              </>
            )}
            {state === "thinking" && (
              <>
                <circle cx="40" cy="45" r="4" />
                <circle cx="60" cy="45" r="4" />
                <motion.path
                  d="M 35 35 Q 40 30 45 35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </>
            )}
            {state === "error" && (
              <>
                <path d="M 35 40 L 45 50 M 45 40 L 35 50" stroke="currentColor" strokeWidth="3" />
                <path d="M 55 40 L 65 50 M 65 40 L 55 50" stroke="currentColor" strokeWidth="3" />
              </>
            )}
            {state === "refusal" && (
              <>
                <rect x="36" y="44" width="8" height="2" />
                <rect x="56" y="44" width="8" height="2" />
              </>
            )}
          </g>

          {/* Mouth */}
          <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={colors.features}>
            {state === "idle" && <path d="M 45 60 Q 50 65 55 60" />}
            {state === "thinking" && <motion.path d="M 45 62 H 55" animate={{ scaleX: [0.8, 1.2, 0.8] }} transition={{ duration: 1, repeat: Infinity }} />}
            {state === "error" && <path d="M 43 65 Q 50 58 57 65" />}
            {state === "refusal" && <path d="M 45 62 H 55" />}
          </g>
        </motion.g>

        {/* Orbiting Nodes */}
        {!shouldReduce && (
          <motion.g
            data-testid="mascot-orbiting-node-1"
            animate={{ rotate: 360 }}
            transition={orbitTransition}
            style={{ transformOrigin: "50px 50px" }}
          >
            <circle cx="50" cy="10" r="4" className={colors.core} />
          </motion.g>
        )}
        {!shouldReduce && (
          <motion.g
            data-testid="mascot-orbiting-node-2"
            animate={{ rotate: -360 }}
            transition={{ ...orbitTransition, duration: orbitTransition.duration * 1.5 }}
            style={{ transformOrigin: "50px 50px" }}
          >
            <circle cx="50" cy="5" r="3" className={colors.core} />
          </motion.g>
        )}
      </svg>
    </div>
  );
}
