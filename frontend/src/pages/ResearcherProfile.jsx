import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function ResearcherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const viewerId = localStorage.getItem("activeResearcherId");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/api/researchers/${id}/profile?viewer=${viewerId}`);
      setProfile(res.data);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!profile) return <p>Profile not found.</p>;

  const { researcher, publications, clinical_trials, collaboration_status, collaboration_id } = profile;

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-lg">

        {/* Header */}
        <h1 className="text-3xl font-bold">{researcher.name}</h1>
        <p className="text-gray-600 mt-1">
          {researcher.specialization} — {researcher.institution} ({researcher.country})
        </p>

        {/* Interests */}
        <p className="mt-3 text-gray-700">
          <strong>Interests: </strong>
          {Array.isArray(researcher.research_interests)
            ? researcher.research_interests.join(", ")
            : researcher.research_interests}
        </p>

        {/* Collaboration Buttons */}
        <div className="mt-6">
          {collaboration_status === "accepted" ? (
            <button
              onClick={() => navigate(`/researcher-dashboard?openChatWith=${id}`)}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              💬 Open Chat
            </button>
          ) : collaboration_status === "pending" ? (
            <p className="text-gray-500 italic">Request pending...</p>
          ) : (
            <button
              onClick={async () => {
                await api.post("/api/collaborations/request", {
                  requesterId: viewerId,
                  targetId: id,
                  message: "I'd like to collaborate with you!"
                });
                alert("Collaboration request sent!");
                window.location.reload();
              }}
              className="bg-teal-600 text-white px-4 py-2 rounded"
            >
              🤝 Request Collaboration
            </button>
          )}
        </div>

        {/* Publications */}
        <h2 className="mt-10 text-xl font-semibold">📚 Publications</h2>
        {publications.length === 0 ? (
          <p>No publications found.</p>
        ) : (
          publications.map((p) => (
            <div key={p.id} className="border p-3 mt-3 rounded">
              <h3 className="font-bold">{p.title}</h3>
              <p className="text-gray-600">{p.journal} ({p.year})</p>
              <a href={p.url} target="_blank" rel="noreferrer" className="text-teal-600">View →</a>
            </div>
          ))
        )}

        {/* Clinical Trials */}
        <h2 className="mt-10 text-xl font-semibold">🔬 Clinical Trials</h2>
        {clinical_trials.length === 0 ? (
          <p>No trials found.</p>
        ) : (
          clinical_trials.map((t) => (
            <div key={t.id} className="border p-3 mt-3 rounded">
              <h3 className="font-bold">{t.title}</h3>
              <p className="text-gray-600">{t.country} — {t.status}</p>
              <a href={t.url} target="_blank" rel="noreferrer" className="text-teal-600">View →</a>
            </div>
          ))
        )}

      </div>
    </div>
  );
}
