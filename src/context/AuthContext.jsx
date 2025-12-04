import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async (retryCount = 0) => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
      setLoading(false);
    } catch (error) {
      // 401 is expected when not logged in
      if (error.response?.status === 401) {
        // Retry once after a delay if we just came from OAuth redirect
        if (retryCount === 0 && window.location.search.includes('auth=success')) {
          setTimeout(() => {
            fetchMe(1);
          }, 1000);
          return;
        }
        setUser(null);
        setLoading(false);
      } else {
        // Other errors
        setUser(null);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Check if we're returning from OAuth (backend adds ?auth=success to redirect)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('auth')) {
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    fetchMe();
    
    // Re-check auth when window regains focus (e.g., after OAuth redirect)
    const handleFocus = () => {
      setTimeout(() => {
        fetchMe();
      }, 100);
    };
    
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const loginWithGoogle = () => {
    // Use environment variable if available, otherwise fallback to hardcoded backend URL
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://thinkboard-backend-unique.vercel.app";
    const base =
      import.meta.env.MODE === "development"
        ? "http://localhost:5001/api"
        : `${BACKEND_URL}/api`;
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


