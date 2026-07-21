import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid } from "recharts";
import { api } from "@/lib/api";

const COLORS = ["#245AB1", "#38BDF8", "#0EA5E9", "#93C5FD", "#7DD3FC"];

export default function Analytics() {
  const [data, setData] = useState(null);
  useEffect(() => { api.analytics().then(setData); }, []);

  if (!data) return <div className="p-10 text-slate-400">Loading…</div>;

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto">
      <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Analytics</h1>
      <p className="mt-1 text-sm text-slate-500">Business signal, not noise.</p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-5" data-testid="revenue-chart">
          <h3 className="font-semibold text-slate-900">Revenue (last 7 days)</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <LineChart data={data.revenue_series}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="#245AB1" strokeWidth={2.5} dot={{ r: 3, fill: "#245AB1" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-900">Best sellers</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <BarChart data={data.best_sellers.slice(0,5)}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="title" tick={{ fontSize: 10, fill: "#94A3B8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Bar dataKey="qty" fill="#245AB1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-900">Sales by category</h3>
          <div className="mt-4 h-56 flex items-center">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.by_category} dataKey="count" nameKey="category" innerRadius={45} outerRadius={80} paddingAngle={4}>
                  {data.by_category.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.by_category.map((c, i) => (
              <div key={c.category} className="text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></span>{c.category} · {c.count}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-900">Low stock & unsold</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="uppercase tracking-wider text-slate-400 text-[10px] mb-1">Low stock</div>
              {data.low_stock.length ? data.low_stock.map(p => (
                <div key={p.id} className="flex items-center justify-between py-1"><span className="truncate">{p.title}</span><span className="text-amber-600 font-semibold ml-2">{p.stock}</span></div>
              )) : <div className="text-slate-400">None</div>}
            </div>
            <div>
              <div className="uppercase tracking-wider text-slate-400 text-[10px] mb-1">Unsold</div>
              {data.unsold.length ? data.unsold.map(p => (
                <div key={p.id} className="py-1 truncate">{p.title}</div>
              )) : <div className="text-slate-400">None</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
