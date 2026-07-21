import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Sparkles, Loader2, ArrowLeft, Check, Wand2 } from "lucide-react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { toast } from "sonner";

const readAsBase64 = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => {
    const s = r.result.toString();
    res(s.substring(s.indexOf(",") + 1));
  };
  r.onerror = rej;
  r.readAsDataURL(file);
});

export default function AddProduct() {
  const [items, setItems] = useState([]); // {id, preview, status, meta, cleaned}
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { refreshAll } = useApp();

  const handleFiles = async (files) => {
    const arr = Array.from(files).slice(0, 6);
    const drafts = await Promise.all(arr.map(async (f) => {
      const b64 = await readAsBase64(f);
      return {
        id: crypto.randomUUID(),
        preview: `data:${f.type};base64,${b64}`,
        base64: b64,
        status: "analyzing",
        meta: null,
        cleaned: null,
      };
    }));
    setItems((prev) => [...prev, ...drafts]);
    drafts.forEach(async (d) => {
      try {
        const r = await api.analyzeProduct(d.base64, false);
        setItems((prev) => prev.map(x => x.id === d.id
          ? { ...x, status: "ready", meta: r.metadata, cleaned: r.cleaned_image }
          : x));
      } catch (e) {
        setItems((prev) => prev.map(x => x.id === d.id ? { ...x, status: "error" } : x));
        toast.error("AI analysis failed");
      }
    });
  };

  const updateMeta = (id, patch) => {
    setItems(prev => prev.map(x => x.id === id ? { ...x, meta: { ...x.meta, ...patch } } : x));
  };

  const saveAll = async () => {
    const ready = items.filter(x => x.status === "ready" && x.meta);
    if (!ready.length) { toast.error("No products to save"); return; }
    toast.loading(`Saving ${ready.length} products…`, { id: "save" });
    for (const it of ready) {
      await api.createProduct({
        title: it.meta.title,
        description: it.meta.description,
        category: it.meta.category,
        tags: it.meta.tags || [],
        price: Number(it.meta.suggested_price) || 0,
        stock: Number(it.meta.suggested_stock) || 0,
        sku: it.meta.sku,
        image: it.cleaned || it.preview,
        online: false,
      });
    }
    toast.success(`${ready.length} products added`, { id: "save" });
    await refreshAll();
    navigate("/products");
  };

  return (
    <div className="px-6 md:px-10 py-8 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1" data-testid="back-btn">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Add products with AI</h1>
      <p className="mt-1 text-sm text-slate-500">Upload photos. AI will name, describe, price, and categorise each one.</p>

      {/* dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        className={`mt-6 rounded-2xl border-2 border-dashed p-10 text-center transition-all ${dragging ? "border-[#245AB1] bg-[#EBF1FA]/50" : "border-slate-200 bg-slate-50/50"}`}
        data-testid="dropzone"
      >
        <div className="mx-auto w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
          <Upload className="w-6 h-6 text-[#245AB1]" />
        </div>
        <div className="mt-4 text-slate-700 font-medium">Drop product photos here</div>
        <div className="text-xs text-slate-500 mt-1">or use the buttons below · up to 6 at once</div>
        <div className="mt-5 flex items-center justify-center gap-2">
          <button onClick={() => inputRef.current?.click()} data-testid="upload-btn" className="text-sm px-4 py-2 rounded-xl bg-[#245AB1] hover:bg-[#1D4A90] text-white flex items-center gap-2 transition active:scale-[0.98]">
            <Upload className="w-4 h-4" /> Upload images
          </button>
          <button className="text-sm px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2 text-slate-700" data-testid="camera-btn">
            <Camera className="w-4 h-4" /> Camera
          </button>
        </div>
        <input ref={inputRef} type="file" multiple accept="image/*" hidden onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {/* generated items */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">AI-generated details</h3>
              <button onClick={saveAll} data-testid="save-all-btn" className="text-sm px-4 py-2 rounded-xl bg-[#245AB1] hover:bg-[#1D4A90] text-white flex items-center gap-2 shadow-sm transition active:scale-[0.98]">
                <Check className="w-4 h-4" /> Save {items.filter(x => x.status === "ready").length} products
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((it) => (
                <motion.div key={it.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-100 p-4 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)]"
                  data-testid={`draft-${it.id}`}
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                      <img src={it.cleaned || it.preview} alt="" className="w-full h-full object-cover" />
                      {it.status === "analyzing" && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-[#245AB1] animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {it.status === "analyzing" && (
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3"></div>
                          <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2"></div>
                          <div className="h-3 bg-slate-100 rounded animate-pulse w-3/4"></div>
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#245AB1]">
                            <Sparkles className="w-3 h-3 animate-pulse" /> AI is analysing…
                          </div>
                        </div>
                      )}
                      {it.status === "ready" && it.meta && (
                        <>
                          <input value={it.meta.title || ""} onChange={(e) => updateMeta(it.id, { title: e.target.value })}
                            className="w-full font-medium text-slate-900 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#245AB1]/15 rounded px-1 -mx-1" />
                          <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 flex items-center gap-1">
                              <Wand2 className="w-2.5 h-2.5" /> {Math.round((it.meta.confidence || 0.7) * 100)}% confidence
                            </span>
                          </div>
                          <textarea value={it.meta.description || ""} onChange={(e) => updateMeta(it.id, { description: e.target.value })}
                            rows={2}
                            className="mt-2 w-full text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#245AB1]/15 resize-none" />
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-slate-400">Category</label>
                              <input value={it.meta.category || ""} onChange={(e) => updateMeta(it.id, { category: e.target.value })}
                                className="w-full text-xs bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#245AB1]/15" />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-slate-400">Price ₹</label>
                              <input type="number" value={it.meta.suggested_price || 0} onChange={(e) => updateMeta(it.id, { suggested_price: Number(e.target.value) })}
                                className="w-full text-xs bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#245AB1]/15" />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-slate-400">Stock</label>
                              <input type="number" value={it.meta.suggested_stock || 0} onChange={(e) => updateMeta(it.id, { suggested_stock: Number(e.target.value) })}
                                className="w-full text-xs bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#245AB1]/15" />
                            </div>
                          </div>
                        </>
                      )}
                      {it.status === "error" && (
                        <div className="text-sm text-red-600">Failed to analyse. Try again.</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
