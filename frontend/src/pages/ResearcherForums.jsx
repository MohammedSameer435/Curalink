import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";

export default function ResearcherForums() {
  const location = useLocation();
  const navigate = useNavigate();

  const { researcherId, specialization } = location.state || {};
  const [forums, setForums] = useState({ researcher_forums: [], patient_forums: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyInputs, setReplyInputs] = useState({});

  useEffect(() => {
    const fetchForums = async () => {
      if (!researcherId) {
        setError("Missing researcher ID.");
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(
  `/api/researcherforums/${specialization}`
);

        setForums({
          researcher_forums: res.data.researcher_forums || [],
          patient_forums: res.data.patient_forums || [],
        });
      } catch (err) {
        console.error("Error fetching forums:", err);
        setError("Failed to load forums.");
      } finally {
        setLoading(false);
      }
    };

    fetchForums();
  }, [researcherId]);

  // ✅ Add reply (only to patient posts)
  const addReply = async (postId) => {
    const replyText = (replyInputs[postId] || "").trim();
    if (!replyText) {
      alert("Please enter a reply before submitting.");
      return;
    }

    try {
      await api.post(`/api/researcherforums/${postId}/replies`, {

        reply_text: replyText,
        replier_name: specialization ? `Researcher (${specialization})` : "Researcher",
        replier_role: "researcher",
      });

      setReplyInputs((prev) => ({ ...prev, [postId]: "" }));

      // Refresh data
      const res = await api.get(
  `/api/forums/${specialization}`
);

      setForums({
        researcher_forums: res.data.researcher_forums || [],
        patient_forums: res.data.patient_forums || [],
      });
    } catch (err) {
      console.error("Error adding reply:", err);
      alert("Failed to add reply.");
    }
  };

  if (loading)
    return <div className="text-center mt-10 text-gray-600">Loading forums...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;

  const { researcher_forums, patient_forums } = forums;

  return (
    <div className="min-h-screen bg-blue-50 px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          🧠 Researcher Forums ({specialization})
        </h1>
        <button
          onClick={() => navigate("/researcher-dashboard")}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Researcher Forums */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">
          🧬 Researcher Discussions ({specialization})
        </h2>

        {researcher_forums.length === 0 ? (
          <p className="text-gray-500">No researcher discussions yet for {specialization}.</p>
        ) : (
          researcher_forums.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-xl shadow mb-6 border border-gray-100"
            >
              <h2 className="font-bold text-lg mb-1">{p.title}</h2>
              <p className="text-sm text-gray-600 mb-1">
                Category: {p.category}
              </p>
              <p className="text-gray-700 mb-3">{p.content}</p>
              <p className="text-xs text-gray-400">
                Posted by {p.author_name || "Anonymous"}
              </p>
            </div>
          ))
        )}
      </section>

      {/* Patient Forums */}
      <section>
        <h2 className="text-2xl font-semibold text-green-700 mb-4">
          💬 Patients Forum (Relevant to {specialization})
        </h2>

        {patient_forums.length === 0 ? (
          <p className="text-gray-500">
            No patient discussions found related to {specialization}.
          </p>
        ) : (
          patient_forums.map((post) => (
            <div
              key={post.id}
              className="bg-white p-5 rounded-xl shadow mb-6 border border-gray-100"
            >
              <h3 className="font-bold text-lg">{post.title}</h3>
              <p className="text-sm text-gray-600 mb-1">{post.category}</p>
              <p className="text-gray-700 mb-2">{post.content}</p>
              <p className="text-xs text-gray-400 mb-3">
                By {post.author_name || "Anonymous"}
              </p>

              {/* Replies */}
              <div className="ml-4 mb-3">
                {post.replies && post.replies.length > 0 ? (
                  post.replies.map((r) => (
                    <div
                      key={r.id}
                      className="bg-gray-50 p-3 rounded mb-2 border border-gray-100"
                    >
                      <p className="text-sm text-gray-700">{r.reply_text}</p>
                      <p className="text-xs text-gray-500">— {r.replier_name}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No replies yet.</p>
                )}
              </div>

              {/* Reply input (for researcher only) */}
              <div className="ml-4">
                <textarea
                  placeholder={`Reply to this ${post.category.toLowerCase()} discussion...`}
                  className="border p-2 w-full rounded-lg mb-2"
                  rows={2}
                  value={replyInputs[post.id] || ""}
                  onChange={(e) =>
                    setReplyInputs((s) => ({
                      ...s,
                      [post.id]: e.target.value,
                    }))
                  }
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => addReply(post.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() =>
                      setReplyInputs((s) => ({ ...s, [post.id]: "" }))
                    }
                    className="bg-gray-200 px-3 py-1 rounded text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
