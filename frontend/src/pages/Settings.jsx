import { Mic, Camera, ScanLine, MessageCircle, ShoppingBag, Store, Package, Truck, FileSpreadsheet, TrendingUp } from "lucide-react";

const SOON = [
  { icon: Mic, label: "Voice Commands", desc: "Update inventory hands-free" },
  { icon: Camera, label: "Live Camera Billing", desc: "Point, scan, bill instantly" },
  { icon: ScanLine, label: "Barcode Scanner", desc: "Native mobile scanning" },
  { icon: MessageCircle, label: "WhatsApp Integration", desc: "Broadcast, orders, replies" },
  { icon: ShoppingBag, label: "Shopify", desc: "Sync in both directions" },
  { icon: Store, label: "WooCommerce", desc: "Two-way sync" },
  { icon: Package, label: "Amazon", desc: "Marketplace listings" },
  { icon: Package, label: "Flipkart", desc: "Marketplace listings" },
  { icon: Truck, label: "Shiprocket", desc: "Auto-generate labels" },
  { icon: FileSpreadsheet, label: "GST Filing", desc: "Auto returns" },
  { icon: TrendingUp, label: "Demand Forecasting", desc: "AI-powered restock" },
];

export default function Settings() {
  return (
    <div className="px-6 md:px-10 py-8 max-w-[1200px] mx-auto">
      <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Configure your Angadi AI experience</p>

      <div className="mt-6 bg-white rounded-2xl border border-slate-100 p-6">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Store</div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500">Store name</label>
            <input defaultValue="Jay's Handmade Studio" className="mt-1 w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#245AB1]/15" />
          </div>
          <div>
            <label className="text-xs text-slate-500">Currency</label>
            <input defaultValue="INR (₹)" className="mt-1 w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#245AB1]/15" />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Coming soon</h3>
          <span className="text-[10px] uppercase tracking-wider bg-[#EBF1FA] text-[#245AB1] px-2 py-0.5 rounded-full font-medium">Roadmap</span>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SOON.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EBF1FA] text-[#245AB1] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-slate-500">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
