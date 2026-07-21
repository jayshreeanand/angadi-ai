import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, Sparkles, Loader2, MessageCircle, Instagram, Megaphone, Wand2, Package } from "lucide-react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { toast } from "sonner";

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { refreshAll } = useApp();
  const [p, setP] = useState(null);
  const [gen, setGen] = useState({ kind: null, text: "" });
  const [busy, setBusy] = useState(null);

  useEffect(() => { api.product(id).then(setP).catch(() => nav("/products")); }, [id, nav]);

  if (!p) {
    return <div className="p-10"><Loader2 className="w-5 h-5 animate-spin text-[#245AB1]" /></div>;
  }

  const generate = async (kind) => {
    setBusy(kind); setGen({ kind, text: "" });
    try {
      const r = await api.generateContent(id, kind);
      setGen({ kind, text: r.text });
    } catch (e) { toast.error("Generation failed"); }
    finally { setBusy(null); }
  };

  const publish = async () => {
    await api.updateProduct(id, { online: !p.online });
    const np = await api.product(id); setP(np);
    refreshAll();
    toast.success(np.online ? "Published online" : "Unpublished");
  };

  return (
    <div className="px-6 md:px-10 py-8 max-w-6xl mx-auto">
      <button onClick={() => nav(-1)} className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back</button>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-square">
          {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                   : <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-16 h-16" /></div>}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400">{p.category} · SKU {p.sku}</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>{p.title}</h1>
          <div className="mt-2 text-2xl font-semibold text-slate-900">₹{p.price.toLocaleString("en-IN")}</div>
          <p className="mt-4 text-sm text-slate-600 leading-relaxed">{p.description || "No description yet."}</p>

          <div className="mt-4 flex items-center gap-3">
            <span className={`text-xs px-2 py-0.5 rounded-full ${p.stock <= 5 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{p.stock} in stock</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${p.online ? "bg-[#EBF1FA] text-[#245AB1]" : "bg-slate-100 text-slate-500"}`}>{p.online ? "Online" : "Offline"}</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button data-testid="publish-product-btn" onClick={publish}
              className="text-sm px-4 py-2 rounded-xl bg-[#245AB1] hover:bg-[#1D4A90] text-white flex items-center gap-2 transition active:scale-[0.98]">
              <Globe className="w-4 h-4" /> {p.online ? "Unpublish" : "Publish online"}
            </button>
            <button onClick={() => generate("description")} disabled={busy} className="text-sm px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2">
              {busy === "description" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              Better description
            </button>
            <button onClick={() => generate("instagram")} disabled={busy} className="text-sm px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2">
              {busy === "instagram" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Instagram className="w-4 h-4" />}
              Instagram caption
            </button>
            <button onClick={() => generate("whatsapp")} disabled={busy} className="text-sm px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2">
              {busy === "whatsapp" ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
              WhatsApp message
            </button>
            <button onClick={() => generate("marketing")} disabled={busy} className="text-sm px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2">
              {busy === "marketing" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
              Marketing copy
            </button>
          </div>

          {gen.text && (
            <div className="mt-5 rounded-2xl bg-[#EBF1FA]/60 border border-[#245AB1]/15 p-4">
              <div className="flex items-center gap-2 text-xs text-[#245AB1] font-medium">
                <Sparkles className="w-3.5 h-3.5" /> Generated · {gen.kind}
              </div>
              <div className="mt-2 text-sm text-slate-800 whitespace-pre-wrap">{gen.text}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
