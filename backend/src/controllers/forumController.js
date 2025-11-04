// src/controllers/forumController.js
import { pool } from "../db/index.js";

// ✅ Fetch all forum posts with replies
export const getForums = async (req, res) => {
  try {
    // Get all forum posts ordered by newest first
    const forumResult = await pool.query(
      `SELECT id, title, content, category, author_name, author_role, created_at
       FROM forums
       ORDER BY created_at DESC`
    );

    const posts = forumResult.rows;

    // Get all replies in one go
    const replyResult = await pool.query(
      `SELECT id, forum_id, reply_text, replier_name, replier_role, created_at
       FROM forum_replies
       ORDER BY created_at ASC`
    );

    // Group replies by forum_id
    const repliesMap = {};
    replyResult.rows.forEach((r) => {
      if (!repliesMap[r.forum_id]) repliesMap[r.forum_id] = [];
      repliesMap[r.forum_id].push(r);
    });

    // Attach replies to each post
    const forumsWithReplies = posts.map((p) => ({
      ...p,
      replies: repliesMap[p.id] || [],
    }));

    res.json(forumsWithReplies);
  } catch (err) {
    console.error("❌ Error fetching forums:", err.message);
    res.status(500).json({ error: "Failed to fetch forum posts." });
  }
};

// ✅ Create a new forum post (Patients)
export const createForumPost = async (req, res) => {
  try {
    const { title, content, category, author_name } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const authorRole = "patient";

    const result = await pool.query(
      `INSERT INTO forums (title, content, category, author_name, author_role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, content, category, author_name || "Anonymous", authorRole]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error creating forum post:", err.message);
    res.status(500).json({ error: "Failed to create forum post." });
  }
};

// ✅ Add a reply to a post (Researchers only)
export const addForumReply = async (req, res) => {
  try {
    const { postId } = req.params;
    const { reply_text, replier_name, replier_role } = req.body;

    if (!reply_text || !replier_name) {
      return res.status(400).json({ error: "Missing reply text or name." });
    }

    const role = replier_role || "researcher";

    const result = await pool.query(
      `INSERT INTO forum_replies (forum_id, reply_text, replier_name, replier_role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [postId, reply_text, replier_name, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error adding reply:", err.message);
    res.status(500).json({ error: "Failed to add reply." });
  }
};
