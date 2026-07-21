import { motion } from "framer-motion";
import { AlertTriangle, Sparkles, ArrowRight } from "lucide-react";

export default function SuggestionCard({ item, i, onAction }) {
  const isWarn = item.kind === "warning";
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * i }}
      className="bg-white rounded-2xl border border-slate-100 p-4 flex items-start gap-3 hover:border-[#245AB1]/30 hover:shadow-[0_4px_20px_-8px_rgba(36,90,177,0.12)] transition-all"
      data-testid={`suggestion-${item.id}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isWarn ? "bg-amber-50 text-amber-600" : "bg-[#EBF1FA] text-[#245AB1]"}`}>
        {isWarn ? <AlertTriangle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-900">{item.title}</div>
        {item.subtitle && <div className="text-xs text-slate-500 mt-0.5">{item.subtitle}</div>}
      </div>
      <button
        onClick={() => onAction?.(item)}
        data-testid={`suggestion-action-${item.id}`}
        className="text-xs font-medium text-[#245AB1] hover:bg-[#EBF1FA] px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0 transition-colors"
      >
        {item.action} <ArrowRight className="w-3 h-3" />
      </button>
    </motion.div>
  );
}
