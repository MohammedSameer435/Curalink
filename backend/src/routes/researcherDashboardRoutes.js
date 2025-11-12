import express from "express";
import { getResearcherDashboard, updateResearcher } from "../controllers/researcherDashboardController.js";
import {setupResearcher } from "../controllers/setupResearcherController.js"
const router = express.Router();

router.post("/setup", setupResearcher);
router.get("/:id/dashboard", getResearcherDashboard);
router.put("/:id", updateResearcher);
export default router;
