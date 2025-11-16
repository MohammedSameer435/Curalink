import express from "express";
import { getSpecializations, getResearchers,getResearcherPublicProfile } from "../controllers/researcherController.js"; 
const router = express.Router();

router.get("/specializations/list", getSpecializations);

router.get("/list", getResearchers);
router.get("/:id/profile", getResearcherPublicProfile);

export default router;
