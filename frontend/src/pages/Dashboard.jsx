import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, Camera, ExternalLink, IndianRupee, MessageCircle, Package, Receipt, Share2, ShoppingBag } from "lucide-react";
import VoiceAssistant from "@/components/VoiceAssistant";
import { StatCard } from "@/components/StatCard";
import SuggestionCard from "@/components/SuggestionCard";
import ActivityTimeline from "@/components/ActivityTimeline";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { toast } from "sonner";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, suggestions, activities, refreshAll } = useApp();

  useEffect(() => { refreshAll(); }, [refreshAll]);

  const today = useMemo(() => new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" }), []);
  const storeUrl = typeof window !== "undefined" ? `${window.location.origin}/store/yuva` : "/store/yuva";

  const shareStore = () => {
    const message = `See Yuva's handmade bags online: ${storeUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  const copyStore = async () => {
    await navigator.clipboard?.writeText(storeUrl);
    toast.success("Store link copied");
  };

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
      shareStore();
    }
  };

  const tools = [
    { icon: Camera, eyebrow: "Photo or video", title: "Capture a product", copy: "Turn what is on the shelf into a complete listing.", action: () => navigate("/studio"), label: "Open studio" },
    { icon: MessageCircle, eyebrow: "WhatsApp ready", title: "Share your store", copy: "Send the Yuva catalogue to customers in one tap.", action: shareStore, label: "Share catalogue" },
    { icon: Receipt, eyebrow: "Fast checkout", title: "Create a bill", copy: "Make an invoice while stock updates automatically.", action: () => navigate("/billing"), label: "Start billing" },
    { icon: Package, eyebrow: "Stock health", title: "Prevent stock-outs", copy: `${stats?.low_stock ?? 0} products currently need attention.`, action: () => navigate("/products"), label: "Review inventory" },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8 md:px-10">
      <motion.header initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-medium uppercase tracking-[.2em] text-slate-400">{today}</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl" style={{fontFamily:"Outfit, sans-serif"}} data-testid="dashboard-greeting">{greeting()}, <span className="text-[#C85C32]">Yuva</span></h1>
          <p className="mt-2 text-slate-500">Everything your shop needs today, without the software maze.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate("/studio?mode=photo")} className="flex items-center gap-2 rounded-xl bg-[#C85C32] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#A94827]"><Camera className="h-4 w-4" /> Add product</button>
          <button onClick={() => window.open("/store/yuva", "_blank")} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">View store <ExternalLink className="h-4 w-4" /></button>
        </div>
      </motion.header>

      <div className="mt-7">
        <VoiceAssistant onNavigate={navigate} />
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4" data-testid="stats-grid">
        <StatCard i={0} testId="stat-sales-today" label="Sales today" value={stats?.sales_today ?? "..."} hint="orders processed" icon={ShoppingBag} />
        <StatCard i={1} testId="stat-revenue-today" label="Revenue today" value={stats ? `₹${stats.revenue_today.toLocaleString("en-IN")}` : "..."} hint="gross" icon={IndianRupee} />
        <StatCard i={2} testId="stat-products" label="Products" value={stats?.products ?? "..."} hint="in catalogue" icon={Package} />
        <StatCard i={3} testId="stat-low-stock" label="Low stock" value={stats?.low_stock ?? "..."} hint="needs attention" icon={AlertTriangle} accent="text-amber-500" />
      </div>

      <section className="mt-9">
        <div className="flex items-end justify-between">
          <div><div className="text-xs font-semibold uppercase tracking-[.16em] text-[#A94827]">Useful every day</div><h2 className="mt-1 text-2xl font-semibold tracking-tight">Small tools, less shop work.</h2></div>
          <button onClick={copyStore} className="hidden items-center gap-1.5 text-xs font-semibold text-[#C85C32] sm:flex"><Share2 className="h-3.5 w-3.5" /> Copy store link</button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tools.map(({icon:Icon,eyebrow,title,copy,action,label}) => (
            <button key={title} onClick={action} className="group rounded-2xl border border-slate-100 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-orange-100 hover:shadow-[0_14px_35px_-24px_rgba(15,23,42,.4)]">
              <div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#C85C32]"><Icon className="h-4 w-4" /></span><ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#C85C32]" /></div>
              <div className="mt-5 text-[10px] font-semibold uppercase tracking-[.15em] text-slate-400">{eyebrow}</div>
              <div className="mt-1 font-semibold text-slate-900">{title}</div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{copy}</p>
              <div className="mt-4 text-xs font-semibold text-[#C85C32]">{label}</div>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-9 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between px-1"><h3 className="font-semibold text-slate-900">Needs your attention</h3><span className="text-xs text-slate-400">AI-prioritised</span></div>
          {(suggestions || []).slice(0, 4).map((suggestion, index) => <SuggestionCard key={suggestion.id} item={suggestion} i={index} onAction={handleSuggestion} />)}
          {(!suggestions || suggestions.length === 0) && <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">Everything is up to date.</div>}
        </section>
        <ActivityTimeline items={(activities || []).slice(0, 6)} />
      </div>
    </div>
  );
}
