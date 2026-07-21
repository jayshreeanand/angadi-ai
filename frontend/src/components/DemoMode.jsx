import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { useNavigate } from "react-router-dom";

const SCRIPT = [
  { title: "Show a product", detail: "A shopkeeper photographs a handmade Yuva bag." },
  { title: "Tell its story", detail: "Tamil voice becomes price, stock, craft details and a polished listing." },
  { title: "Publishing to your storefront", detail: "Products going live online…" },
  { title: 'You say: "Blue Star Bag sold"', detail: "Inventory · Dashboard · Website · Analytics updated live." },
  { title: 'You say: "Generate bill"', detail: "Auto-billing Blue Star Bag + Floral Wallet + Laptop Sleeve." },
  { title: 'You say: "Yesterday\'s laptop bag dispatched"', detail: "Order marked dispatched. Customer notified." },
  { title: 'You say: "Show low stock"', detail: "AI surfaces restock recommendations." },
];

export default function DemoMode({ open, onClose }) {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const timers = useRef([]);
  const { refreshAll } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    setStep(0); setRunning(false); setFinished(false); setTranscript([]);
  }, [open]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const start = async () => {
    setRunning(true); setTranscript([]);
    // Step 1: seed
    setStep(0);
    await api.seed();
    await refreshAll();
    setTranscript(t => [...t, "🔧 Environment ready."]);

    // step 2
    setStep(1);
    await new Promise(r => timers.current.push(setTimeout(r, 1200)));
    setTranscript(t => [...t, "🤖 8 products catalogued."]);

    // step 3
    setStep(2);
    await api.command("publish all products");
    await refreshAll();
    setTranscript(t => [...t, "🌐 Storefront live."]);
    await new Promise(r => timers.current.push(setTimeout(r, 800)));

    // step 4 - product sold
    setStep(3);
    const r1 = await api.command("Blue Star Bag sold");
    setTranscript(t => [...t, `📦 ${r1.response}`]);
    await refreshAll();
    await new Promise(r => timers.current.push(setTimeout(r, 900)));

    // step 5 - billing
    setStep(4);
    navigate("/billing");
    await new Promise(r => timers.current.push(setTimeout(r, 800)));
    const products = await api.products();
    const pick = (name) => products.find(p => p.title.toLowerCase().includes(name.toLowerCase()));
    const items = [pick("Blue Star Bag"), pick("Floral Wallet"), pick("Laptop Sleeve")]
      .filter(Boolean)
      .map(p => ({ product_id: p.id, title: p.title, quantity: 1, price: p.price }));
    const inv = await api.createInvoice({ items, customer_name: "Priya Sharma", discount: 100, payment: "upi" });
    setTranscript(t => [...t, `🧾 Invoice #${inv.number} generated · ₹${inv.total}`]);
    await refreshAll();
    await new Promise(r => timers.current.push(setTimeout(r, 900)));

    // step 6 - dispatch
    setStep(5);
    navigate("/orders");
    await new Promise(r => timers.current.push(setTimeout(r, 700)));
    const r3 = await api.command("yesterday's laptop bag dispatched");
    setTranscript(t => [...t, `🚚 ${r3.response}`]);
    await refreshAll();
    await new Promise(r => timers.current.push(setTimeout(r, 800)));

    // step 7 - low stock
    setStep(6);
    navigate("/app");
    await new Promise(r => timers.current.push(setTimeout(r, 700)));
    const r4 = await api.command("show low stock");
    setTranscript(t => [...t, `📉 ${r4.response}`]);
    await refreshAll();
    await new Promise(r => timers.current.push(setTimeout(r, 800)));

    setFinished(true);
    setRunning(false);
  };

  const close = () => { clearTimers(); onClose?.(); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          data-testid="demo-mode-overlay"
        >
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#EBF1FA] text-[#245AB1] flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
                <div>
                  <div className="font-semibold">Angadi AI · shelf-to-store demo</div>
                  <div className="text-xs text-slate-500">Watch a physical product become an online listing.</div>
                </div>
              </div>
              <button onClick={close} data-testid="demo-close" className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>

            {!finished ? (
              <div className="p-6">
                <ol className="space-y-3">
                  {SCRIPT.map((s, i) => (
                    <motion.li key={i}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      className={`flex items-start gap-3 rounded-xl p-3 border ${
                        step === i && running ? "border-[#245AB1] bg-[#EBF1FA]/50" :
                        step > i ? "border-emerald-100 bg-emerald-50/40" :
                        "border-slate-100"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono ${
                        step > i ? "bg-emerald-500 text-white" : step === i && running ? "bg-[#245AB1] text-white animate-pulse" : "bg-slate-100 text-slate-500"
                      }`}>
                        {step > i ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{s.title}</div>
                        <div className="text-xs text-slate-500">{s.detail}</div>
                      </div>
                    </motion.li>
                  ))}
                </ol>

                <div className="mt-5">
                  {!running ? (
                    <button onClick={start} data-testid="demo-start"
                      className="w-full bg-[#245AB1] hover:bg-[#1D4A90] text-white text-sm font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-[0.98]">
                      <Sparkles className="w-4 h-4" /> Start the demo
                    </button>
                  ) : (
                    <div className="text-xs text-slate-500 text-center font-mono">Running… please don&apos;t close</div>
                  )}
                </div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                </div>
                <h3 className="mt-4 text-2xl font-semibold" style={{ fontFamily: "Outfit, sans-serif" }}>
                  ✨ Your AI Employee has completed an entire day of work
                </h3>
                <p className="mt-2 text-slate-500 text-sm">In under one minute.</p>
                <button onClick={close} data-testid="demo-explore" className="mt-6 inline-flex items-center gap-2 bg-[#245AB1] hover:bg-[#1D4A90] text-white text-sm px-6 py-2.5 rounded-xl transition active:scale-[0.98]">
                  Start exploring <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
