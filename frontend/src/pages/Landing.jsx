import { ArrowRight, Camera, Check, Mic2, Play, Quote, ScanLine, Sparkles, Store, Video, WandSparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SAMPLE_BUSINESSES, SAMPLE_PRODUCTS } from "@/lib/sampleBusinesses";

const steps = [
  { n: "01", icon: Camera, title: "Show the product", copy: "Shoot a photo, record a short video, or upload one you already have. No lightbox or catalogue setup." },
  { n: "02", icon: Mic2, title: "Tell us what you know", copy: "Speak the price, stock and story naturally—in Tamil, Hindi, Telugu or English." },
  { n: "03", icon: Store, title: "Open your online shelf", copy: "Angadi prepares the listing and publishes it to a storefront your customers can share." },
];

export default function Landing() {
  const heroProduct = SAMPLE_PRODUCTS[0];
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F3EFE5] text-[#181A17] selection:bg-[#FF5C35] selection:text-white">
      <header className="relative z-40 mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 md:px-10 lg:px-14">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#181A17] text-[#F3EFE5]"><Store className="h-4 w-4" /></span>
          <span className="text-xl font-semibold tracking-[-.04em]">Angadi<span className="text-[#FF5C35]">AI</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="#story" className="transition hover:text-[#FF5C35]">Why Angadi</a>
          <a href="#how" className="transition hover:text-[#FF5C35]">How it works</a>
          <Link to="/samples" className="transition hover:text-[#FF5C35]">Seller stories</Link>
        </nav>
        <Link to="/app" className="group inline-flex items-center gap-2 rounded-full bg-[#181A17] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#FF5C35] md:px-5">
          Open Angadi <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      </header>

      <main>
        <section className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-[1440px] items-center gap-12 px-5 pb-16 pt-8 md:px-10 lg:grid-cols-[1.02fr_.98fr] lg:px-14 lg:pb-20 lg:pt-6">
          <div className="relative z-10">
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="inline-flex items-center gap-2 border-b border-[#181A17]/20 pb-2 text-xs font-semibold uppercase tracking-[.18em]">
              <span className="h-2 w-2 rounded-full bg-[#FF5C35]" /> Born inside a real handmade bag business
            </motion.div>
            <motion.h1 initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.08}} className="mt-8 max-w-4xl text-[clamp(3.7rem,8vw,8rem)] font-semibold leading-[.82] tracking-[-.075em]">
              Your shelf is <span className="font-serif font-normal italic tracking-[-.06em] text-[#FF5C35]">already</span> a store.
            </motion.h1>
            <motion.p initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.16}} className="mt-8 max-w-xl text-lg leading-relaxed text-[#54564F] md:text-xl">
              Angadi helps offline shopkeepers become online sellers using only a product photo or video—and their voice.
            </motion.p>
            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.24}} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/studio?mode=photo" className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#FF5C35] px-7 py-4 text-sm font-bold text-white shadow-[0_16px_40px_-18px_rgba(255,92,53,.8)] transition hover:-translate-y-0.5 hover:bg-[#E94B27]">
                <Camera className="h-4 w-4" /> Open camera & shoot
              </Link>
              <Link to="/studio?mode=video" className="inline-flex items-center justify-center gap-3 rounded-full border border-[#181A17]/20 bg-white/50 px-7 py-4 text-sm font-bold backdrop-blur transition hover:bg-white">
                <Video className="h-4 w-4" /> Record or upload video
              </Link>
              <Link to="/store/yuva" className="inline-flex items-center justify-center gap-2 px-3 py-4 text-sm font-bold transition hover:text-[#FF5C35]">
                <Play className="h-4 w-4 fill-current" /> See Yuva's store
              </Link>
            </motion.div>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.35}} className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold uppercase tracking-[.12em] text-[#696B64]">
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#FF5C35]" /> Photo or video</span>
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#FF5C35]" /> Four languages</span>
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#FF5C35]" /> About 90 seconds</span>
            </motion.div>
          </div>

          <motion.div initial={{opacity:0,scale:.97}} animate={{opacity:1,scale:1}} transition={{delay:.12,duration:.65}} className="relative mx-auto h-[570px] w-full max-w-[640px] md:h-[690px]">
            <div className="absolute inset-x-8 top-8 h-[82%] rotate-3 overflow-hidden rounded-[2.6rem] bg-[#D9D12A] shadow-[0_35px_80px_-30px_rgba(24,26,23,.45)] md:inset-x-14">
              <img src={heroProduct.image} alt="Handcrafted Yuva shoulder bag" className="h-full w-full object-cover mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181A17]/75 via-transparent to-transparent" />
              <div className="absolute bottom-0 p-7 text-white md:p-9">
                <div className="text-[10px] font-semibold uppercase tracking-[.22em] text-white/65">Angadi saw</div>
                <div className="mt-2 text-2xl font-semibold md:text-3xl">{heroProduct.title}</div>
                <div className="mt-2 text-sm text-white/70">₹{heroProduct.price.toLocaleString("en-IN")} · {heroProduct.stock} available</div>
              </div>
            </div>
            <div className="absolute left-0 top-2 -rotate-6 rounded-2xl bg-[#181A17] px-5 py-4 text-white shadow-2xl md:left-2 md:top-16">
              <div className="flex items-center gap-2 text-xs font-semibold"><ScanLine className="h-4 w-4 text-[#D9F15B]" /> PRODUCT FOUND</div>
              <div className="mt-1 text-[10px] text-white/45">96% confidence</div>
            </div>
            <div className="absolute left-5 top-32 z-10 flex -rotate-3 items-center gap-2 rounded-full bg-[#F3EFE5] px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] shadow-lg md:left-4 md:top-48"><Video className="h-3.5 w-3.5 text-[#FF5C35]" /> Works from video too</div>
            <div className="absolute bottom-5 right-0 max-w-[285px] rotate-2 rounded-[1.5rem] bg-white p-5 shadow-[0_24px_70px_-24px_rgba(24,26,23,.5)] md:bottom-8 md:right-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#FF5C35]"><Mic2 className="h-4 w-4" /> Tamil voice</div>
              <p className="mt-3 text-sm font-medium leading-relaxed">“இந்த பை கையால் செய்தது. விலை ஆயிரத்து இருநூறு ரூபாய்.”</p>
              <div className="mt-4 h-px bg-[#181A17]/10" />
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#676A62]"><WandSparkles className="h-4 w-4 text-[#FF5C35]" /> Listing ready to publish</div>
            </div>
            <div className="absolute right-6 top-0 flex h-24 w-24 rotate-12 items-center justify-center rounded-full bg-[#D9F15B] text-center text-[10px] font-black uppercase leading-tight tracking-[.12em] text-[#181A17] md:right-0 md:h-28 md:w-28">From shelf<br/>to store</div>
          </motion.div>
        </section>

        <div className="overflow-hidden border-y border-[#181A17] bg-[#181A17] py-4 text-[#F3EFE5]">
          <div className="landing-marquee flex w-max items-center gap-8 whitespace-nowrap text-sm font-bold uppercase tracking-[.2em]">
            {[0,1].map(group => <div key={group} className="flex items-center gap-8"><span>Photo lo</span><span className="text-[#D9F15B]">✦</span><span>Video banao</span><span className="text-[#FF5C35]">✦</span><span>Bolo</span><span className="text-[#D9F15B]">✦</span><span>Online becho</span><span className="text-[#FF5C35]">✦</span><span>Your language</span><span className="text-[#D9F15B]">✦</span></div>)}
          </div>
        </div>

        <section className="border-b border-[#181A17] bg-[#D9F15B] px-5 py-14 md:px-10 lg:px-14">
          <div className="mx-auto grid max-w-[1320px] items-end gap-8 lg:grid-cols-[.65fr_1.35fr]">
            <div className="text-[clamp(5rem,13vw,10rem)] font-semibold leading-[.72] tracking-[-.09em]">93<span className="text-[.45em]">%</span></div>
            <div className="max-w-3xl">
              <div className="text-xs font-black uppercase tracking-[.2em]">India's opportunity is still on the shelf</div>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-.04em] md:text-5xl">Roughly 93% of Indian retail still happened offline in 2024.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#474940] md:text-base">Online retail was just 7% of a $1.06 trillion market. Angadi is built for the shopkeepers and makers who already have great products—but not an easy way to list them.</p>
              <a href="https://www.deloitte.com/in/en/about/press-room/india-s-us-1-06-trillion-retail-sector-is-set-to-reach-1-93-trillion-by-2030.html" target="_blank" rel="noreferrer" className="mt-5 inline-block text-[10px] font-semibold underline decoration-[#181A17]/30 underline-offset-4">Source: Deloitte–FICCI retail report, 2025</a>
            </div>
          </div>
        </section>

        <section id="story" className="bg-[#181A17] px-5 py-24 text-[#F3EFE5] md:px-10 lg:py-32">
          <div className="mx-auto grid max-w-[1320px] gap-14 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <div className="text-xs font-bold uppercase tracking-[.2em] text-[#D9F15B]">Why I built Angadi</div>
              <div className="mt-7 flex h-16 w-16 items-center justify-center rounded-full border border-white/15"><Quote className="h-6 w-6 text-[#FF5C35]" /></div>
            </div>
            <div>
              <p className="text-3xl font-medium leading-tight tracking-[-.035em] md:text-5xl lg:text-6xl">My mother could make a beautiful bag. But putting it online meant photos, editing, titles, descriptions, inventory and unfamiliar software.</p>
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/55">The craft was never the bottleneck. Digitisation was. Angadi turns the knowledge already in a shopkeeper's hands and voice into a storefront customers can discover.</p>
              <div className="mt-10 grid grid-cols-3 gap-3 border-t border-white/15 pt-8">
                <div><div className="text-3xl font-semibold text-[#D9F15B] md:text-5xl">1</div><div className="mt-2 text-xs text-white/45">photo or short video to begin</div></div>
                <div><div className="text-3xl font-semibold text-[#FF5C35] md:text-5xl">0</div><div className="mt-2 text-xs text-white/45">long catalogue forms to fill</div></div>
                <div><div className="text-3xl font-semibold md:text-5xl">4</div><div className="mt-2 text-xs text-white/45">Indian language choices at launch</div></div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 lg:px-14 lg:py-32">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><div className="text-xs font-bold uppercase tracking-[.2em] text-[#FF5C35]">The shortest path online</div><h2 className="mt-4 max-w-3xl text-5xl font-semibold leading-[.95] tracking-[-.06em] md:text-7xl">No forms. No jargon.<br/><span className="font-serif font-normal italic">Just show and tell.</span></h2></div>
            <Link to="/studio" className="group flex items-center gap-2 text-sm font-bold">Try the workflow <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link>
          </div>
          <div className="mt-16 grid gap-px overflow-hidden rounded-[2rem] border border-[#181A17] bg-[#181A17] lg:grid-cols-3">
            {steps.map(({n,icon:Icon,title,copy},i)=><article key={n} className={`group min-h-[340px] bg-[#F3EFE5] p-7 transition hover:bg-white md:p-10 ${i===1?"lg:-rotate-1 lg:scale-[1.015] lg:rounded-[2rem] lg:border lg:border-[#181A17]":""}`}><div className="flex items-center justify-between"><span className="text-xs font-black tracking-[.18em]">{n}</span><span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#181A17]/20 transition group-hover:rotate-6 group-hover:bg-[#D9F15B]"><Icon className="h-5 w-5"/></span></div><h3 className="mt-24 text-3xl font-semibold tracking-[-.04em]">{title}</h3><p className="mt-4 max-w-sm text-sm leading-relaxed text-[#62645D]">{copy}</p></article>)}
          </div>
        </section>

        <section className="bg-[#E8B9A8] px-5 py-24 md:px-10 lg:py-28">
          <div className="mx-auto max-w-[1320px]">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="text-xs font-bold uppercase tracking-[.2em]">Built for the businesses India is made of</div><h2 className="mt-4 text-5xl font-semibold tracking-[-.055em] md:text-7xl">One engine. Many shelves.</h2></div><Link to="/samples" className="text-sm font-bold underline underline-offset-8">Explore the prototypes</Link></div>
            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {SAMPLE_BUSINESSES.map((business,i)=><Link to={`/studio?sample=${business.id}`} key={business.id} className={`group relative overflow-hidden rounded-[1.5rem] bg-[#181A17] ${i%2?"lg:mt-10":""}`}><img src={business.image} alt="" className="aspect-[4/5] w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-65"/><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"/><div className="absolute inset-x-0 bottom-0 p-5 text-white"><div className="text-[10px] uppercase tracking-[.2em] text-white/50">{business.language} · {business.category}</div><div className="mt-2 text-xl font-semibold">{business.name}</div><div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#D9F15B]">Try this story <ArrowRight className="h-3.5 w-3.5"/></div></div></Link>)}
            </div>
          </div>
        </section>

        <section className="px-5 py-24 md:px-10 lg:py-32">
          <div className="mx-auto max-w-[1320px] overflow-hidden rounded-[2.5rem] bg-[#D9F15B] px-6 py-14 md:px-14 md:py-20 lg:grid lg:grid-cols-[1fr_auto] lg:items-end">
            <div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em]"><Sparkles className="h-4 w-4"/> Your shop already has a story</div><h2 className="mt-6 max-w-4xl text-5xl font-semibold leading-[.9] tracking-[-.065em] md:text-7xl lg:text-8xl">Put it online before the shutter closes.</h2></div>
            <div className="mt-10 flex flex-col gap-3 lg:mt-0"><Link to="/studio" className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#181A17] px-7 py-4 text-sm font-bold text-white">Start with one product <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1"/></Link><Link to="/app" className="text-center text-xs font-bold underline underline-offset-4">Already set up? Open dashboard</Link></div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#181A17]/15 px-5 py-8 md:px-10 lg:px-14"><div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-4 text-xs text-[#686A63] md:flex-row"><span className="font-semibold text-[#181A17]">Angadi AI — from shelf to store.</span><span>Built first for Yuva. Designed for India's offline sellers.</span><span>© 2026 Angadi AI</span></div></footer>
    </div>
  );
}
