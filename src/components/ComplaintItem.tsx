import { motion } from "motion/react";
import type { GoblinComplaint } from "@/lib/analysis/types";

interface ComplaintItemProps {
  complaint: GoblinComplaint;
  index: number;
}

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: "#fef2f2", text: "#e11d48", border: "#fecaca" },
  high: { bg: "#fff7ed", text: "#ea580c", border: "#fed7aa" },
  medium: { bg: "#fffbeb", text: "#d97706", border: "#fde68a" },
  low: { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
};

export function ComplaintItem({ complaint, index }: ComplaintItemProps) {
  const colors = severityColors[complaint.severity] ?? severityColors.medium;

  return (
    <motion.div
      className="rounded-lg p-3 border"
      style={{ background: colors.bg, borderColor: colors.border }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-ink leading-snug flex-1">
          {complaint.title}
        </p>
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
          style={{ background: colors.border, color: colors.text }}
        >
          {complaint.severity}
        </span>
      </div>
      <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
        {complaint.detail}
      </p>
    </motion.div>
  );
}
