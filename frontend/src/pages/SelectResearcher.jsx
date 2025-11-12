import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function SelectResearcher() {
  const [researchers, setResearchers] = useState([]);
  const [selected, setSelected] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/researchers");
        setResearchers(res.data);
      } catch (err) {
        console.error("Failed to load researchers:", err);
      }
    };
    load();
  }, []);

  const handleLogin = () => {
    if (!selected) return alert("Please choose a researcher.");
    // Save to localStorage so dashboard can read it on refresh
    localStorage.setItem("activeResearcherId", selected);
    // Navigate to your dashboard route and pass state for immediate load
    navigate("/dashboard", { state: { researcherId: selected } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 p-6">
      <div className="bg-white p-6 rounded-lg shadow max-w-md w-full">
        <h1 className="text-xl font-bold mb-4">Sign in as researcher</h1>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        >
          <option value="">-- Select Researcher --</option>
          {researchers.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} — {r.specialization || "General"}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            onClick={handleLogin}
            className="flex-1 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
          >
            Continue
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("activeResearcherId");
              setSelected("");
            }}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
