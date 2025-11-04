import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Do not exit here — server should start and return a friendly error on missing key
const API_KEY = process.env.APILAYER_API_KEY;
if (!API_KEY) {
  console.warn("⚠️ APILAYER_API_KEY not set in .env — AI calls will use fallback only.");
}

const conditions = [
  "Breast Cancer","Heart Disease","Diabetes","Glioma","Lung Cancer",
  "Leukemia","Brain Tumor","Alzheimer’s Disease","Parkinson’s Disease","Prostate Cancer",
];
const countries = ["India","USA","UK","Germany","China"];

export const aiController = async (req, res) => {
  try {
    const { text } = req.body ?? {};
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Missing input text" });
    }

    console.log("🧠 /api/ai/analyze received text:", text);

    // If API key missing, skip external call and use fallback immediately
    if (!API_KEY) {
      console.warn("Using fallback detection because APILAYER_API_KEY is not set.");
      return res.status(200).json(detectFallback(text));
    }

    const API_URL = "https://api.apilayer.com/keyword";
    const headers = {
      "Content-Type": "application/json",
      apikey: API_KEY
    };

    const response = await axios.post(API_URL, { text }, { headers, timeout: 8000 });
    // DEBUG: log full response shape so you can adjust parsing if needed
    console.log("APILayer response.data:", response.data);

    const keywords = response.data?.keywords || [];
    console.log("🗝️ keywords:", keywords);

    // detection using keywords + direct text check
    const result = detectFromKeywordsAndText(keywords, text);
    return res.status(200).json({ ...result, keywords, source: "apilayer" });
  } catch (error) {
    console.error("APILayer API Error:", error.message);
    if (error.response) console.error("API error body:", error.response.data);

    // fallback detection
    const { text = "" } = req.body ?? {};
    const fallback = detectFallback(text);
    return res.status(200).json({ ...fallback, keywords: [], source: "fallback" });
  }
};

// Helper: detection from keywords + text
function detectFromKeywordsAndText(keywords, text) {
  const txt = (text || "").toLowerCase();

  let detectedCondition = "Unknown";
  for (const condition of conditions) {
    const first = condition.toLowerCase().split(" ")[0];
    if (keywords.some(k => k.toLowerCase().includes(first)) || txt.includes(first)) {
      detectedCondition = condition;
      break;
    }
  }

  let detectedCountry = "Global";
  for (const country of countries) {
    if (keywords.some(k => k.toLowerCase().includes(country.toLowerCase())) || txt.includes(country.toLowerCase())) {
      detectedCountry = country;
      break;
    }
  }

  return { condition: detectedCondition, country: detectedCountry };
}

// Helper: simple fallback scanning
function detectFallback(text = "") {
  const txt = text.toLowerCase();
  let fallbackCondition = "Unknown";
  for (const c of conditions) {
    if (txt.includes(c.toLowerCase())) { fallbackCondition = c; break; }
  }
  let fallbackCountry = "Global";
  for (const c of countries) {
    if (txt.includes(c.toLowerCase())) { fallbackCountry = c; break; }
  }
  return { condition: fallbackCondition, country: fallbackCountry };
}
