import axios from "axios";

// Use environment variable if available, otherwise fallback to hardcoded backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://thinkboard-backend-unique.vercel.app";
const BASE_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5001/api" 
  : `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default api;