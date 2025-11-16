import express from "express";
import { searchResearchers } from "../controllers/SearchController.js";

const router = express.Router();

router.get("/researchers", searchResearchers);

export default router;
