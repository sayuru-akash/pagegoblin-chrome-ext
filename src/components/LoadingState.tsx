import { motion } from "motion/react";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <motion.div
        className="relative w-20 h-20"
        animate={{ rotate: [0, 10, -10, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Goblin head */}
          <circle cx="40" cy="40" r="28" fill="#4ade80" />
          {/* Left ear */}
          <path d="M14 28 L8 10 L24 24 Z" fill="#4ade80" />
          {/* Right ear */}
          <path d="M66 28 L72 10 L56 24 Z" fill="#4ade80" />
          {/* Left eye */}
          <circle cx="30" cy="36" r="6" fill="white" />
          <motion.circle
            cx="31"
            cy="36"
            r="3"
            fill="#1a1a2e"
            animate={{ cx: [31, 29, 33, 31] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />
          {/* Right eye */}
          <circle cx="50" cy="36" r="6" fill="white" />
          <motion.circle
            cx="51"
            cy="36"
            r="3"
            fill="#1a1a2e"
            animate={{ cx: [51, 49, 53, 51] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />
          {/* Mouth */}
          <motion.path
            d="M30 50 Q40 58 50 50"
            stroke="#1a1a2e"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            animate={{ d: ["M30 50 Q40 58 50 50", "M30 52 Q40 56 50 52", "M30 50 Q40 58 50 50"] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>

      <div className="text-center">
        <motion.p
          className="font-display text-base font-semibold text-ink"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          Gutting your page...
        </motion.p>
        <p className="text-xs text-gray-500 mt-1">
          The goblin is sniffing for crimes
        </p>
      </div>
    </div>
  );
}
