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
    // Clean up OAuth redirect query param from URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('auth')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    fetchMe();
  }, []);

  const loginWithGoogle = () => {
    const backendBase = import.meta.env.MODE === "development"
      ? "http://localhost:5001/api"
      : `${import.meta.env.VITE_BACKEND_URL || "https://thinkboard-backend-unique.vercel.app"}/api`;
    window.location.href = `${backendBase}/auth/google`;
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


