import express from "express";
import { getSpecializations, getResearchers } from "../controllers/researcherController.js"; 
import pool from "./src/db/index.js"
const router = express.Router();

router.get("/specializations/list", getSpecializations);

router.get("/list", getResearchers);

export default router;
