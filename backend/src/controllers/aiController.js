import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.APILAYER_API_KEY;

const conditions = [
  "Breast Cancer","Heart Disease","Diabetes","Glioma","Lung Cancer",
  "Leukemia","Brain Tumor","Alzheimer’s Disease","Parkinson’s Disease","Prostate Cancer",
];

const countries = ["India","USA","UK","Germany","China","Japan","Canada","Australia"];

// -----------------------------------------
// MAIN CONTROLLER
// -----------------------------------------
export const aiController = async (req, res) => {
  try {
    const { text } = req.body ?? {};

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Missing input text" });
    }

    console.log("🧠 AI received text:", text);

    // If missing API key → fallback
    if (!API_KEY) {
      console.warn("⚠️ No API key — using fallback extraction.");
      return res.status(200).json(detectAll(text));
    }

    // Try APILayer
    const API_URL = "https://api.apilayer.com/keyword";
    const headers = {
      "Content-Type": "application/json",
      apikey: API_KEY,
    };

    const response = await axios.post(API_URL, { text }, { headers });

    const keywords = response.data?.keywords || [];

    const result = detectAll(text, keywords);

    return res.status(200).json({
      ...result,
      keywords,
      source: "apilayer",
    });

  } catch (err) {
    console.error("AI error:", err.message);

    // fallback
    const result = detectAll(req.body?.text || "");
    return res.status(200).json({ ...result, source: "fallback" });
  }
};

// ----------------------------------------------------------
// 🔍 Extract Name + Condition + Country (AI or fallback)
// ----------------------------------------------------------
function detectAll(text = "", keywords = []) {
  const lower = text.toLowerCase();

  // ---------------- NAME DETECTION ----------------
  let detectedName = "Unknown";
  const nameMatch = text.match(/my name is ([A-Za-z ]+)/i)
    || text.match(/i am ([A-Za-z ]+)/i)
    || text.match(/this is ([A-Za-z ]]+)/i);

  if (nameMatch && nameMatch[1]) {
    detectedName = nameMatch[1].trim();
  }

  // ---------------- CONDITION DETECTION ----------------
  let detectedCondition = "Unknown";

  for (const cond of conditions) {
    const firstWord = cond.toLowerCase().split(" ")[0];
    if (lower.includes(firstWord) || keywords?.some(k => k.toLowerCase().includes(firstWord))) {
      detectedCondition = cond;
      break;
    }
  }

  // ---------------- COUNTRY DETECTION ----------------
  let detectedCountry = "Global";

  for (const c of countries) {
    if (lower.includes(c.toLowerCase()) || keywords?.some(k => k.toLowerCase().includes(c.toLowerCase()))) {
      detectedCountry = c;
      break;
    }
  }

  return {
    name: detectedName,
    condition: detectedCondition,
    country: detectedCountry
  };
}
