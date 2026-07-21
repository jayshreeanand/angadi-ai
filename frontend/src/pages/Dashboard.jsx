import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { IndianRupee, ShoppingBag, TrendingUp, AlertTriangle, Package, Camera, Mic, Store, ArrowRight, Clock3, QrCode, Share2, Zap } from "lucide-react";
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
  const storeUrl = typeof window !== "undefined" ? `${window.location.origin}/store/yuva` : "/store/yuva";

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
          {greeting()}, <span className="text-[#C85C32]">Yuva</span>
        </h1>
        <p className="mt-2 text-slate-500">Your offline shelf is one conversation away from an online store.</p>
      </motion.div>

      <section className="mt-6 relative overflow-hidden rounded-3xl bg-[#20362B] text-white p-6 md:p-8 grain">
        <div className="absolute -right-10 -top-16 w-64 h-64 rounded-full bg-[#C85C32]/25 blur-3xl" />
        <div className="relative grid lg:grid-cols-[1fr_auto] gap-7 items-center">
          <div>
            <div className="text-xs uppercase tracking-[.2em] text-orange-200">Photo + voice → ready-to-sell product</div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold max-w-2xl">Point. Speak. Open your online store.</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65 max-w-xl">Photograph a product, describe it in Tamil, Hindi, Telugu or English, and Angadi creates the listing, catalogue and storefront.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={()=>navigate("/products/new")} className="rounded-xl bg-[#C85C32] hover:bg-[#D86A40] px-5 py-3 text-sm font-semibold flex items-center gap-2"><Camera className="w-4 h-4"/> Digitise a product <ArrowRight className="w-4 h-4"/></button>
              <button onClick={()=>navigate("/samples")} className="rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-5 py-3 text-sm font-semibold">Explore sample sellers</button>
            </div>
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 min-w-[210px]">
            {[{icon:Camera,value:"1 photo",label:"instead of a form"},{icon:Mic,value:"4 languages",label:"speak naturally"},{icon:Clock3,value:"~90 sec",label:"to a live listing"}].map(({icon:Icon,value,label})=><div key={value} className="rounded-2xl bg-white/8 border border-white/10 px-4 py-3"><div className="flex items-center gap-2"><Icon className="w-4 h-4 text-orange-200"/><span className="text-sm font-semibold">{value}</span></div><div className="mt-1 text-[10px] text-white/45">{label}</div></div>)}
          </div>
        </div>
      </section>

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

      <div className="mt-6 grid md:grid-cols-[1fr_1fr_auto] gap-4">
        <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[.16em] text-[#A94827]"><Clock3 className="w-4 h-4"/> Before Angadi</div>
          <div className="mt-3 text-3xl font-semibold">25–30 min</div><p className="mt-1 text-xs text-slate-500">per product across photography, writing and catalogue entry</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[.16em] text-emerald-700"><Zap className="w-4 h-4"/> With Angadi</div>
          <div className="mt-3 text-3xl font-semibold">~90 sec</div><p className="mt-1 text-xs text-slate-500">photo, voice, generated listing and storefront sync</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 flex items-center gap-4 min-w-[250px]">
          <img alt="Yuva store QR code" className="w-20 h-20 rounded-lg" src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(storeUrl)}`} />
          <div><div className="flex items-center gap-1.5 text-sm font-semibold"><QrCode className="w-4 h-4"/> Yuva QR Store</div><p className="mt-1 text-[11px] text-slate-500">Scan in-store. Reorder online.</p><button onClick={()=>navigator.clipboard?.writeText(storeUrl)} className="mt-2 text-xs font-semibold text-[#C85C32] flex items-center gap-1"><Share2 className="w-3 h-3"/> Copy link</button></div>
        </div>
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
