import { motion } from "motion/react";
import type { UsefulFix } from "@/lib/analysis/types";

interface QuickFixListProps {
  fixes: UsefulFix[];
}

const priorityBadge: Record<string, { bg: string; text: string }> = {
  urgent: { bg: "#fef2f2", text: "#e11d48" },
  high: { bg: "#fff7ed", text: "#ea580c" },
  medium: { bg: "#fffbeb", text: "#d97706" },
  low: { bg: "#f0fdf4", text: "#16a34a" },
};

export function QuickFixList({ fixes }: QuickFixListProps) {
  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xs font-bold uppercase tracking-wider text-purple-deep">
        Actually Useful Fixes
      </h3>
      {fixes.map((fix, i) => {
        const badge = priorityBadge[fix.priority] ?? priorityBadge.medium;
        return (
          <div
            key={i}
            className="rounded-lg p-3 bg-white border border-gray-200 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                style={{ background: badge.bg, color: badge.text }}
              >
                {fix.priority}
              </span>
              <span className="text-[10px] text-gray-400 uppercase">
                {fix.effort} effort
              </span>
            </div>
            <p className="text-sm font-medium text-ink">{fix.title}</p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              {fix.detail}
            </p>
          </div>
        );
      })}
    </motion.div>
  );
}
