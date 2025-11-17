import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";

// ==========================================================
// 🔹 Utility: Extract Query Parameters
// ==========================================================
function getQueryParam(search, key) {
  try {
    const params = new URLSearchParams(search);
    return params.get(key);
  } catch {
    return null;
  }
}

// ==========================================================
// 🔹 Chat Component
// ==========================================================
function ChatBox({ collaborationId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/api/messages/${collaborationId}`);
      setMessages(res.data);
    };
    if (collaborationId) load();
  }, [collaborationId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const res = await api.post("/api/messages", {
      collaborationId,
      senderId: currentUserId,
      text,
    });
    setMessages((prev) => [...prev, res.data]);
    setText("");
  };

  return (
    <div className="mt-4 border-t pt-3">
      <h4 className="font-semibold text-gray-700 mb-2">💬 Chat</h4>

      <div className="h-48 overflow-y-auto border p-2 mb-2 rounded">
        {messages.map((m) => (
          <div key={m.id} className="mb-1">
            <strong>{m.sender_name || "You"}:</strong> {m.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={handleSend}
          className="bg-teal-600 text-white px-3 rounded hover:bg-teal-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ==========================================================
// 🔹 MAIN DASHBOARD COMPONENT
// ==========================================================
export default function ResearcherDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // -------------------------------------
  // Get researcher ID (login identity)
  // -------------------------------------
  const stateId = location.state?.researcherId;
  const storedId =
    typeof window !== "undefined"
      ? localStorage.getItem("activeResearcherId")
      : null;
  const queryId = getQueryParam(location.search, "id");

  const [researcherId, setResearcherId] = useState(
    stateId || queryId || storedId || null
  );

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

  // -------------------------------------
  // If user clicked "Open Chat" from profile:
  // Read ?openChatWith=ID
  // -------------------------------------
  const chatTargetId = getQueryParam(location.search, "openChatWith");

  // ==========================================================
  // 🔹 Auto-scroll to chat if redirected from profile
  // ==========================================================
  useEffect(() => {
    if (chatTargetId && dashboard?.collaborators) {
      const collab = dashboard.collaborators.find(
        (c) => c.id == chatTargetId
      );

      if (
        collab &&
        collab.collaboration_status === "accepted" &&
        collab.collaboration_id
      ) {
        const el = document.getElementById(`chat-${collab.collaboration_id}`);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [dashboard]);

  // ==========================================================
  // 🔹 Helper: Load logged-in Researcher ID
  // ==========================================================
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
      setError("Failed to load researcher profile.");
      return null;
    }
  };

  // ==========================================================
  // 🔹 Load Dashboard
  // ==========================================================
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const id = await ensureResearcherId();
        if (!id) return;

        const res = await api.get(`/api/researchers/${id}/dashboard`);
        setDashboard(res.data);
      } catch (err) {
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [researcherId]);

  useEffect(() => {
    if (dashboard?.researcher) {
      setEditableResearcher(dashboard.researcher);
    }
  }, [dashboard]);

  if (loading)
    return <div className="text-center mt-10 text-gray-600">Loading...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!dashboard) return null;

  const {
    researcher,
    publications = [],
    clinical_trials = [],
    collaborators = [],
    incoming_requests = [],
  } = dashboard;

  // ==========================================================
  // 🔹 Render UI
  // ==========================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* ---------- HEADER ---------- */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
            🧬 {researcher.name}
          </h1>

          <button
            onClick={() => navigate("/researcher-search")}
            className="px-5 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 hover:scale-105 transition-all"
          >
            🔍 Search Researchers
          </button>
        </header>

        {/* ---------- PUBLICATIONS ---------- */}
        {/* (Your existing Section component logic stays the same) */}

        {/* ---------- COLLABORATORS ---------- */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-teal-700 mb-4">
            🤝 Suggested Collaborators
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {collaborators.map((c) => (
              <div
                key={c.id}
                className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition-transform"
              >
                <h3 className="font-bold text-lg mb-1">
                  {c.name || "Unnamed Collaborator"}
                </h3>

                {/* ---------- PROFILE LINK ---------- */}
                <button
                  onClick={() => navigate(`/researcher-profile/${c.id}`)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
                >
                  👀 View Profile
                </button>

                {/* ---------- REQUEST / CHAT ---------- */}
                {c.collaboration_status === "accepted" ? (
                  <div id={`chat-${c.collaboration_id}`}>
                    <ChatBox
                      collaborationId={c.collaboration_id}
                      currentUserId={researcher.id}
                    />
                  </div>
                ) : c.collaboration_status === "pending" ? (
                  <p className="text-gray-500 mt-2 italic">
                    Request pending...
                  </p>
                ) : (
                  <button
                    onClick={async () => {
                      try {
                        await api.post("/api/collaborations/request", {
                          requesterId: researcher.id,
                          targetId: c.id,
                          message: "Let's collaborate!",
                        });
                        alert("Request sent!");
                        const updated = await api.get(
                          `/api/researchers/${researcher.id}/dashboard`
                        );
                        setDashboard(updated.data);
                      } catch {
                        alert("Failed to send request.");
                      }
                    }}
                    className="px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 mt-3"
                  >
                    Request Collaboration
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ---------- INCOMING REQUESTS ---------- */}
        {incoming_requests.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-teal-700 mb-4">
              📥 Incoming Collaboration Requests
            </h2>

            {incoming_requests.map((req) => (
              <div key={req.id} className="bg-white p-4 rounded shadow">
                <strong>{req.requester_name}</strong>
                <p>{req.message}</p>

                {req.status === "pending" && (
                  <>
                    <button
                      onClick={async () => {
                        await api.put(`/api/collaborations/${req.id}/respond`, {
                          status: "accepted",
                        });
                        const updated = await api.get(
                          `/api/researchers/${researcher.id}/dashboard`
                        );
                        setDashboard(updated.data);
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded mt-2"
                    >
                      Accept
                    </button>

                    <button
                      onClick={async () => {
                        await api.put(`/api/collaborations/${req.id}/respond`, {
                          status: "rejected",
                        });
                        const updated = await api.get(
                          `/api/researchers/${researcher.id}/dashboard`
                        );
                        setDashboard(updated.data);
                      }}
                      className="px-3 py-1 bg-gray-400 text-white rounded mt-2 ml-2"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
