// client/src/pages/ForumPage.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function ForumPage() {
  const navigate = useNavigate();
  const [forumPosts, setForumPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "",
    author_name: "",
  });
  const [replyInputs, setReplyInputs] = useState({});
  const [replierNames, setReplierNames] = useState({});
  const [researcherMode, setResearcherMode] = useState(false);

  const fetchForums = async () => {
    try {
      const res = await api.get("/api/forums");
      setForumPosts(res.data || []);
    } catch (err) {
      console.error("Error fetching forums:", err);
    }
  };

  const createPost = async () => {
    if (!newPost.title || !newPost.content || !newPost.category) {
      return alert("Please fill Title, Content and Category.");
    }
    try {
      await api.post("/api/forums", newPost);
      setNewPost({ title: "", content: "", category: "", author_name: "" });
      fetchForums();
    } catch (err) {
      console.error("Error creating forum post:", err);
      alert("Failed to create post. Try again.");
    }
  };

  const addReply = async (postId) => {
    const reply_text = (replyInputs[postId] || "").trim();
    const replier_name = (replierNames[postId] || "").trim();

    if (!researcherMode) {
      return alert("Only registered researchers may reply. Toggle 'I'm a researcher' to continue.");
    }
    if (!reply_text || !replier_name) {
      return alert("Please enter your name and reply text.");
    }

    try {
      await api.post(`/api/forums/${postId}/replies`, {
        reply_text,
        replier_name,
        replier_role: "researcher",
      });
      setReplyInputs((s) => ({ ...s, [postId]: "" }));
      setReplierNames((s) => ({ ...s, [postId]: "" }));
      fetchForums();
    } catch (err) {
      console.error("Error adding reply:", err);
      alert("Failed to add reply.");
    }
  };

  useEffect(() => {
    fetchForums();
  }, []);

  // 🧠 Separate posts
  const patientPosts = forumPosts.filter(
    (p) => !p.author_role || p.author_role === "patient"
  );
  const researcherPosts = forumPosts.filter(
    (p) => p.author_role === "researcher"
  );

  return (
    <div className="min-h-screen bg-blue-50 px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🧠 Community Forums</h1>
        
      </div>

      {/* Post creation */}
      <div className="bg-white p-4 rounded-xl shadow mb-10">
        <h3 className="font-semibold mb-2">Ask the community (patients only)</h3>
        <input
          placeholder="Title"
          className="border p-2 w-full mb-2 rounded-lg"
          value={newPost.title}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
        />
        <textarea
          placeholder="Your question..."
          className="border p-2 w-full mb-2 rounded-lg"
          rows={3}
          value={newPost.content}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
        />
        <select
          className="border p-2 w-full mb-2 rounded-lg"
          value={newPost.category}
          onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
        >
          <option value="">-- Select Category --</option>
          <option value="Cancer Research">Cancer Research</option>
          <option value="Clinical Trials Insights">Clinical Trials Insights</option>
        </select>
        <input
          placeholder="Your Name"
          className="border p-2 w-full mb-2 rounded-lg"
          value={newPost.author_name}
          onChange={(e) => setNewPost({ ...newPost, author_name: e.target.value })}
        />
        <div className="flex gap-2">
          <button
            onClick={createPost}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Post Question
          </button>

          <label className="ml-3 inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={researcherMode}
              onChange={() => setResearcherMode((s) => !s)}
            />
            I'm a researcher (enable replies)
          </label>
        </div>
      </div>

      {/* 🩺 Section 1 — Patient Posts */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-blue-800 mb-3">
          💬 Patient Discussions
        </h2>
        {patientPosts.length === 0 ? (
          <p className="text-gray-500">No discussions yet. Be the first to post!</p>
        ) : (
          patientPosts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded-xl shadow mb-6">
              <h3 className="font-bold text-lg">{post.title}</h3>
              <p className="text-sm text-gray-600 mb-1">{post.category}</p>
              <p className="text-gray-700 mb-2">{post.content}</p>
              <p className="text-xs text-gray-400 mb-3">
                By {post.author_name || "Anonymous"}
              </p>

              <div className="ml-4 mb-3">
                {post.replies && post.replies.length > 0 ? (
                  post.replies.map((r) => (
                    <div key={r.id} className="bg-gray-50 p-3 rounded mb-2">
                      <p className="text-sm text-gray-700">{r.reply_text}</p>
                      <p className="text-xs text-gray-400">— {r.replier_name}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No replies yet.</p>
                )}
              </div>

              {researcherMode ? (
                <div className="ml-4">
                  <textarea
                    placeholder="Type your reply (researchers only)..."
                    className="border p-2 w-full rounded-lg mb-2"
                    rows={2}
                    value={replyInputs[post.id] || ""}
                    onChange={(e) =>
                      setReplyInputs((s) => ({ ...s, [post.id]: e.target.value }))
                    }
                  />
                  <input
                    placeholder="Your name (researcher)"
                    className="border p-2 w-full rounded-lg mb-2"
                    value={replierNames[post.id] || ""}
                    onChange={(e) =>
                      setReplierNames((s) => ({
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
                      onClick={() => {
                        setReplyInputs((s) => ({ ...s, [post.id]: "" }));
                        setReplierNames((s) => ({ ...s, [post.id]: "" }));
                      }}
                      className="bg-gray-200 px-3 py-1 rounded text-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 ml-4">
                  Replies are restricted to verified researchers.
                </p>
              )}
            </div>
          ))
        )}
      </section>

      {/* 🧬 Section 2 — Researcher Posts */}
      <section>
        <h2 className="text-2xl font-semibold text-green-700 mb-3">
          🧬 From Researchers
        </h2>
        {researcherPosts.length === 0 ? (
          <p className="text-gray-500">
            No posts from researchers yet. Check back soon!
          </p>
        ) : (
          researcherPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white p-4 rounded-xl shadow mb-6 border border-green-100"
            >
              <h3 className="font-bold text-lg text-green-800">{post.title}</h3>
              <p className="text-sm text-gray-600 mb-1">{post.category}</p>
              <p className="text-gray-700 mb-2">{post.content}</p>
              <p className="text-xs text-gray-400 mb-3">
                By Researcher {post.author_name || "Anonymous"}
              </p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
