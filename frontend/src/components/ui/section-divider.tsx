import { cn } from "@/lib/utils";

interface SectionDividerProps {
  variant?: "waves" | "lines" | "dots" | "network" | "particles";
  className?: string;
}

export function SectionDivider({ variant = "lines", className }: SectionDividerProps) {
  return (
    <div className={cn("w-full py-8 flex justify-center overflow-hidden", className)} aria-hidden="true">
      {variant === "waves" && (
        <svg
          width="100%"
          height="24"
          viewBox="0 0 1200 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary/20"
        >
          <path
            d="M0 12C150 24 300 0 450 12C600 24 750 0 900 12C1050 24 1200 12 1200 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}

      {variant === "lines" && (
        <div className="flex flex-col items-center gap-2 w-full max-w-md">
          <div className="h-px w-full bg-border/60 rounded-full" />
          <div className="h-px w-2/3 bg-border/40 rounded-full" />
          <div className="h-px w-1/3 bg-border/20 rounded-full" />
        </div>
      )}

      {variant === "dots" && (
        <svg
          width="160"
          height="12"
          viewBox="0 0 160 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary/40"
        >
          {[20, 50, 80, 110, 140].map((cx) => (
            <circle key={cx} cx={cx} cy="6" r="2.5" fill="currentColor" />
          ))}
          {[35, 65, 95, 125].map((cx) => (
            <circle key={cx} cx={cx} cy="6" r="1.2" fill="currentColor" opacity="0.5" />
          ))}
        </svg>
      )}

      {variant === "network" && (
        <svg
          width="200"
          height="40"
          viewBox="0 0 200 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary/30"
        >
          <circle cx="30" cy="20" r="3.5" fill="currentColor" />
          <circle cx="80" cy="10" r="2.5" fill="currentColor" />
          <circle cx="130" cy="30" r="2.5" fill="currentColor" />
          <circle cx="180" cy="20" r="3.5" fill="currentColor" />
          <line x1="34" y1="20" x2="76" y2="11" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="84" y1="11" x2="126" y2="29" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="134" y1="29" x2="176" y2="21" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      )}

      {variant === "particles" && (
        <svg
          width="240"
          height="48"
          viewBox="0 0 240 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary/25"
        >
          <circle cx="30" cy="12" r="2" fill="currentColor" />
          <circle cx="60" cy="36" r="1.5" fill="currentColor" />
          <circle cx="90" cy="18" r="2.5" fill="currentColor" />
          <circle cx="120" cy="30" r="1.5" fill="currentColor" />
          <circle cx="150" cy="12" r="1.5" fill="currentColor" />
          <circle cx="180" cy="42" r="2.5" fill="currentColor" />
          <circle cx="210" cy="24" r="2" fill="currentColor" />
          <circle cx="45" cy="30" r="0.8" fill="currentColor" opacity="0.5" />
          <circle cx="105" cy="42" r="0.8" fill="currentColor" opacity="0.5" />
          <circle cx="135" cy="6" r="0.8" fill="currentColor" opacity="0.5" />
          <circle cx="165" cy="30" r="0.8" fill="currentColor" opacity="0.5" />
          <circle cx="225" cy="6" r="0.8" fill="currentColor" opacity="0.5" />
        </svg>
      )}
    </div>
  );
}
