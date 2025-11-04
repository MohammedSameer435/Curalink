import { pool } from "../db/index.js";

export const getRecommendations = async (req, res) => {
  try {
    const { condition, country } = req.query;

    if (!condition || condition.trim().length === 0) {
      return res.status(400).json({ error: "Condition is required." });
    }

    const conditionQuery = `%${condition.trim()}%`;
    const hasCountry = country && country.trim().length > 0;
    const countryQuery = hasCountry ? `%${country.trim()}%` : null;

    // --- Debug logging (to check what’s actually being executed) ---
    console.log("🧠 Condition:", conditionQuery);
    console.log("🌍 Country:", countryQuery);

    // --- Publications Query ---
    const pubQuery = `
      SELECT id, title, journal, year, country, url, "condition"
      FROM publications
      WHERE "condition" ILIKE $1
      ${hasCountry ? "AND country ILIKE $2" : ""}
      ORDER BY year DESC
      LIMIT 10;
    `;
    const pubParams = hasCountry ? [conditionQuery, countryQuery] : [conditionQuery];
    console.log("📘 PUB QUERY:", pubQuery);
    console.log("📘 PUB PARAMS:", pubParams);

    const pubResult = await pool.query(pubQuery, pubParams);

    // --- Clinical Trials Query ---
    const trialQuery = `
      SELECT id, trial_id, title, phase, country, url, status, "condition"
      FROM clinical_trials
      WHERE "condition" ILIKE $1
      ${hasCountry ? "AND country ILIKE $2" : ""}
      ORDER BY id DESC
      LIMIT 10;
    `;
    const trialParams = hasCountry ? [conditionQuery, countryQuery] : [conditionQuery];
    console.log("🧪 TRIAL QUERY:", trialQuery);
    console.log("🧪 TRIAL PARAMS:", trialParams);

    const trialResult = await pool.query(trialQuery, trialParams);

    // --- Experts (temporary) ---
    const experts = [
      {
        id: 1,
        name: "Dr. A. Mehta",
        specialization: condition,
        institution: "AIIMS Delhi",
        country: "India",
        url: "https://aiims.edu",
      },
      {
        id: 2,
        name: "Dr. Sarah Thompson",
        specialization: condition,
        institution: "Harvard Medical School",
        country: "USA",
        url: "https://hms.harvard.edu",
      },
      {
        id: 3,
        name: "Dr. Chen Wei",
        specialization: condition,
        institution: "Peking Union Medical College",
        country: "China",
        url: "https://english.pumch.cn/",
      },
    ].filter((e) =>
      hasCountry ? e.country.toLowerCase().includes(country.toLowerCase()) : true
    );

    res.json({
      publications: pubResult.rows,
      clinical_trials: trialResult.rows,
      experts,
    });
  } catch (err) {
    console.error("❌ Error fetching recommendations:", err);
    res.status(500).json({ error: "Failed to fetch recommendations." });
  }
};
