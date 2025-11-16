import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import researcherRouter from "./src/routes/researcherRoutes.js";
import aiRouter from "./src/routes/ai.js"; 
import recommendationsRouter from "./src/routes/recommendationsRoutes.js";
import forumRouter from "./src/routes/forums.js"
import  researcherDashboardRouter from "./src/routes/researcherDashboardRoutes.js"
import forumsRouter from "./src/routes/researcherforums.js";
import {pool} from "./src/db/index.js"

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const allowedOrigins = [
  "https://curalink-1.onrender.com", 
  "http://localhost:5173",            
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.includes(origin)) {
        const msg = `CORS policy does not allow access from origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
import searchRouter from "./src/routes/researcherSearchRoutes.js";

app.use("/api/search", searchRouter);

app.use("/api/researchers", researcherRouter);
app.use("/api/ai", aiRouter);

app.use("/api/forums", forumRouter);
app.use("/api/recommendations", recommendationsRouter);

app.use("/api/researcherforums", forumsRouter);

app.use("/api/researchers", researcherDashboardRouter);
app.get("/", (req, res) => {
  res.send("✅ Backend is live and running successfully!");
});
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));


app.post("/api/collaborations/request", async (req, res) => {
  const { requesterId, targetId, message } = req.body;

  const result = await pool.query(
    `INSERT INTO collaboration_requests (requester_id, target_id, message)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [requesterId, targetId, message]
  );

  res.json(result.rows[0]);
});

app.put("/api/collaborations/:id/respond", async (req, res) => {
  const { status } = req.body; // 'accepted' or 'rejected'
  const { id } = req.params;

  const result = await pool.query(
    `UPDATE collaboration_requests SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );

  res.json(result.rows[0]);
});

app.post("/api/messages", async (req, res) => {
  const { collaborationId, senderId, text } = req.body;

  const check = await pool.query(
    `SELECT * FROM collaboration_requests WHERE id = $1 AND status = 'accepted'`,
    [collaborationId]
  );

  if (check.rows.length === 0) {
    return res.status(403).json({ error: "Chat not allowed. Collaboration not accepted." });
  }

  const result = await pool.query(
    `INSERT INTO messages (collaboration_id, sender_id, text)
     VALUES ($1, $2, $3) RETURNING *`,
    [collaborationId, senderId, text]
  );

  res.json(result.rows[0]);
});
app.get("/api/messages/:collaborationId", async (req, res) => {
  const { collaborationId } = req.params;

  const result = await pool.query(
    `SELECT m.*, r.name AS sender_name
     FROM messages m
     JOIN researchers r ON r.id = m.sender_id
     WHERE collaboration_id = $1
     ORDER BY m.created_at ASC`,
    [collaborationId]
  );

  res.json(result.rows);
});

