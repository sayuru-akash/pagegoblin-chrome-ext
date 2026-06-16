import { motion } from "motion/react";

interface VerdictLineProps {
  verdict: string;
}

export function VerdictLine({ verdict }: VerdictLineProps) {
  return (
    <motion.p
      className="text-center font-display text-sm leading-relaxed px-4 py-3 rounded-xl"
      style={{
        background: "linear-gradient(135deg, #2d1b4e08, #4ade8008)",
        border: "1px solid #4ade8020",
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
    >
      <span className="text-purple-deep italic">"{verdict}"</span>
    </motion.p>
  );
}
