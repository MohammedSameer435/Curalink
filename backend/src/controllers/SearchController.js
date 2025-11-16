import { pool } from "../db/index.js";

export const searchResearchers = async (req, res) => {
  try {
    const { q = "" } = req.query;

    const search = `%${q.toLowerCase()}%`;

    const result = await pool.query(
      `
      SELECT 
        id,
        name,
        specialization,
        institution,
        country,
        research_interests
      FROM researchers
      WHERE 
        LOWER(name) LIKE $1
        OR LOWER(specialization) LIKE $1
        OR LOWER(institution) LIKE $1
        OR LOWER(country) LIKE $1;
      `,
      [search]
    );

    return res.json(result.rows);

  } catch (error) {
    console.error("❌ Researcher search error:", error);
    res.status(500).json({ error: "Search failed." });
  }
};
