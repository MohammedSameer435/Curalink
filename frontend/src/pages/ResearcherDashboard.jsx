import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api"; // Make sure ../api exports a configured Axios instance

// Utility to safely extract query params
function getQueryParam(search, key) {
  try {
    const params = new URLSearchParams(search);
    return params.get(key);
  } catch {
    return null;
  }
}

export default function ResearcherDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract possible researcher IDs from navigation state or URL query
  const stateId = location.state?.researcherId;
  const queryId = getQueryParam(location.search, "id");

  const [researcherId, setResearcherId] = useState(stateId || queryId || null);
  const [dashboard, setDashboard] = useState(null);

  const [editableResearcher, setEditableResearcher] = useState(null);
  const [editing, setEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [favorites, setFavorites] = useState({
    publications: [],
    clinical_trials: [],
    collaborators: [],
  });

  // 🔹 Handle editable field changes
  const handleChange = (field, value) => {
    setEditableResearcher((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 🔹 Save researcher edits
  const handleSave = async () => {
    if (!editableResearcher?.id) return alert("Researcher ID missing.");
    setSaving(true);
    try {
      const res = await api.put(
        `/api/researchers/${editableResearcher.id}`,
        editableResearcher
      );
      setDashboard((prev) => ({
        ...prev,
        researcher: res.data.researcher,
      }));
      setEditing(false);
    } catch (err) {
      console.error("Failed to update researcher:", err);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Add to favorites
  const handleFavorite = (type, item) => {
    setFavorites((prev) => {
      const exists = prev[type].some((f) => f.id === item.id);
      if (exists) {
        // Toggle off (remove favorite)
        return {
          ...prev,
          [type]: prev[type].filter((f) => f.id !== item.id),
        };
      }
      // Add to favorites
      return { ...prev, [type]: [...prev[type], item] };
    });
  };

  // 🔹 Ensure researcher ID exists
  const ensureResearcherId = async () => {
    if (researcherId) return researcherId;
    try {
      const res = await api.get("/api/researchers");
      if (res.data && res.data.length > 0) {
        setResearcherId(res.data[0].id);
        return res.data[0].id;
      } else {
        setError("No researcher profiles found. Create one first.");
        return null;
      }
    } catch (err) {
      console.error("Failed to fetch researchers:", err);
      setError("Failed to find researcher profile. Create one first.");
      return null;
    }
  };

  // 🔹 Load dashboard data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const id = await ensureResearcherId();
        if (!id) {
          setLoading(false);
          return;
        }
        const res = await api.get(`/api/researchers/${id}/dashboard`);
        setDashboard(res.data);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [researcherId]);

  // 🔹 Sync editableResearcher when dashboard loads
  useEffect(() => {
    if (dashboard?.researcher) {
      setEditableResearcher(dashboard.researcher);
    }
  }, [dashboard]);

  // 🔹 Handle updated query or state IDs
  useEffect(() => {
    const id = stateId || queryId;
    if (id && id !== researcherId) setResearcherId(id);
  }, [stateId, queryId]);

  // ========== Render Section ==========

  if (loading)
    return (
      <div className="text-center mt-10 text-gray-600">
        Loading Researcher Dashboard...
      </div>
    );

  if (error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;

  if (!dashboard) return null;

  const {
    researcher,
    publications = [],
    clinical_trials = [],
    collaborators = [],
    researcher_forums = [],
    patient_forums = [],
  } = dashboard;

  const totalForums = researcher_forums.length + patient_forums.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* ===== HEADER ===== */}
        <header className="mb-10 text-center">
        {editing && editableResearcher ? (
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                className="border p-2 rounded w-full"
                value={editableResearcher.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Specialization</label>
              <input
                className="border p-2 rounded w-full"
                value={editableResearcher.specialization || ""}
                onChange={(e) => handleChange("specialization", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Institution</label>
              <input
                className="border p-2 rounded w-full"
                value={editableResearcher.institution || ""}
                onChange={(e) => handleChange("institution", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                className="border p-2 rounded w-full"
                value={editableResearcher.country || ""}
                onChange={(e) => handleChange("country", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Research Interests</label>
              <input
                className="border p-2 rounded w-full"
                value={
                  Array.isArray(editableResearcher.research_interests)
                    ? editableResearcher.research_interests.join(", ")
                    : editableResearcher.research_interests || ""
                }
                onChange={(e) =>
                  handleChange(
                    "research_interests",
                    e.target.value.split(",").map((s) => s.trim())
                  )
                }
              />
            </div>

            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-4 py-2 rounded text-white ${
                  saving ? "bg-teal-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
              🧬 {researcher.name}
            </h1>
            <p className="text-gray-600 text-lg">
              {researcher.specialization} — {researcher.institution} ({researcher.country})
            </p>
            <p className="text-gray-500 mt-1 text-sm">
              Interests:{" "}
              {Array.isArray(researcher.research_interests)
                ? researcher.research_interests.join(", ")
                : researcher.research_interests}
            </p>

            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() =>
                  navigate("/researcher-forums", {
                    state: {
                      researcherId: researcher.id,
                      specialization: researcher.specialization,
                    },
                  })
                }
                className="px-5 py-2 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 hover:scale-105 transition-all"
              >
                🧠 Open Forums
                {totalForums > 0 && (
                  <span className="ml-2 bg-white text-teal-700 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {totalForums}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setEditableResearcher(researcher);
                  setEditing(true);
                }}
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
            </div>
          </>
        )}
      </header>

        {/* ===== PUBLICATIONS ===== */}
        <Section
          title="📚 Research Publications"
          data={publications}
          type="publications"
          handleFavorite={handleFavorite}
        />

        {/* ===== CLINICAL TRIALS ===== */}
        <Section
          title="🔬 Related Clinical Trials"
          data={clinical_trials}
          type="clinical_trials"
          handleFavorite={handleFavorite}
        />

        {/* ===== COLLABORATORS ===== */}
<section className="mb-12">
  <h2 className="text-2xl font-semibold text-teal-700 mb-4">
    🤝 Suggested Collaborators
  </h2>
  {collaborators.length === 0 ? (
    <p className="text-gray-500">No collaborators matched yet.</p>
  ) : (
    <div className="grid md:grid-cols-2 gap-6">
      {collaborators.map((c) => (
        <div
          key={c.id}
          className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition-transform hover:-translate-y-1"
        >
          <h3 className="font-bold text-lg mb-1">
            {c.name || "Unnamed Collaborator"}
          </h3>
          <p className="text-sm text-gray-600">
            {c.institution} — {c.country}
          </p>
          <p className="text-sm text-gray-700 mt-2 leading-relaxed">
            Common specialization: {c.specialization}
          </p>
          <div className="flex justify-end mt-3">
            <button
              onClick={() => handleFavorite("collaborators", c)}
              className="px-3 py-1 text-sm font-medium text-rose-500 bg-rose-50 border border-rose-100 rounded-full hover:bg-rose-100 hover:scale-105 transition-all"
            >
              ❤️
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</section>


        {/* ===== FAVORITES ===== */}
        <FavoritesSection favorites={favorites} />
      </div>
    </div>
  );
}

// ================== Reusable Subcomponents ==================

// Publications / Trials / Collaborators Section
function Section({ title, data, type, handleFavorite }) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold text-teal-700 mb-4">{title}</h2>
      {data.length === 0 ? (
        <p className="text-gray-500">No {type.replace("_", " ")} yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {data.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition-transform hover:-translate-y-1"
            >
              <h3 className="font-bold text-lg mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.journal || item.location || item.institution}</p>
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                {item.summary}
              </p>
              <div className="flex justify-between items-center mt-4">
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-600 text-sm font-medium hover:underline"
                  >
                    View →
                  </a>
                )}
                <button
                  onClick={() => handleFavorite(type, item)}
                  className="px-3 py-1 text-sm font-medium text-rose-500 bg-rose-50 border border-rose-100 rounded-full hover:bg-rose-100 hover:scale-105 transition-all"
                >
                  ❤️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// Favorites Section
function FavoritesSection({ favorites }) {
  const noFavorites = Object.values(favorites).every((arr) => arr.length === 0);
  if (noFavorites)
    return (
      <section className="mt-14">
        <h2 className="text-2xl font-bold text-teal-700 mb-4">❤️ My Favorites</h2>
        <p className="text-gray-500">No favorites yet. Click ❤️ to save items.</p>
      </section>
    );

  return (
    <section className="mt-14">
      <h2 className="text-2xl font-bold text-teal-700 mb-4">❤️ My Favorites</h2>
      {Object.entries(favorites).map(([key, arr]) =>
        arr.length > 0 ? (
          <div key={key} className="mb-8">
            <h3 className="font-bold text-lg mb-2 capitalize">
              {key.replace("_", " ")}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {arr.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md"
                >
                  <h4 className="font-semibold">{item.title || item.name}</h4>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 text-sm hover:underline"
                    >
                      View
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}
    </section>
  );
}
