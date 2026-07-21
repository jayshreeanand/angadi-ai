import { useEffect } from "react";
import { Phone, Mail, ShoppingBag } from "lucide-react";
import { useApp } from "@/lib/store";

export default function Customers() {
  const { customers, refreshAll } = useApp();
  useEffect(() => { refreshAll(); }, [refreshAll]);

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto">
      <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Customers</h1>
      <p className="mt-1 text-sm text-slate-500">{customers.length} customers · your community</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="customers-grid">
        {customers.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#EBF1FA] text-[#245AB1] flex items-center justify-center font-semibold">
                {c.name.split(" ").map(n => n[0]).join("").slice(0,2)}
              </div>
              <div className="min-w-0">
                <div className="font-medium truncate">{c.name}</div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                </div>
              </div>
            </div>
            {c.email && <div className="mt-3 text-xs text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</div>}
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Orders</div>
                <div className="text-sm font-semibold flex items-center gap-1"><ShoppingBag className="w-3 h-3 text-[#245AB1]" />{c.orders_count}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Lifetime value</div>
                <div className="text-sm font-semibold">₹{c.lifetime_value.toLocaleString("en-IN")}</div>
              </div>
            </div>
          </div>
        ))}
        {customers.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-400">No customers yet</div>
        )}
      </div>
    </div>
  );
}
