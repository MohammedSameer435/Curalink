import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function PatientDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { condition, country } = location.state || {};

  const [favorites, setFavorites] = useState({
    publications: [],
    experts: [],
    clinical_trials: [],
  });

  const [data, setData] = useState({
    publications: [],
    experts: [],
    clinical_trials: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleFavorite = (type, item) => {
    setFavorites((prev) => {
      const exists = prev[type].some((f) => f.id === item.id);
      if (exists) return prev;
      return { ...prev, [type]: [...prev[type], item] };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/recommendations", {
          params: { condition, country },
        });
        setData(res.data);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [condition, country]);

  if (loading)
    return <div className="text-center mt-10 text-gray-600">Loading personalized dashboard...</div>;
  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 px-6 py-10">
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
          🩺 Personalized Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Showing results for{" "}
          <span className="font-semibold text-teal-700">{condition || "All Conditions"}</span>{" "}
          {country ? (
            <>
              in <span className="font-semibold text-teal-700">{country}</span>
            </>
          ) : (
            <>(Global View)</>
          )}
        </p>
      </header>

      {/* Forums Button */}
      <div className="flex justify-center mb-10">
        <button
          onClick={() => navigate("/forums")}
          className="bg-teal-600 text-white px-5 py-2 rounded-lg shadow hover:bg-teal-700 hover:scale-105 transition-all"
        >
          🧠 Go to Community Forums
        </button>
      </div>

      {/* Publications */}
      <Section
        title="📚 Publications"
        items={data.publications}
        type="publications"
        onFavorite={handleFavorite}
      />

      {/* Experts */}
      <Section
        title="👩‍⚕️ Health Experts"
        items={data.experts}
        type="experts"
        onFavorite={handleFavorite}
        emptyText={`No experts found ${
          country ? `in ${country}` : "globally"
        } for this selection.`}
      />

      {/* Clinical Trials */}
      <Section
        title="🔬 Clinical Trials"
        items={data.clinical_trials}
        type="clinical_trials"
        onFavorite={handleFavorite}
      />

      {/* Favorites */}
      <Favorites favorites={favorites} />
    </div>
  );
}

// Reusable Section component
function Section({ title, items, type, onFavorite, emptyText }) {
  if (!items?.length)
    return <p className="text-center text-gray-500">{emptyText || `No ${type} found.`}</p>;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold text-teal-700 mb-4">{title}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition-transform hover:-translate-y-1"
          >
            <h3 className="font-bold text-lg mb-1">{item.title || item.name}</h3>
            {item.journal && (
              <p className="text-gray-600 text-sm">
                {item.journal} ({item.year})
              </p>
            )}
            {item.specialization && (
              <p className="text-gray-600 text-sm">{item.specialization}</p>
            )}
            <p className="text-sm text-gray-700 mt-2 leading-relaxed">
              {item.summary || item.location || item.institution}
            </p>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 text-sm font-medium hover:underline mt-2 inline-block"
              >
                View →
              </a>
            )}
            <div className="flex justify-end mt-3">
              <button
                onClick={() => onFavorite(type, item)}
                className="text-rose-500 text-sm"
              >
                ❤️
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Favorites component
function Favorites({ favorites }) {
  const allFavs = [
    ...favorites.publications,
    ...favorites.experts,
    ...favorites.clinical_trials,
  ];
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-teal-700 mb-4">❤️ My Favorites</h2>
      {allFavs.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {allFavs.map((f, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl shadow">
              <h4 className="font-semibold">{f.title || f.name}</h4>
              {f.url && (
                <a
                  href={f.url}
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
      ) : (
        <p className="text-gray-500">No favorites yet.</p>
      )}
    </section>
  );
}
