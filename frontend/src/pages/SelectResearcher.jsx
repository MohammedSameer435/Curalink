import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function SelectResearcher() {
  const [researchers, setResearchers] = useState([]);
  const [selected, setSelected] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadResearchers = async () => {
      try {
        const res = await api.get("/api/researchers/list");
        setResearchers(res.data);
      } catch (err) {
        console.error("Failed to load researchers:", err);
      }
    };
    loadResearchers();
  }, []);

  const handleLogin = () => {
    if (!selected) {
      alert("Please select a researcher to continue.");
      return;
    }

    // Save the selected ID to localStorage
    localStorage.setItem("activeResearcherId", selected);

    // Navigate to the dashboard and pass ID via state too
    navigate("/researcher-dashboard", { state: { researcherId: selected } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="bg-white shadow-xl p-6 rounded-xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-teal-700 mb-4">
          Select Researcher Profile
        </h1>

        <select
          className="border p-2 rounded w-full mb-4"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">-- Choose Researcher --</option>
          {researchers.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} — {r.specialization || "General"}
            </option>
          ))}
        </select>

        <button
          onClick={handleLogin}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded w-full"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
