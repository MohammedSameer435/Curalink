// client/src/pages/ResearcherProfileSetup.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function ResearcherProfileSetup() {
  const navigate = useNavigate();
  const [specializations, setSpecializations] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    specialization: "",
    research_interests: "",
    orcid_link: "",
    researchgate_link: "",
    institution: "",
    country: "",
    availability: false,
  });

  const [loading, setLoading] = useState(false);

  // 🔄 Fetch available specializations from backend
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const res = await api.get("api/researchers/specializations/list");
        setSpecializations(res.data.specializations || []);
      } catch (err) {
        console.error("Failed to fetch specializations:", err);
      }
    };
    fetchSpecializations();
  }, []);

  // 💾 Save researcher profile
  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.specialization || !form.research_interests) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        research_interests: form.research_interests
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
      };

      const res = await api.post("/api/researchers/setup", payload);

      if (res.data?.researcher?.id) {
        const newId = res.data.researcher.id;
        alert("Profile created successfully!");
        navigate("/researcher-dashboard", { state: { researcherId: newId } });
      } else {
        alert("Profile created, but could not retrieve ID.");
      }
    } catch (err) {
      console.error("Error saving researcher:", err);
      alert("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 px-6 py-10 text-gray-800">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
        👩‍🔬 Researcher Profile Setup
      </h1>

      <div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-6 border">
        <label className="block font-semibold mt-3">Full Name</label>
        <input
          className="w-full border px-3 py-2 rounded-lg"
          placeholder="Dr. Jane Doe"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <label className="block font-semibold mt-3">Email</label>
        <input
          type="email"
          className="w-full border px-3 py-2 rounded-lg"
          placeholder="jane@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <label className="block font-semibold mt-3">Specialization</label>
        <select
          className="w-full border px-3 py-2 rounded-lg"
          value={form.specialization}
          onChange={(e) => setForm({ ...form, specialization: e.target.value })}
        >
          <option value="">-- Select Specialization --</option>
          {specializations.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <label className="block font-semibold mt-3">Research Interests</label>
        <input
          className="w-full border px-3 py-2 rounded-lg"
          placeholder="e.g., Immunotherapy, Gene Therapy"
          value={form.research_interests}
          onChange={(e) =>
            setForm({ ...form, research_interests: e.target.value })
          }
        />

        <label className="block font-semibold mt-3">Institution</label>
        <input
          className="w-full border px-3 py-2 rounded-lg"
          placeholder="University / Hospital"
          value={form.institution}
          onChange={(e) => setForm({ ...form, institution: e.target.value })}
        />

        <label className="block font-semibold mt-3">Country</label>
        <input
          className="w-full border px-3 py-2 rounded-lg"
          placeholder="Country"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
        />

        <label className="block font-semibold mt-3">Optional ORCID Link</label>
        <input
          className="w-full border px-3 py-2 rounded-lg"
          placeholder="https://orcid.org/0000-0002-1825-0097"
          value={form.orcid_link}
          onChange={(e) => setForm({ ...form, orcid_link: e.target.value })}
        />

        <label className="block font-semibold mt-3">
          Optional ResearchGate Link
        </label>
        <input
          className="w-full border px-3 py-2 rounded-lg"
          placeholder="https://www.researchgate.net/profile/..."
          value={form.researchgate_link}
          onChange={(e) =>
            setForm({ ...form, researchgate_link: e.target.value })
          }
        />

        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.availability}
            onChange={(e) =>
              setForm({ ...form, availability: e.target.checked })
            }
          />
          <span>Available for meetings / collaborations</span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold shadow transition-all"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
