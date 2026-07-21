import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Receipt, Users, BarChart3, Settings as SettingsIcon, Search, Bell, Sparkles, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import DemoMode from "@/components/DemoMode";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, testId: "sidebar-nav-dashboard" },
  { to: "/products", label: "Products", icon: Package, testId: "sidebar-nav-products" },
  { to: "/orders", label: "Orders", icon: ShoppingCart, testId: "sidebar-nav-orders" },
  { to: "/billing", label: "Billing", icon: Receipt, testId: "sidebar-nav-billing" },
  { to: "/customers", label: "Customers", icon: Users, testId: "sidebar-nav-customers" },
  { to: "/analytics", label: "Analytics", icon: BarChart3, testId: "sidebar-nav-analytics" },
  { to: "/settings", label: "Settings", icon: SettingsIcon, testId: "sidebar-nav-settings" },
];

export default function AppShell() {
  const { refreshAll } = useApp();
  const [demoOpen, setDemoOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { refreshAll(); }, [refreshAll]);

  return (
    <div className="flex h-screen bg-white text-slate-900" data-testid="app-shell">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-slate-100 bg-[#F9FAFB]/60 backdrop-blur">
        <div className="h-16 flex items-center gap-2 px-6">
          <div className="w-8 h-8 rounded-lg bg-[#245AB1] flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" strokeWidth={2.2} />
          </div>
          <span className="font-semibold text-lg tracking-tight">Vyapar<span className="text-[#245AB1]">AI</span></span>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {NAV.map(({ to, label, icon: Icon, testId }) => (
            <NavLink
              key={to} to={to} end={to === "/"}
              data-testid={testId}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-white text-[#245AB1] shadow-sm border border-slate-100 font-medium"
                    : "text-slate-600 hover:bg-slate-100/70"
                }`
              }
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3">
          <button
            data-testid="watch-demo-btn"
            onClick={() => setDemoOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-[#245AB1] hover:bg-[#1D4A90] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-white" /> Watch 90s Demo
          </button>
          <div className="mt-3 px-2 py-2 rounded-xl bg-white border border-slate-100 flex items-center gap-2">
            <img src="https://images.unsplash.com/photo-1544168190-79c17527004f?crop=entropy&cs=srgb&fm=jpg&q=85&w=80" alt="Jay" className="w-8 h-8 rounded-full object-cover" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">Jay Patel</div>
              <div className="text-xs text-slate-500 truncate">Handmade Studio</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 shrink-0 flex items-center gap-4 px-8 border-b border-slate-100 bg-white/70 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex-1 max-w-xl relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              data-testid="topbar-search"
              placeholder="Search products, orders, customers…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  navigate(`/products?q=${encodeURIComponent(e.target.value.trim())}`);
                }
              }}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#245AB1]/15 focus:border-[#245AB1] focus:bg-white transition-all"
            />
          </div>
          <button data-testid="topbar-notifications" className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors relative">
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#245AB1] rounded-full"></span>
          </button>
          <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1544168190-79c17527004f?crop=entropy&cs=srgb&fm=jpg&q=85&w=80" alt="profile" className="w-full h-full object-cover" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <DemoMode open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
