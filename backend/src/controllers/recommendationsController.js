import { pool } from "./db/index.js";

export const getRecommendations = async (req, res) => {
  try {
    const { condition, country } = req.query;

    if (!condition || condition.trim().length === 0) {
      return res.status(400).json({ error: "Condition is required." });
    }

    const conditionQuery = `%${condition.trim()}%`;
    const hasCountry = country && country.trim().length > 0;
    const countryQuery = hasCountry ? `%${country.trim()}%` : null;

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
    const trialResult = await pool.query(trialQuery, trialParams);

   const expertQuery = `
  SELECT id, name, specialization, institution, country, "condition", url
  FROM experts
  WHERE "condition" ILIKE $1
  ${hasCountry ? "AND country ILIKE $2" : ""}
  ORDER BY id DESC
  LIMIT 10;
`;
const expertParams = hasCountry ? [conditionQuery, countryQuery] : [conditionQuery];
const expertResult = await pool.query(expertQuery, expertParams);

    console.log("🧑‍⚕️ Experts fetched:", expertResult.rows.length);

    // ✅ Return all three categories
    res.json({
      publications: pubResult.rows,
      clinical_trials: trialResult.rows,
      experts: expertResult.rows,
    });
  } catch (err) {
    console.error("❌ Error fetching recommendations:", err);
    res.status(500).json({ error: "Failed to fetch recommendations." });
  }
};
