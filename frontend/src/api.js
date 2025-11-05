const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://curalink-y4ky.onrender.com"),
});
