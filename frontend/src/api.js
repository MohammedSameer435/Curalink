import axios from "axios";

const api = axios.create({
  baseURL:  "https://curalink-y4ky.onrender.com",
});

export default api;
