import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://curalink-y4ky.onrender.com",
});

export default api;
