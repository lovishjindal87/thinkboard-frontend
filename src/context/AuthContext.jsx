import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const loginWithGoogle = () => {
    const base =
      import.meta.env.MODE === "development"
        ? "http://localhost:5001/api"
        : "/api";
    window.location.href = `${base}/auth/google`;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


