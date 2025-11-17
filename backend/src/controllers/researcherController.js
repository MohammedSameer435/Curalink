import { pool } from "../db/index.js";

export const getSpecializations = async (req, res) => {
  try {
    const result = await pool.query("SELECT name FROM specializations ORDER BY id ASC");
    const specializations = result.rows.map((row) => row.name);
    res.json({ specializations });
  } catch (err) {
    console.error("Error fetching specializations:", err);
    res.status(500).json({ error: "Failed to fetch specializations" });
  }
};
export const getResearchers= async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM researchers ORDER BY id ASC;");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching researchers:", err);
    res.status(500).json({ error: "Failed to fetch researchers." });
  }
};

export const getResearcherPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = req.query.viewer || null;

    // 🧬 1. Basic researcher profile
    const researcherRes = await pool.query(
      `
      SELECT id, name, specialization, research_interests, institution, country, availability
      FROM researchers
      WHERE id = $1;
      `,
      [id]
    );

    if (researcherRes.rows.length === 0) {
      return res.status(404).json({ error: "Researcher not found" });
    }

    const researcher = researcherRes.rows[0];
    const specialization = researcher.specialization || "General Research";

    // 📚 2. Publications
    const publicationsRes = await pool.query(
      `
      SELECT id, title, journal, year, url
      FROM publications
      WHERE LOWER(specialization) LIKE LOWER($1)
      ORDER BY year DESC
      LIMIT 5;
      `,
      [`%${specialization}%`]
    );

    // 🔬 3. Clinical trials
    const trialsRes = await pool.query(
      `
      SELECT id, title, url, country, status
      FROM researcher_clinical_trials
      WHERE LOWER(condition) LIKE LOWER($1)
      ORDER BY id DESC
      LIMIT 5;
      `,
      [`%${specialization}%`]
    );

    // 🤝 4. Suggested collaborators (same specialization)
    const collabSuggestions = await pool.query(
      `
      SELECT id, name, specialization, institution, country
      FROM researchers
      WHERE id <> $1
      AND COALESCE(specialization, 'General Research') = $2
      LIMIT 10;
      `,
      [id, specialization]
    );

    // 📥 5. Incoming collaboration requests (if viewer is the target researcher)
    const incomingRequests = await pool.query(
      `
      SELECT cr.*, r.name AS requester_name
      FROM collaboration_requests cr
      JOIN researchers r ON r.id = cr.requester_id
      WHERE cr.target_id = $1
      ORDER BY cr.created_at DESC;
      `,
      [id]
    );

    // 🔄 6. Collaboration relation with viewer
    let collaboration = null;

    if (viewerId) {
      const collabRes = await pool.query(
        `
        SELECT *
        FROM collaboration_requests
        WHERE (requester_id = $1 AND target_id = $2)
           OR (requester_id = $2 AND target_id = $1)
        LIMIT 1;
        `,
        [viewerId, id]
      );

      collaboration = collabRes.rows[0] || null;
    }

    // 🎉 Final response
    return res.json({
      researcher,
      publications: publicationsRes.rows,
      clinical_trials: trialsRes.rows,
      collaborators: collabSuggestions.rows,
      incoming_requests: incomingRequests.rows,
      collaboration_status: collaboration?.status || null,
      collaboration_id: collaboration?.id || null,
    });

  } catch (err) {
    console.error("❌ Error loading public profile:", err);
    res.status(500).json({ error: "Could not load profile" });
  }
};
