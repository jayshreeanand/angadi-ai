import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Trash2, Sparkles, Search, ScanLine, CheckCircle2, Receipt } from "lucide-react";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function Billing() {
  const { products, refreshAll } = useApp();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [discount, setDiscount] = useState(0);
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState("cash");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  const add = (p) => {
    setItems(prev => {
      const ex = prev.find(x => x.product_id === p.id);
      if (ex) return prev.map(x => x.product_id === p.id ? { ...x, quantity: x.quantity + 1 } : x);
      return [...prev, { product_id: p.id, title: p.title, price: p.price, quantity: 1 }];
    });
  };
  const setQty = (id, q) => setItems(prev => prev.map(x => x.product_id === id ? { ...x, quantity: Math.max(1, q) } : x));
  const remove = (id) => setItems(prev => prev.filter(x => x.product_id !== id));

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = Math.max(0, subtotal - Number(discount || 0));

  const filtered = products.filter(p => !q || p.title.toLowerCase().includes(q.toLowerCase())).slice(0, 12);

  const complete = async () => {
    if (items.length === 0) { toast.error("Add products to bill"); return; }
    setSaving(true);
    try {
      const r = await api.createInvoice({
        items, customer_name: customer || "Walk-in", customer_phone: phone,
        discount: Number(discount || 0), payment,
      });
      setSuccess(r);
      setItems([]); setDiscount(0); setCustomer(""); setPhone("");
      refreshAll();
    } catch (e) { toast.error("Failed to generate invoice"); }
    finally { setSaving(false); }
  };

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Billing</h1>
          <p className="mt-1 text-sm text-slate-500">Scan or select products to generate an invoice</p>
        </div>
        <div className="flex gap-2">
          <button data-testid="scan-btn" className="text-sm px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2 text-slate-700"><ScanLine className="w-4 h-4" /> Scan</button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products picker */}
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              data-testid="billing-search"
              value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…"
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#245AB1]/15 focus:border-[#245AB1]"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map(p => (
              <button key={p.id} onClick={() => add(p)} data-testid={`billing-add-${p.id}`}
                className="text-left bg-white rounded-2xl border border-slate-100 hover:border-[#245AB1]/40 hover:shadow-md transition-all overflow-hidden">
                <div className="aspect-square bg-slate-100 overflow-hidden">
                  {p.image && <img src={p.image} alt={p.title} className="w-full h-full object-cover" />}
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium truncate">{p.title}</div>
                  <div className="text-xs text-slate-500">₹{p.price.toLocaleString("en-IN")} · {p.stock} left</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 h-fit sticky top-20" data-testid="billing-cart">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Receipt className="w-4 h-4 text-[#245AB1]" /> Current invoice
          </div>
          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {items.map(it => (
              <div key={it.product_id} className="flex items-center gap-2 py-1.5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{it.title}</div>
                  <div className="text-xs text-slate-500">₹{it.price} × {it.quantity}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setQty(it.product_id, it.quantity - 1)} className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                  <span className="w-6 text-center text-sm">{it.quantity}</span>
                  <button onClick={() => setQty(it.product_id, it.quantity + 1)} className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                  <button onClick={() => remove(it.product_id)} className="w-6 h-6 rounded-md hover:bg-red-50 text-red-500 flex items-center justify-center"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
            {items.length === 0 && <div className="text-xs text-slate-400 py-6 text-center">Cart empty</div>}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            <input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer name (optional)"
              data-testid="billing-customer" className="w-full text-sm bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#245AB1]/15" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)"
              className="w-full text-sm bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#245AB1]/15" />
            <div className="flex gap-2">
              <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="Discount ₹"
                data-testid="billing-discount" className="w-1/2 text-sm bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#245AB1]/15" />
              <select value={payment} onChange={(e) => setPayment(e.target.value)}
                data-testid="billing-payment" className="w-1/2 text-sm bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#245AB1]/15">
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500">Subtotal</span>
            <span className="text-sm">₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-slate-500">Discount</span>
            <span className="text-sm text-slate-500">-₹{Number(discount || 0).toLocaleString("en-IN")}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-semibold" style={{ fontFamily: "Outfit, sans-serif" }}>₹{total.toLocaleString("en-IN")}</span>
          </div>
          <button onClick={complete} disabled={saving || items.length === 0}
            data-testid="complete-sale-btn"
            className="mt-4 w-full bg-[#245AB1] hover:bg-[#1D4A90] disabled:opacity-40 text-white text-sm font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-[0.98]">
            <Sparkles className="w-4 h-4" /> {saving ? "Generating…" : "Generate invoice"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => setSuccess(null)}
          >
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}
              data-testid="invoice-success"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-center" style={{ fontFamily: "Outfit, sans-serif" }}>Sale complete</h3>
              <p className="text-sm text-slate-500 text-center mt-1">Invoice #{success.number} · ₹{success.total.toLocaleString("en-IN")}</p>
              <p className="text-xs text-slate-500 text-center mt-2">Inventory · Dashboard · Analytics updated ✨</p>
              <button onClick={() => setSuccess(null)} className="mt-6 w-full bg-[#245AB1] hover:bg-[#1D4A90] text-white text-sm py-2.5 rounded-xl">Done</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
