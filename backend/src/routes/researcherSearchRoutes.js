import express from "express";
import { searchResearchers } from "../controllers/SearchController.js";

const router = express.Router();

router.get("/researcher-profile/:id", searchResearchers);

export default router;
