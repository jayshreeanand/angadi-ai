import { motion } from "framer-motion";
import { ShoppingBag, Receipt, Globe, PackagePlus, Undo2, Boxes, Truck, Sparkles, Wand2 } from "lucide-react";

const ICONS = {
  "shopping-bag": ShoppingBag,
  "receipt": Receipt,
  "globe": Globe,
  "package-plus": PackagePlus,
  "undo-2": Undo2,
  "boxes": Boxes,
  "truck": Truck,
  "sparkles": Sparkles,
  "wand-2": Wand2,
};

function timeAgo(iso) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

export default function ActivityTimeline({ items = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5" data-testid="activity-timeline">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Recent activity</h3>
        <span className="text-xs text-slate-400">Live</span>
      </div>
      <div className="relative">
        <div className="absolute left-[15px] top-1 bottom-1 w-px bg-slate-100" />
        <ul className="space-y-4">
          {items.slice(0, 8).map((a, i) => {
            const Icon = ICONS[a.icon] || Sparkles;
            const color = a.kind === "success" ? "text-emerald-600 bg-emerald-50"
                        : a.kind === "warning" ? "text-amber-600 bg-amber-50"
                        : "text-[#245AB1] bg-[#EBF1FA]";
            return (
              <motion.li key={a.id}
                initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i }}
                className="relative flex items-start gap-3"
              >
                <div className={`relative z-10 w-8 h-8 rounded-xl flex items-center justify-center ${color} border border-white shadow-sm shrink-0`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 pt-0.5 min-w-0">
                  <div className="text-sm text-slate-900 truncate">{a.title}</div>
                  {a.description && <div className="text-xs text-slate-500 truncate">{a.description}</div>}
                </div>
                <div className="text-xs text-slate-400 shrink-0">{timeAgo(a.created_at)}</div>
              </motion.li>
            );
          })}
          {items.length === 0 && (
            <li className="text-sm text-slate-500 text-center py-6">No activity yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
