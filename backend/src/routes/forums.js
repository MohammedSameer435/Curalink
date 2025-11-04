// src/routes/forumRoutes.js
import express from "express";
import {
  getForums,
  createForumPost,
  addForumReply,
} from "../controllers/forumController.js";

const router = express.Router();

// ✅ GET all forums (with replies)
router.get("/", getForums);

// ✅ POST new forum post (patient)
router.post("/", createForumPost);

// ✅ POST reply to a specific post (researcher)
router.post("/:postId/replies", addForumReply);

export default router;
