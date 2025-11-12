import { pool } from "./db/index.js";

// -------------------------------------------
// Create / Setup Researcher Profile
// -------------------------------------------
export const setupResearcher = async (req, res) => {
  try {
    const {
      name,
      email,
      specialization,
      research_interests = [],
      orcid_link = "",
      researchgate_link = "",
      institution = "",
      country = "",
      availability = false,
    } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !specialization) {
      return res.status(400).json({
        error: "Name, email, and specialization are required fields.",
      });
    }

    console.log("Incoming researcher data:", req.body);

    // ✅ Normalize research interests (ensure array)
    const normalizedInterests = Array.isArray(research_interests)
      ? research_interests
      : (research_interests || "").split(",").map((i) => i.trim()).filter(Boolean);

    // ✅ Insert into database
    const insertQuery = `
      INSERT INTO researchers 
        (name, email, specialization, research_interests, orcid_link, researchgate_link, institution, country, availability)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, name, email, specialization;
    `;

    const values = [
      name.trim(),
      email.trim(),
      specialization.trim(),
      normalizedInterests,
      orcid_link.trim(),
      researchgate_link.trim(),
      institution.trim(),
      country.trim(),
      availability,
    ];

    const result = await pool.query(insertQuery, values);
    const newResearcher = result.rows[0];

    console.log("✅ Researcher created:", newResearcher);

    // ✅ Return the new ID for frontend navigation
    return res.status(201).json({
      message: "Researcher profile created successfully.",
      researcher: newResearcher,
    });
  } catch (err) {
    console.error("❌ Error creating researcher:", err);
    return res.status(500).json({ error: "Failed to create researcher profile." });
  }
};
