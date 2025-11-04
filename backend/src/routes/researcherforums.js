import express from "express";
import { getForumsBySpecialization, addForumReply } from "../controllers/ForumsController.js";

const router = express.Router();

router.get("/:specialization", getForumsBySpecialization);
router.post("/:postId/replies", addForumReply);

export default router;
