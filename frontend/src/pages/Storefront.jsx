import { useEffect, useState } from "react";
import { ArrowLeft, Heart, Instagram, MapPin, MessageCircle, ShoppingBag, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { SAMPLE_PRODUCTS } from "@/lib/sampleBusinesses";

export default function Storefront() {
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  useEffect(() => { api.products().then(items => { const online = items.filter(p=>p.online); if (online.length) setProducts(online); }).catch(()=>{}); }, []);
  return (
    <div className="min-h-screen bg-[#FBF7F1] text-[#26231F]">
      <div className="bg-[#20362B] px-4 py-2 text-center text-xs text-white">Free delivery in Chennai on orders above ₹1,500</div>
      <header className="max-w-6xl mx-auto px-5 py-5 flex items-center justify-between">
        <Link to="/" className="text-sm flex items-center gap-2 text-stone-500 hover:text-stone-900"><ArrowLeft className="w-4 h-4"/> Angadi dashboard</Link>
        <div className="text-center"><div className="font-serif text-3xl tracking-[.22em]">YUVA</div><div className="text-[9px] tracking-[.28em] uppercase text-stone-500">Handmade with heart</div></div>
        <button className="relative"><ShoppingBag className="w-5 h-5"/><span className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-[#C85C32] text-white text-[9px] flex items-center justify-center">0</span></button>
      </header>

      <section className="max-w-6xl mx-auto px-5 py-10 grid md:grid-cols-[1.1fr_.9fr] gap-8 items-center">
        <div className="rounded-[2rem] overflow-hidden h-[430px]"><img src={products[0]?.image} alt="Yuva handmade bag" className="w-full h-full object-cover"/></div>
        <div className="md:pl-6">
          <div className="text-xs uppercase tracking-[.2em] text-[#C85C32]">Small batches · Handmade in India</div>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl leading-[1.05]">Bags with a human touch.</h1>
          <p className="mt-5 text-stone-600 leading-relaxed">Thoughtfully designed, carefully stitched and made to stay with you. Every Yuva bag carries the mark of the hands that made it.</p>
          <a href="#collection" className="mt-7 inline-flex rounded-full bg-[#20362B] text-white px-6 py-3 text-sm font-semibold">Shop the collection</a>
          <div className="mt-8 flex gap-5 text-xs text-stone-500"><span>✓ Handmade</span><span>✓ Small batches</span><span>✓ Direct from maker</span></div>
        </div>
      </section>

      <section id="collection" className="max-w-6xl mx-auto px-5 py-14">
        <div className="flex items-end justify-between"><div><div className="text-xs uppercase tracking-[.2em] text-[#C85C32]">From our workshop</div><h2 className="mt-2 font-serif text-4xl">The Yuva collection</h2></div><div className="hidden sm:flex items-center gap-1 text-xs text-stone-500"><Sparkles className="w-3.5 h-3.5 text-[#C85C32]"/> Published with Angadi AI</div></div>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p=><article key={p.id} className="group"><div className="relative aspect-[4/5] rounded-[1.5rem] bg-stone-200 overflow-hidden"><img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/><button className="absolute top-4 right-4 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center"><Heart className="w-4 h-4"/></button></div><div className="mt-4 flex justify-between gap-3"><div><h3 className="font-medium">{p.title}</h3><p className="mt-1 text-xs text-stone-500">{p.category} · {p.stock} available</p></div><div className="font-semibold">₹{p.price.toLocaleString("en-IN")}</div></div></article>)}
        </div>
      </section>

      <footer className="mt-12 bg-[#20362B] text-white"><div className="max-w-6xl mx-auto px-5 py-12 flex flex-col md:flex-row justify-between gap-8"><div><div className="font-serif text-3xl tracking-[.2em]">YUVA</div><p className="mt-2 text-sm text-white/60">Made locally. Carried everywhere.</p></div><div className="space-y-2 text-sm text-white/75"><div className="flex items-center gap-2"><MapPin className="w-4 h-4"/> Chennai, India</div><div className="flex items-center gap-2"><MessageCircle className="w-4 h-4"/> Order on WhatsApp</div><div className="flex items-center gap-2"><Instagram className="w-4 h-4"/> Follow Yuva</div></div></div></footer>
    </div>
  );
}
