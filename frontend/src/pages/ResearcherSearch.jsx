import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function ResearcherSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const search = async () => {
    if (!query.trim()) return;
    const res = await api.get(`/api/search/researchers?q=${query}`);
    setResults(res.data);
  };

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-teal-700 mb-4">
          🔍 Search Researchers
        </h1>

        <div className="flex gap-2 mb-6">
          <input
            className="border p-2 rounded flex-1"
            placeholder="Search by name, field, institution..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button
            onClick={search}
            className="bg-teal-600 text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </div>

        {results.length === 0 ? (
          <p className="text-gray-500">No results yet.</p>
        ) : (
          <div className="space-y-4">
            {results.map(r => (
              <div
                key={r.id}
                className="border p-4 rounded-lg hover:bg-teal-50 cursor-pointer"
                onClick={() => navigate(`/researcher-profile/${r.id}`)}
              >
                <h2 className="font-bold text-lg">{r.name}</h2>
                <p className="text-gray-600">
                  {r.specialization} – {r.institution} ({r.country})
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
