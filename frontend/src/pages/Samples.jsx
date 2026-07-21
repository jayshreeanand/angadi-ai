import { ArrowRight, Camera, ExternalLink, Languages, Mic2, Play, Sparkles, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SAMPLE_BUSINESSES } from "@/lib/sampleBusinesses";

export default function Samples() {
  const navigate = useNavigate();
  return (
    <div className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 text-[#A94827] px-3 py-1.5 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Prototype story lab
        </div>
        <h1 className="mt-4 text-4xl md:text-5xl font-semibold leading-tight">Every shop has products.<br/><span className="text-[#C85C32]">Angadi helps them speak online.</span></h1>
        <p className="mt-4 text-slate-500 max-w-2xl">Explore four representative seller journeys. Stock footage is used only to demonstrate the workflow and can be replaced with real business footage later.</p>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-5">
        {SAMPLE_BUSINESSES.map((sample, i) => (
          <motion.article key={sample.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*.06}}
            className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_16px_50px_-30px_rgba(15,23,42,.35)]">
            <div className="relative h-60 overflow-hidden">
              <img src={sample.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className={`absolute inset-0 bg-gradient-to-t ${sample.color}`} />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <div className="text-xs uppercase tracking-[.18em] text-white/70">{sample.category} · {sample.language}</div>
                <h2 className="mt-1 text-2xl font-semibold">{sample.name}</h2>
                <p className="text-sm text-white/75">{sample.owner}</p>
              </div>
              <a href={sample.video} target="_blank" rel="noreferrer" className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-slate-800 backdrop-blur hover:bg-white">
                <Play className="w-3.5 h-3.5 fill-current" /> Reference footage <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="p-6">
              <div className="flex gap-3">
                <div className="mt-1 w-9 h-9 rounded-xl bg-orange-50 text-[#C85C32] flex items-center justify-center shrink-0"><Mic2 className="w-4 h-4"/></div>
                <div>
                  <div className="text-sm font-medium leading-relaxed">“{sample.quote}”</div>
                  <div className="mt-2 text-xs text-slate-500">{sample.translation}</div>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Camera className="w-3.5 h-3.5"/> Photo</span>
                  <ArrowRight className="w-3.5 h-3.5"/>
                  <span className="flex items-center gap-1"><Languages className="w-3.5 h-3.5"/> Voice</span>
                  <ArrowRight className="w-3.5 h-3.5"/>
                  <span className="flex items-center gap-1"><Store className="w-3.5 h-3.5"/> Store</span>
                </div>
                <button onClick={()=>navigate(`/studio?sample=${sample.id}`)} className="text-sm font-semibold text-[#C85C32] hover:text-[#A94827] flex items-center gap-1">Try sample <ArrowRight className="w-4 h-4"/></button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
