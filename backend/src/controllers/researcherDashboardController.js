// controllers/ResearchersController.js
import { pool } from "../db/index.js";

export const getResearcherDashboard = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("📩 Incoming Request for Researcher Dashboard:", id);

    if (!id) {
      return res.status(400).json({ error: "Researcher ID is required." });
    }

    // 1️⃣ Fetch Researcher Info (with defaults for missing fields)
    const researcherQuery = `
      SELECT 
        id,
        COALESCE(name, 'Unknown Researcher') AS name,
        COALESCE(specialization, 'General Research') AS specialization,
        COALESCE(research_interests, ARRAY[]::text[]) AS research_interests,
        COALESCE(institution, 'N/A') AS institution,
        COALESCE(country, 'N/A') AS country,
        COALESCE(availability, false) AS availability,
        COALESCE(orcid_link, '') AS orcid_link,
        COALESCE(researchgate_link, '') AS researchgate_link
      FROM researchers
      WHERE id = $1
      LIMIT 1;
    `;
    const researcherResult = await pool.query(researcherQuery, [id]);

    if (researcherResult.rows.length === 0) {
      return res.status(404).json({ error: "Researcher not found." });
    }

    const researcher = researcherResult.rows[0];
    const specializationToUse = researcher.specialization || "General Research";

    // Publications
const pubQuery = `
  SELECT 
    id, 
    COALESCE(title, 'Untitled Publication') AS title,
    COALESCE(journal, 'Unknown Journal') AS journal,
    COALESCE(year, 2024) AS year,
    COALESCE(country, 'Unknown') AS country,
    COALESCE(url, '') AS url,
    COALESCE("condition", 'General Research') AS "condition"
  FROM publications
  WHERE LOWER("specialization") LIKE LOWER($1)
  ORDER BY year DESC
  LIMIT 10;
`;
const pubResult = await pool.query(pubQuery, [`%${specializationToUse}%`]);

// 3️⃣ Fetch Related Clinical Trials (fallback-safe)
const trialQuery = `
  SELECT 
    id,
    trial_id,
    title,
    phase,
    country,
    url,
    status,
    "condition"
  FROM researcher_clinical_trials
  WHERE LOWER("condition") LIKE LOWER($1)
  ORDER BY id DESC
  LIMIT 10;
`;
const trialResult = await pool.query(trialQuery, [`%${specializationToUse}%`]);


// Fallback: if no matches found, return general data
if (pubResult.rows.length === 0) {
  const fallback = await pool.query(
    `SELECT id, title, journal, year, country, url, "condition"
     FROM publications
     ORDER BY year DESC
     LIMIT 10;`
  );
  pubResult.rows = fallback.rows;
}

if (trialResult.rows.length === 0) {
  const fallback = await pool.query(
    `SELECT id, trial_id, title, phase, country, url, status, "condition"
     FROM clinical_trials
     ORDER BY id DESC
     LIMIT 10;`
  );
  trialResult.rows = fallback.rows;
}


    // 4️⃣ Suggested Collaborators (same specialization, exclude self)
    const collabQuery = `
      SELECT 
        id, 
        COALESCE(name, 'Unknown Researcher') AS name,
        COALESCE(specialization, 'General Research') AS specialization,
        COALESCE(research_interests, ARRAY[]::text[]) AS research_interests,
        COALESCE(institution, 'N/A') AS institution,
        COALESCE(country, 'N/A') AS country,
        COALESCE(availability, false) AS availability
      FROM researchers
      WHERE COALESCE(specialization, 'General Research') = $1
        AND id <> $2
      LIMIT 10;
    `;
    const collabResult = await pool.query(collabQuery, [specializationToUse, id]);

    // 5️⃣ Optional: fetch forums (if you want later)
    const researcher_forums = [];
    const patient_forums = [];

    // 6️⃣ Summaries helper
    const summarize = (txt) =>
      txt && txt.length > 100 ? txt.slice(0, 100) + "..." : txt || "No summary available.";

    const publications = pubResult.rows.map((p) => ({
      ...p,
      summary: summarize(p.title),
    }));

    const clinical_trials = trialResult.rows.map((t) => ({
      ...t,
      summary: summarize(t.title),
    }));

    // ✅ Final response
    return res.json({
      researcher,
      publications,
      clinical_trials,
      collaborators: collabResult.rows,
      researcher_forums,
      patient_forums,
    });
  } catch (err) {
    console.error("❌ Error in getResearcherDashboard:", err);
    return res.status(500).json({ error: "Failed to load researcher dashboard." });
  }
};

export const updateResearcher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialization, institution, country, research_interests } = req.body;

    if (!id) return res.status(400).json({ error: "Researcher ID is required." });

    const query = `
      UPDATE researchers
      SET
        name = COALESCE($1, name),
        specialization = COALESCE($2, specialization),
        institution = COALESCE($3, institution),
        country = COALESCE($4, country),
        research_interests = COALESCE($5, research_interests)
      WHERE id = $6
      RETURNING *;
    `;

    const values = [
      name,
      specialization,
      institution,
      country,
      research_interests, // Should be an array
      id,
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Researcher not found." });

    return res.json({ researcher: result.rows[0] });
  } catch (err) {
    console.error("❌ Error updating researcher:", err);
    return res.status(500).json({ error: "Failed to update researcher." });
  }
};

