import express from "express";
import { getSpecializations } from "../controllers/researcherController.js"; 
import pool from "../db/index.js"
const router = express.Router();

router.get("/specializations/list", getSpecializations);

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM researchers ORDER BY id ASC;");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching researchers:", err);
    res.status(500).json({ error: "Failed to fetch researchers." });
  }
});

export default router;
