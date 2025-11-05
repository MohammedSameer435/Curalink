import { pool } from "../db/index.js";

// ✅ Fetch forums related to a specialization (for researcher dashboard/forums)
export const getForumsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;

    if (!specialization) {
      return res.status(400).json({ error: "Specialization is required." });
    }

    const researcherForumsQuery = `
      SELECT * FROM researcher_forums
      WHERE LOWER(specialization) = LOWER($1)
      ORDER BY created_at DESC;
    `;
    const patientForumsQuery = `
      SELECT pf.*, 
        COALESCE(json_agg(fr.*) FILTER (WHERE fr.id IS NOT NULL), '[]') AS replies
      FROM patient_forums pf
      LEFT JOIN researcher_forum_replies fr ON pf.id = fr.post_id
      WHERE LOWER(pf.specialization) = LOWER($1)
      GROUP BY pf.id
      ORDER BY pf.created_at DESC;
    `;

    const [researcherForums, patientForums] = await Promise.all([
      pool.query(researcherForumsQuery, [specialization]),
      pool.query(patientForumsQuery, [specialization]),
    ]);

    return res.json({
      researcher_forums: researcherForums.rows,
      patient_forums: patientForums.rows,
    });
  } catch (err) {
    console.error("❌ Error fetching forums:", err);
    return res.status(500).json({ error: "Failed to load forums." });
  }
};
export const addForumReply = async (req, res) => {
  try {
    const { postId } = req.params;
    let { reply_text, replier_name } = req.body;

    // 🧩 Auto-extract name if written inline with "—"
    if (!replier_name && reply_text.includes("—")) {
      const parts = reply_text.split("—");
      reply_text = parts[0].trim();
      replier_name = parts[1]?.trim() || "Researcher";
    }

    if (!reply_text || !replier_name) {
      return res.status(400).json({ error: "Missing reply text or replier name." });
    }

    const insertQuery = `
      INSERT INTO researcher_forum_replies (post_id, reply_text, replier_name)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const result = await pool.query(insertQuery, [postId, reply_text, replier_name]);

    return res.status(201).json({
      message: "Reply added successfully.",
      reply: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error adding reply:", err);
    return res.status(500).json({ error: "Failed to add reply." });
  }
};
