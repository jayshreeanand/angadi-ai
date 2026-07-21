import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { IndianRupee, ShoppingBag, Boxes, TrendingUp, AlertTriangle, Package } from "lucide-react";
import CommandBar from "@/components/CommandBar";
import { StatCard } from "@/components/StatCard";
import SuggestionCard from "@/components/SuggestionCard";
import ActivityTimeline from "@/components/ActivityTimeline";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { toast } from "sonner";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, suggestions, activities, refreshAll } = useApp();

  useEffect(() => { refreshAll(); }, [refreshAll]);

  const today = useMemo(() => new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" }), []);

  const handleSuggestion = async (item) => {
    if (item.action === "Sync Website") {
      await api.command("publish all products");
      toast.success("Storefront synced");
      refreshAll();
    } else if (item.action === "Generate") {
      toast.loading("AI is writing descriptions…", { id: "gen" });
      await api.command("generate descriptions");
      toast.success("Descriptions ready", { id: "gen" });
      refreshAll();
    } else if (item.action === "Dispatch") {
      await api.command("dispatch order");
      toast.success("Order dispatched");
      refreshAll();
    } else if (item.action === "Restock") {
      navigate("/products");
    } else if (item.action === "Send Offer") {
      toast.success("Offer queued for 12 customers");
    }
  };

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-medium">{today}</div>
        <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }} data-testid="dashboard-greeting">
          {greeting()}, <span className="text-[#245AB1]">Jay</span>
        </h1>
        <p className="mt-2 text-slate-500">Your AI employee is ready. What happened today&#63;</p>
      </motion.div>

      {/* Command Bar */}
      <div className="mt-6" data-testid="hero-command-bar">
        <CommandBar onNavigate={navigate} />
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" data-testid="stats-grid">
        <StatCard i={0} testId="stat-sales-today" label="Sales today" value={stats?.sales_today ?? "—"} hint="orders processed" icon={ShoppingBag} />
        <StatCard i={1} testId="stat-revenue-today" label="Revenue today" value={stats ? `₹${stats.revenue_today.toLocaleString('en-IN')}` : "—"} hint="gross" icon={IndianRupee} />
        <StatCard i={2} testId="stat-orders" label="Total orders" value={stats?.orders_total ?? "—"} hint="all-time" icon={TrendingUp} />
        <StatCard i={3} testId="stat-products" label="Products" value={stats?.products ?? "—"} hint="in inventory" icon={Package} />
        <StatCard i={4} testId="stat-low-stock" label="Low stock" value={stats?.low_stock ?? "—"} hint="needs attention" icon={AlertTriangle} accent="text-amber-500" />
      </div>

      {/* Suggestions + Activity */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-semibold text-slate-900">Smart suggestions</h3>
            <span className="text-xs text-slate-400">Auto-generated</span>
          </div>
          {(suggestions || []).map((s, i) => (
            <SuggestionCard key={s.id} item={s} i={i} onAction={handleSuggestion} />
          ))}
          {(!suggestions || suggestions.length === 0) && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-sm">
              You're all caught up ✨
            </div>
          )}
        </div>
        <div>
          <ActivityTimeline items={activities || []} />
        </div>
      </div>
    </div>
  );
}
