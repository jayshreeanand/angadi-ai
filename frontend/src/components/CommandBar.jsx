import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Loader2, CheckCircle2, Mic } from "lucide-react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { toast } from "sonner";

const SUGGESTED = [
  { emoji: "📷", text: "Add these new products", to: "/products/new" },
  { emoji: "🧾", text: "Generate bill", cmd: "generate bill" },
  { emoji: "📦", text: "Yesterday's laptop bag has been dispatched", cmd: "yesterday's laptop bag dispatched" },
  { emoji: "🏷", text: "Blue Star Bag sold", cmd: "Blue Star Bag sold" },
  { emoji: "📉", text: "Show low stock", cmd: "show low stock" },
  { emoji: "📈", text: "Today's sales", cmd: "show today's sales" },
  { emoji: "🌐", text: "Publish products online", cmd: "publish all products" },
];

export default function CommandBar({ onNavigate }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const inputRef = useRef(null);
  const { refreshAll } = useApp();

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const submit = async (raw) => {
    const q = (raw ?? text).trim();
    if (!q) return;
    // shortcuts to navigate
    if (/^add.*product/i.test(q)) { onNavigate?.("/products/new"); return; }
    if (/generate bill|open billing|start billing/i.test(q)) { onNavigate?.("/billing"); return; }

    setLoading(true);
    setResponse(null);
    try {
      const r = await api.command(q);
      setResponse(r);
      await refreshAll();
      if (r.intent === "open_billing") setTimeout(() => onNavigate?.("/billing"), 700);
    } catch (e) {
      toast.error("AI is unavailable. Try again.");
    } finally {
      setLoading(false);
      setText("");
    }
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-2xl bg-white/70 backdrop-blur-2xl backdrop-saturate-150 border border-white/40 shadow-[0_10px_40px_-8px_rgba(36,90,177,0.15)] overflow-hidden"
      >
        <div className="absolute inset-x-0 -top-8 h-16 brand-glow pointer-events-none" />
        <div className="relative flex items-center gap-3 px-6 py-5">
          <Sparkles className="w-5 h-5 text-[#245AB1] shrink-0" />
          <input
            ref={inputRef}
            data-testid="command-bar-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="What happened today?"
            className="flex-1 bg-transparent text-lg md:text-xl outline-none placeholder-slate-400"
          />
          <div className="hidden md:flex items-center gap-1 text-[10px] text-slate-400 font-mono">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100">K</kbd>
          </div>
          <button
            data-testid="command-bar-submit"
            onClick={() => submit()}
            disabled={loading || !text.trim()}
            className="ml-1 w-10 h-10 rounded-xl bg-[#245AB1] hover:bg-[#1D4A90] disabled:opacity-40 flex items-center justify-center text-white transition active:scale-[0.95]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>

      {/* suggested prompts */}
      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTED.map((s, i) => (
          <motion.button
            key={s.text}
            data-testid={`suggested-prompt-${i}`}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            onClick={() => s.to ? onNavigate?.(s.to) : submit(s.cmd)}
            className="text-sm px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-[#245AB1] hover:text-[#245AB1] text-slate-600 transition-colors"
          >
            <span className="mr-1.5">{s.emoji}</span>{s.text}
          </motion.button>
        ))}
        <button
          data-testid="voice-soon"
          className="text-sm px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-400 flex items-center gap-1.5"
        >
          <Mic className="w-3.5 h-3.5" /> 🎤 Voice mode coming soon
        </button>
      </div>

      {/* AI response panel */}
      <AnimatePresence>
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-5 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.08)] p-5"
            data-testid="ai-response-panel"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EBF1FA] text-[#245AB1] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900">{response.title || "Vyapar AI"}</div>
                <div className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{response.response}</div>
                {response.intent === "product_sold" && response.data && (
                  <div className="mt-3 inline-flex items-center gap-2 text-xs bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 font-mono">
                    Stock <span className="text-slate-400">{response.data.before}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-[#245AB1] font-semibold">{response.data.after}</span>
                  </div>
                )}
              </div>
              <button onClick={() => setResponse(null)} className="text-slate-400 hover:text-slate-600 text-xs">Dismiss</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
