import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Languages, Loader2, Mic, MicOff, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { toast } from "sonner";

const PROMPTS = [
  "Show today's sales",
  "Show low stock",
  "Blue Star Bag sold",
  "Publish all products",
];

export default function VoiceAssistant({ onNavigate }) {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en-IN");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const { refreshAll } = useApp();

  useEffect(() => {
    const focusAssistant = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", focusAssistant);
    return () => window.removeEventListener("keydown", focusAssistant);
  }, []);

  const submit = async (raw) => {
    const command = (raw ?? text).trim();
    if (!command) return;
    if (/add.*product|capture.*product/i.test(command)) { onNavigate?.("/studio"); return; }
    if (/generate bill|open billing|start billing/i.test(command)) { onNavigate?.("/billing"); return; }
    setLoading(true);
    setResponse(null);
    try {
      const result = await api.command(command);
      setResponse(result);
      await refreshAll();
      if (result.intent === "open_billing") setTimeout(() => onNavigate?.("/billing"), 700);
    } catch (error) {
      toast.error("The store assistant is unavailable. Try again in a moment.");
    } finally {
      setLoading(false);
      setText("");
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice commands work in Chrome and Edge. You can still type a command.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => setText(Array.from(event.results).map(result => result[0].transcript).join(" "));
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      toast.error("I couldn't hear that. Please try again.");
    };
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <section className="overflow-hidden rounded-3xl bg-[#20362B] text-white shadow-[0_24px_70px_-35px_rgba(32,54,43,.8)]" data-testid="voice-store-assistant">
      <div className="grid lg:grid-cols-[.55fr_1.45fr]">
        <div className="border-b border-white/10 p-6 md:p-8 lg:border-b-0 lg:border-r">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D9F15B] text-[#20362B]"><Sparkles className="h-5 w-5" /></div>
          <div className="mt-5 text-xs font-semibold uppercase tracking-[.18em] text-orange-200">Voice store assistant</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Run the shop by talking.</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/55">Record a sale, check stock, publish products or open billing in your language.</p>
        </div>
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative sm:w-40">
              <Languages className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <select value={language} onChange={(event) => setLanguage(event.target.value)} className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-white/10 pl-9 pr-3 text-xs font-semibold text-white outline-none">
                <option className="text-slate-900" value="en-IN">English</option>
                <option className="text-slate-900" value="ta-IN">தமிழ்</option>
                <option className="text-slate-900" value="hi-IN">हिन्दी</option>
                <option className="text-slate-900" value="te-IN">తెలుగు</option>
              </select>
            </label>
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-white px-3 text-slate-900">
              <button onClick={listening ? stopListening : startListening} aria-label={listening ? "Stop listening" : "Start voice command"} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${listening ? "animate-pulse bg-red-500 text-white" : "bg-orange-50 text-[#C85C32]"}`}>
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <input ref={inputRef} value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => event.key === "Enter" && submit()} placeholder={listening ? "Listening…" : "Say or type: Blue Star Bag sold"} className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none" />
              <button onClick={() => submit()} disabled={loading || !text.trim()} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C85C32] text-white disabled:opacity-40">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {PROMPTS.map(prompt => <button key={prompt} onClick={() => submit(prompt)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 hover:text-white">{prompt}</button>)}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {response && (
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="border-t border-white/10 bg-white/5 px-6 py-5 md:px-8" data-testid="assistant-response">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#D9F15B]" />
              <div className="flex-1"><div className="text-sm font-semibold">{response.title || "Angadi Assistant"}</div><div className="mt-1 text-sm text-white/65">{response.response}</div></div>
              <button onClick={() => setResponse(null)} className="text-xs text-white/40 hover:text-white">Dismiss</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
