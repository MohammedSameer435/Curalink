import express from "express";
import { aiController } from "../controllers/aiController.js"; // <-- corrected relative path

const router = express.Router();
router.post("/analyze", aiController);

export default router;
