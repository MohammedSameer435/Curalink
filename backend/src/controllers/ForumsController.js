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

// ✅ Add reply to a patient forum post
export const addForumReply = async (req, res) => {
  try {
    const { postId } = req.params;
    let { reply_text, replier_name, replier_role } = req.body;

    if (!reply_text || reply_text.trim().length === 0) {
      return res.status(400).json({ error: "Reply text cannot be empty." });
    }

    // 🧩 Auto-extract name if user typed something like:
    // "This helps recovery. — Dr. Jane Doe"
    if (!replier_name && reply_text.includes("—")) {
      const parts = reply_text.split("—");
      reply_text = parts[0].trim();
      replier_name = parts[1]?.trim() || "Researcher";
    }

    // 🧠 Default values if frontend doesn’t send them
    replier_name = replier_name || "Researcher";
    replier_role = replier_role || "researcher";

    console.log("📝 New reply received:", { postId, reply_text, replier_name, replier_role });

    const insertQuery = `
      INSERT INTO researcher_forum_replies (post_id, reply_text, replier_name, replier_role)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [postId, reply_text, replier_name, replier_role]);

    return res.status(201).json({
      message: "Reply added successfully.",
      reply: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error adding reply:", err);
    return res.status(500).json({ error: "Failed to add reply." });
  }
};
