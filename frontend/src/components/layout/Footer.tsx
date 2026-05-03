import { Link } from "react-router";
import { pdfUrl } from "@/utils/content";
import { motion } from "framer-motion";

const MotionLink = motion.create(Link);

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-8 mt-auto bg-card/30 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-sm text-muted-foreground font-medium"
        >
          &copy; {new Date().getFullYear()} Sean Bearden, Ph.D.
        </motion.p>
        <div className="flex gap-6">
          <motion.a
            href={pdfUrl("Bearden_Resume_Online.pdf")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
            whileHover={{ y: -1 }}
          >
            Resume
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </motion.a>
          <MotionLink
            to="/contact"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
            whileHover={{ y: -1 }}
          >
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </MotionLink>
        </div>
      </div>
    </footer>
  );
}
