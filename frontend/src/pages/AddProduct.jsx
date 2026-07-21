import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Sparkles, Loader2, ArrowLeft, Check, Wand2, Mic, MicOff, Languages, Globe2, Video, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { toast } from "sonner";
import { SAMPLE_BUSINESSES, SAMPLE_PRODUCTS } from "@/lib/sampleBusinesses";

const readAsBase64 = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => {
    const s = r.result.toString();
    res(s.substring(s.indexOf(",") + 1));
  };
  r.onerror = rej;
  r.readAsDataURL(file);
});

const captureVideoFrame = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  let settled = false;
  const cleanup = () => URL.revokeObjectURL(url);
  const fail = (error) => {
    if (settled) return;
    settled = true;
    cleanup();
    reject(error);
  };
  const drawFrame = () => {
    if (settled) return;
    try {
      if (!video.videoWidth || !video.videoHeight) throw new Error("No video frame available");
      const maxWidth = 1200;
      const scale = Math.min(1, maxWidth / video.videoWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Unable to create a video preview");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const preview = canvas.toDataURL("image/jpeg", 0.9);
      settled = true;
      cleanup();
      resolve({ preview, base64: preview.split(",")[1] });
    } catch (error) {
      fail(error);
    }
  };
  video.muted = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.onloadedmetadata = () => {
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const target = Math.min(duration * 0.2, 2);
    if (target > 0.01) video.currentTime = target;
    else drawFrame();
  };
  video.onseeked = drawFrame;
  video.onerror = () => fail(new Error("Unable to read this video"));
  video.src = url;
});

export default function AddProduct() {
  const [items, setItems] = useState([]); // {id, preview, status, meta, cleaned}
  const [dragging, setDragging] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState("ta-IN");
  const inputRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { refreshAll } = useApp();

  useEffect(() => {
    const sampleId = params.get("sample");
    if (!sampleId) return;
    const business = SAMPLE_BUSINESSES.find(s => s.id === sampleId);
    const product = sampleId === "yuva" ? SAMPLE_PRODUCTS[0] : {
      title: business?.category || "Sample product",
      description: business?.translation || "A product prepared for online sale with Angadi AI.",
      category: business?.category || "Other",
      price: sampleId === "saree" ? 2499 : sampleId === "bakery" ? 950 : 450,
      stock: sampleId === "saree" ? 3 : 6,
      sku: `ANG-${sampleId.slice(0, 2).toUpperCase()}01`, image: business?.image,
    };
    setTranscript(business?.quote || "");
    setItems([{ id: crypto.randomUUID(), preview: product.image, status: "ready", cleaned: null, meta: {
      title: product.title, description: product.description, category: product.category,
      tags: ["local", "handmade", "small-business"], suggested_price: product.price,
      suggested_stock: product.stock, sku: product.sku, confidence: .96,
    }}]);
  }, [params]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error("Voice capture works in Chrome and Edge. You can type the details instead."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => setTranscript(Array.from(event.results).map(r => r[0].transcript).join(" "));
    recognition.onend = () => setListening(false);
    recognition.onerror = () => { setListening(false); toast.error("I couldn't hear that. Please try again."); };
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const stopListening = () => { recognitionRef.current?.stop(); setListening(false); };

  const handleFiles = async (files) => {
    const arr = Array.from(files).slice(0, 6);
    let drafts;
    try {
      drafts = await Promise.all(arr.map(async (f) => {
        const isVideo = f.type.startsWith("video/");
        const captured = isVideo ? await captureVideoFrame(f) : null;
        const b64 = captured?.base64 || await readAsBase64(f);
        return {
          id: crypto.randomUUID(),
          preview: captured?.preview || `data:${f.type};base64,${b64}`,
          base64: b64,
          sourceType: isVideo ? "video" : "image",
          sourceName: f.name,
          status: "analyzing",
          meta: null,
          cleaned: null,
        };
      }));
    } catch (error) {
      toast.error("That video could not be read. Try a shorter MP4, MOV or WebM file.");
      return;
    }
    setItems((prev) => [...prev, ...drafts]);
    drafts.forEach(async (d) => {
      try {
        const r = await api.analyzeProduct(d.base64, true, transcript, language);
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
      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#A94827]"><Sparkles className="w-3.5 h-3.5"/> Shelf to store</div>
      <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Show the product. Tell its story.</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-2xl">Take a photo or short video and describe the product naturally. Angadi turns both into a ready-to-sell online listing.</p>

      <div className="mt-6 rounded-2xl border border-orange-100 bg-[#FFF9F5] p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${listening ? "bg-red-500 text-white animate-pulse" : "bg-white text-[#C85C32] border border-orange-100"}`}>
            {listening ? <MicOff className="w-5 h-5"/> : <Mic className="w-5 h-5"/>}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Describe it in your language</div>
            <textarea value={transcript} onChange={e=>setTranscript(e.target.value)} rows={2}
              placeholder="Example: Handmade blue jute bag, ₹1,200, two pieces available…"
              className="mt-2 w-full resize-none bg-white border border-orange-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C85C32]/15" />
          </div>
          <div className="flex md:flex-col gap-2">
            <label className="relative flex-1">
              <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
              <select value={language} onChange={e=>setLanguage(e.target.value)} className="w-full appearance-none rounded-xl border border-orange-100 bg-white py-2.5 pl-9 pr-7 text-xs font-medium">
                <option value="ta-IN">தமிழ் · Tamil</option><option value="hi-IN">हिन्दी · Hindi</option><option value="en-IN">English · India</option><option value="te-IN">తెలుగు · Telugu</option>
              </select>
            </label>
            <button onClick={listening ? stopListening : startListening} className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold text-white ${listening ? "bg-red-500" : "bg-[#C85C32] hover:bg-[#A94827]"}`}>
              {listening ? "Stop listening" : "Speak details"}
            </button>
          </div>
        </div>
      </div>

      {/* dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        className={`mt-6 rounded-2xl border-2 border-dashed p-6 md:p-10 text-center transition-all ${dragging ? "border-[#C85C32] bg-orange-50/50" : "border-slate-200 bg-slate-50/50"}`}
        data-testid="dropzone"
      >
        <div className="mx-auto w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
          <Upload className="w-6 h-6 text-[#C85C32]" />
        </div>
        <div className="mt-4 text-slate-700 font-medium">Drop product photos or a short video here</div>
        <div className="text-xs text-slate-500 mt-1">For video, Angadi extracts a clear product frame automatically.</div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <button onClick={() => inputRef.current?.click()} data-testid="upload-btn" className="text-sm px-4 py-2 rounded-xl bg-[#C85C32] hover:bg-[#A94827] text-white flex items-center gap-2 transition active:scale-[0.98]">
            <Upload className="w-4 h-4" /> Upload images
          </button>
          <button onClick={() => cameraRef.current?.click()} className="text-sm px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2 text-slate-700" data-testid="camera-btn">
            <Camera className="w-4 h-4" /> Camera
          </button>
          <button onClick={() => videoRef.current?.click()} className="text-sm px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2 text-slate-700" data-testid="video-btn">
            <Video className="w-4 h-4" /> Upload video
          </button>
        </div>
        <input ref={inputRef} type="file" multiple accept="image/*" hidden onChange={(e) => handleFiles(e.target.files)} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => handleFiles(e.target.files)} />
        <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={(e) => handleFiles(e.target.files)} />

        <div className="mx-auto mt-7 max-w-xl border-t border-slate-200 pt-5">
          <div className="text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">No product handy? Try a sample</div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button onClick={() => navigate("/products/new?sample=yuva")} className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 text-left transition hover:border-[#C85C32] hover:shadow-sm">
              <img src={SAMPLE_PRODUCTS[0].image} alt="Sample handmade bag" className="h-12 w-12 rounded-lg object-cover" />
              <span><span className="block text-xs font-semibold">Handmade Yuva bag</span><span className="mt-0.5 block text-[10px] text-slate-500">Tamil voice + product photo</span></span>
            </button>
            <button onClick={() => navigate("/products/new?sample=saree")} className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 text-left transition hover:border-[#C85C32] hover:shadow-sm">
              <img src={SAMPLE_BUSINESSES[1].image} alt="Sample handloom saree" className="h-12 w-12 rounded-lg object-cover" />
              <span><span className="block text-xs font-semibold">Sambalpuri saree</span><span className="mt-0.5 block text-[10px] text-slate-500">Hindi voice + product visual</span></span>
            </button>
          </div>
          <a href={SAMPLE_BUSINESSES[1].video} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#A94827] hover:underline">Watch the saree-selling reference <ExternalLink className="h-3 w-3" /></a>
        </div>
      </div>

      {/* generated items */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">AI-generated details</h3>
              <button onClick={saveAll} data-testid="save-all-btn" className="text-sm px-4 py-2 rounded-xl bg-[#C85C32] hover:bg-[#A94827] text-white flex items-center gap-2 shadow-sm transition active:scale-[0.98]">
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
                      {it.sourceType === "video" && <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-slate-950/75 px-2 py-1 text-[9px] font-semibold text-white"><Video className="h-2.5 w-2.5"/> Video frame</span>}
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
      {items.some(x => x.status === "ready") && (
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><Globe2 className="w-4 h-4"/></div>
            <div><div className="text-sm font-semibold">Ready for your online shelf</div><div className="text-xs text-slate-500">Save the products, then publish them to the Yuva storefront.</div></div>
          </div>
          <button onClick={() => window.open("/store/yuva", "_blank")} className="text-xs font-semibold text-emerald-700">Preview storefront →</button>
        </div>
      )}
    </div>
  );
}
