import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";

function getQueryParam(search, key) {
  try {
    const params = new URLSearchParams(search);
    return params.get(key);
  } catch (e) {
    return null;
  }
}

export default function ResearcherDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateId = location.state?.researcherId;
  const queryId = getQueryParam(location.search, "id");
  const [researcherId, setResearcherId] = useState(stateId || queryId || null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);

  const [favorites, setFavorites] = useState({
    publications: [],
    clinical_trials: [],
    collaborators: [],
  });

  const handleFavorite = (type, item) => {
    setFavorites((prev) => {
      const exists = prev[type].some((f) => f.id === item.id);
      if (exists) return prev;
      return { ...prev, [type]: [...prev[type], item] };
    });
  };

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
        const res = await api.get(
          `/api/researchers/${id}/dashboard`
        );
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
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
            🧬 {researcher.name}
          </h1>
          <p className="text-gray-600 text-lg">
            {researcher.specialization} — {researcher.institution} (
            {researcher.country})
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
          </div>
        </header>

        {/* Publications */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-teal-700 mb-4">
            📚 Research Publications
          </h2>
          {publications.length === 0 ? (
            <p className="text-gray-500">No publications yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {publications.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition-transform hover:-translate-y-1"
                >
                  <h3 className="font-bold text-lg mb-1">{p.title}</h3>
                  <p className="text-sm text-gray-600">
                    {p.journal} {p.year ? `(${p.year})` : ""}
                  </p>
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                    {p.summary}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-600 text-sm font-medium hover:underline"
                    >
                      View paper →
                    </a>
                    <button
                      onClick={() => handleFavorite("publications", p)}
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

        {/* Clinical Trials */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-teal-700 mb-4">
            🔬 Related Clinical Trials
          </h2>
          {clinical_trials.length === 0 ? (
            <p className="text-gray-500">
              No related clinical trials found.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {clinical_trials.map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition-transform hover:-translate-y-1"
                >
                  <h3 className="font-bold text-lg mb-1">{t.title}</h3>
                  <p className="text-sm text-gray-600">{t.location}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Status: {t.status || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                    {t.summary}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-600 text-sm font-medium hover:underline"
                    >
                      View trial →
                    </a>
                    <button
                      onClick={() => handleFavorite("clinical_trials", t)}
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

        {/* Collaborators */}
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
                  <h3 className="font-bold text-lg mb-1">{c.name}</h3>
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

        {/* Favorites */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-teal-700 mb-4">
            ❤️ My Favorites
          </h2>

          {Object.values(favorites).every((arr) => arr.length === 0) ? (
            <p className="text-gray-500">
              No favorites yet. Click ❤️ to save items.
            </p>
          ) : (
            <>
              {favorites.publications.length > 0 && (
                <>
                  <h3 className="font-bold text-lg mb-2">Publications</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {favorites.publications.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white p-4 rounded-lg shadow hover:shadow-md"
                      >
                        <h4 className="font-semibold">{p.title}</h4>
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 text-sm hover:underline"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {favorites.clinical_trials.length > 0 && (
                <>
                  <h3 className="font-bold text-lg mb-2">Clinical Trials</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {favorites.clinical_trials.map((t) => (
                      <div
                        key={t.id}
                        className="bg-white p-4 rounded-lg shadow hover:shadow-md"
                      >
                        <h4 className="font-semibold">{t.title}</h4>
                        <a
                          href={t.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 text-sm hover:underline"
                        >
                          View Trial
                        </a>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {favorites.collaborators.length > 0 && (
                <>
                  <h3 className="font-bold text-lg mb-2">Collaborators</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {favorites.collaborators.map((c) => (
                      <div
                        key={c.id}
                        className="bg-white p-4 rounded-lg shadow hover:shadow-md"
                      >
                        <h4 className="font-semibold">{c.name}</h4>
                        <p className="text-sm text-gray-600">
                          {c.institution}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
