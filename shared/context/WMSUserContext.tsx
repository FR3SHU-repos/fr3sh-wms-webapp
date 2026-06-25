"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface IWMSUser {
  id: string;
  name: string;
  email: string;
  role: string;
  photo?: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
}

interface IWMSUserContext {
  user: IWMSUser | null;
  login: (userData: IWMSUser) => void;
  logout: () => void;
  loading: boolean;
}

const WMSUserContext = createContext<IWMSUserContext>({
  user: null,
  login: () => {},
  logout: () => {},
  loading: true,
});

export const WMSUserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IWMSUser | null>(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("wms_user");
        return raw ? (JSON.parse(raw) as IWMSUser) : null;
      }
    } catch {
      localStorage.removeItem("wms_user");
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  const login = (userData: IWMSUser) => {
    setUser(userData);
    try {
      localStorage.setItem("wms_user", JSON.stringify(userData));
    } catch {}
  };

  const logout = async () => {
    setUser(null);
    try {
      localStorage.removeItem("wms_user");
      await fetch("/api/wms/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
  };

  useEffect(() => {
    let mounted = true;
    async function rehydrate() {
      if (user) return;
      setLoading(true);
      try {
        const res = await fetch("/api/wms/auth/me", { credentials: "include" });
        if (!res.ok) return;
        const payload = await res.json();
        if (payload?.success && payload.data && mounted) {
          login(payload.data);
        }
      } catch {}
      finally {
        if (mounted) setLoading(false);
      }
    }
    rehydrate();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WMSUserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </WMSUserContext.Provider>
  );
};

export const useWMSUser = () => useContext(WMSUserContext);
