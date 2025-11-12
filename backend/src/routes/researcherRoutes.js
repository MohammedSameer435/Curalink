import express from "express";
import { getSpecializations, getResearchers } from "../controllers/researcherController.js"; 
const router = express.Router();

router.get("/specializations/list", getSpecializations);

router.get("/list", getResearchers);

export default router;
