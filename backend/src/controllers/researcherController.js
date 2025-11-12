import { pool } from "./db/index.js";

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
