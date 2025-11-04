import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function PatientProfileSetup() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [showAllExperts, setShowAllExperts] = useState(false);

  const conditions = [
    "Breast Cancer",
    "Heart Disease",
    "Diabetes",
    "Glioma",
    "Lung Cancer",
    "Leukemia",
    "Brain Tumor",
    "Alzheimer’s Disease",
    "Parkinson’s Disease",
    "Prostate Cancer",
  ];

  const countries = [
    "India",
    "USA",
    "UK",
    "Germany",
    "China"
  ];

  const analyzeText = async () => {
    if (!text.trim()) {
      alert("Please enter some information before analysis.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/ai/analyze", { text });
      setAiResult(res.data);
      setSelectedCondition(res.data.condition);
      setSelectedCountry(res.data.country || "");
    } catch (err) {
      console.error("AI error:", err);
      alert("AI analysis failed. You can still select your condition and country manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    const condition = selectedCondition.trim();
    const country = showAllExperts ? "" : selectedCountry.trim();

    if (!condition) {
      alert("Please select or enter a condition before continuing.");
      return;
    }

    navigate("/patient-dashboard", {
      state: { condition, country },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-100 text-gray-800 px-6 py-10">
      <h1 className="text-4xl font-extrabold mb-4">Patient Profile Setup</h1>
      <p className="text-lg text-center max-w-2xl mb-6 text-gray-600">
        Help us understand your medical background so we can recommend relevant{" "}
        <strong>publications, health experts,</strong> and{" "}
        <strong>clinical trials</strong> tailored to your needs. You can either
        describe your condition in natural language or choose manually below.
      </p>

      {/* Step 1: AI-based Natural Language Input */}
      <div className="w-full sm:w-96 bg-white border p-5 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">AI Assistant</h2>
        <textarea
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Example: I have brain cancer and live in Japan."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={analyzeText}
          className="mt-4 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow"
        >
          {loading ? "Analyzing..." : "Analyze with AI"}
        </button>

        {aiResult && (
          <div className="mt-4 bg-gray-50 p-3 rounded-lg border">
            <p className="font-medium text-gray-800">
              ✅ Detected Condition: <span className="font-semibold">{aiResult.condition}</span>
            </p>
            <p className="font-medium text-gray-800">
              🌍 Detected Country: <span className="font-semibold">{aiResult.country}</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Personalized results will be shown based on this condition and country.
            </p>
          </div>
        )}
      </div>

      {/* Step 2: Manual Input & Filters */}
      <div className="w-full sm:w-96 bg-white border p-5 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-3">Manual Input</h2>

        <label className="block font-semibold mb-2">Select or Update Condition</label>
        <select
          className="w-full border px-3 py-2 rounded-lg"
          value={selectedCondition}
          onChange={(e) => setSelectedCondition(e.target.value)}
        >
          <option value="">-- Choose Condition --</option>
          {conditions.map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label className="block font-semibold mt-4 mb-2">Select Country</label>
        <select
          className="w-full border px-3 py-2 rounded-lg"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          disabled={showAllExperts}
        >
          <option value="">-- Choose Country --</option>
          {countries.map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="mt-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={showAllExperts}
            onChange={() => setShowAllExperts(!showAllExperts)}
          />
          <span>Show all experts (global)</span>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-8 py-4 px-10 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-md"
      >
        Save and Continue
      </button>
    </div>
  );
}
