import { useEffect } from "react";
import { Package, Truck, CheckCircle2, XCircle } from "lucide-react";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { toast } from "sonner";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700",
  packed: "bg-blue-50 text-blue-700",
  dispatched: "bg-[#EBF1FA] text-[#245AB1]",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function Orders() {
  const { orders, refreshAll } = useApp();
  useEffect(() => { refreshAll(); }, [refreshAll]);

  const setStatus = async (id, status) => {
    await api.updateOrderStatus(id, status);
    toast.success(`Order ${status}`);
    refreshAll();
  };

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto">
      <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Orders</h1>
      <p className="mt-1 text-sm text-slate-500">{orders.length} orders · manage fulfilment</p>

      <div className="mt-6 bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm" data-testid="orders-table">
          <thead className="bg-slate-50/60">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Products</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Payment</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50/40" data-testid={`order-row-${o.id}`}>
                <td className="px-5 py-4 font-mono text-xs">#{o.number || o.id.slice(0,6)}</td>
                <td className="px-5 py-4">{o.customer_name}</td>
                <td className="px-5 py-4 text-slate-600 truncate max-w-[280px]">{(o.items || []).map(i => `${i.title} × ${i.quantity}`).join(", ")}</td>
                <td className="px-5 py-4 font-semibold">₹{o.total?.toLocaleString("en-IN")}</td>
                <td className="px-5 py-4 capitalize text-slate-600">{o.payment}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[o.status] || "bg-slate-100 text-slate-700"}`}>{o.status}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex gap-1">
                    {o.status === "pending" && (
                      <button onClick={() => setStatus(o.id, "packed")} data-testid={`mark-packed-${o.id}`} className="text-xs px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1"><Package className="w-3 h-3" />Pack</button>
                    )}
                    {(o.status === "pending" || o.status === "packed") && (
                      <button onClick={() => setStatus(o.id, "dispatched")} data-testid={`mark-dispatched-${o.id}`} className="text-xs px-2 py-1 rounded-lg bg-[#245AB1] text-white hover:bg-[#1D4A90] flex items-center gap-1"><Truck className="w-3 h-3" />Dispatch</button>
                    )}
                    {o.status === "dispatched" && (
                      <button onClick={() => setStatus(o.id, "completed")} className="text-xs px-2 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Complete</button>
                    )}
                    {o.status !== "completed" && o.status !== "cancelled" && (
                      <button onClick={() => setStatus(o.id, "cancelled")} className="text-xs px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-red-50 text-red-600 flex items-center gap-1"><XCircle className="w-3 h-3" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
