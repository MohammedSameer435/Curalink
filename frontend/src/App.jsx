// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingPage.jsx";
import PatientProfileSetup from "./pages/patients.jsx";
import PatientDashboard from "./pages/PatientDashboard.jsx";
import ResearcherProfileSetup from "./pages/researchers.jsx";
import Forums from "./pages/ForumPage.jsx";
import ResearcherDashboard from "./pages/ResearcherDashboard.jsx";
import ResearcherForums from "./pages/ResearcherForums.jsx"; 
import SelectResearcher from "./pages/SelectResearcher.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/patients" element={<PatientProfileSetup />} />
        <Route path="/researchers" element={<ResearcherProfileSetup />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/forums" element={<Forums />} />
        <Route path="/researcher-dashboard" element={<ResearcherDashboard />} />
        <Route path="/select-researcher" element={<SelectResearcher />} />
        <Route path="/researcher-forums" element={<ResearcherForums />} />
      </Routes>
    </Router>
  );
}
