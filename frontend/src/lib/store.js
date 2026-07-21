import { createContext, useContext, useState, useCallback } from "react";
import { api } from "@/lib/api";

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [demoRunning, setDemoRunning] = useState(false);

  const refreshAll = useCallback(async () => {
    try {
      const [p, o, c, a, s, st] = await Promise.all([
        api.products(), api.orders(), api.customers(),
        api.activities(30), api.suggestions(), api.stats(),
      ]);
      setProducts(p); setOrders(o); setCustomers(c);
      setActivities(a); setSuggestions(s); setStats(st);
    } catch (error) {
      // Keep public/sample screens usable when the local API is not running.
      if (process.env.NODE_ENV !== "production") console.info("Angadi API is offline; using sample UI data.");
    }
  }, []);

  return (
    <AppCtx.Provider value={{
      products, orders, customers, activities, suggestions, stats,
      setProducts, setOrders, setCustomers, setActivities, setSuggestions, setStats,
      refreshAll, demoRunning, setDemoRunning,
    }}>
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => useContext(AppCtx);
