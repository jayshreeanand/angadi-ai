import { motion } from "framer-motion";

export function StatCard({ label, value, hint, icon: Icon, accent, i = 0, testId }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * i }}
      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all"
      data-testid={testId}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        {Icon && <Icon className={`w-4 h-4 ${accent || "text-[#245AB1]"}`} />}
      </div>
      <div className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </motion.div>
  );
}
