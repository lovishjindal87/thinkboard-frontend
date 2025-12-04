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
      // If we just logged in and got 401, retry once after a short delay
      if (retryCount === 0 && error.response?.status === 401) {
        setTimeout(() => {
          fetchMe(1);
        }, 500);
        return;
      }
      setUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clean up OAuth redirect query param from URL
    const urlParams = new URLSearchParams(window.location.search);
    const isAuthRedirect = urlParams.has('auth');
    
    if (isAuthRedirect) {
      window.history.replaceState({}, document.title, window.location.pathname);
      // Add a delay to ensure cookie is set after redirect, then retry if needed
      setTimeout(() => {
        fetchMe(0); // Start with retry count 0 to enable retry logic
      }, 300);
    } else {
      fetchMe(1); // Skip retry for normal page loads
    }
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


