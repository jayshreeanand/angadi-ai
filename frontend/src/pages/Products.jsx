import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Upload, Search, Globe, MoreHorizontal, Package } from "lucide-react";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function Products() {
  const { products, refreshAll } = useApp();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const navigate = useNavigate();

  useEffect(() => { if (!products.length) refreshAll(); }, [products.length, refreshAll]);

  const filtered = products.filter(p =>
    !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase())
  );

  const publishAll = async () => {
    toast.loading("Publishing to your storefront…", { id: "pub" });
    await api.command("publish all products");
    toast.success("All products live", { id: "pub" });
    refreshAll();
  };

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Products</h1>
          <p className="mt-1 text-sm text-slate-500">{products.length} items · manage your catalogue</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={publishAll} data-testid="publish-all-btn" className="text-sm px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2 transition">
            <Globe className="w-4 h-4" /> Sync online
          </button>
          <button data-testid="import-products-btn" className="text-sm px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2 transition">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button onClick={() => navigate("/products/new")} data-testid="add-product-btn" className="text-sm px-4 py-2 rounded-xl bg-[#245AB1] hover:bg-[#1D4A90] text-white flex items-center gap-2 shadow-sm transition active:scale-[0.98]">
            <Plus className="w-4 h-4" /> Add products
          </button>
        </div>
      </div>

      <div className="mt-6 relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          data-testid="products-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#245AB1]/15 focus:border-[#245AB1]"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-200 p-16 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="mt-3 text-sm text-slate-500">No products found</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((p, i) => (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i }}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-[0_10px_35px_-10px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all"
              data-testid={`product-card-${p.id}`}
            >
              <Link to={`/products/${p.id}`}>
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Package className="w-10 h-10" />
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link to={`/products/${p.id}`} className="font-medium text-slate-900 truncate block hover:text-[#245AB1] transition-colors">{p.title}</Link>
                    <div className="text-xs text-slate-500 mt-0.5">{p.category} · SKU {p.sku}</div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 p-1"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-lg font-semibold text-slate-900">₹{p.price.toLocaleString("en-IN")}</div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.stock <= 5 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                      {p.stock} in stock
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${p.online ? "bg-[#EBF1FA] text-[#245AB1]" : "bg-slate-100 text-slate-500"}`}>
                    {p.online ? "Online" : "Offline"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-500">{p.status}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
