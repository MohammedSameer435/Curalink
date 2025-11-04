import express from "express";
import { getSpecializations } from "../controllers/researcherController.js"; // 

const router = express.Router();

router.get("/specializations/list", getSpecializations);
export default router;
