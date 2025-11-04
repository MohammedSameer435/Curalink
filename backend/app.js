import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import researcherRouter from "./src/routes/researcherRoutes.js";
import aiRouter from "./src/routes/ai.js"; 
import recommendationsRouter from "./src/routes/recommendationsRoutes.js";
import forumRouter from "./src/routes/forums.js"
import  researcherDashboardRouter from "./src/routes/researcherDashboardRoutes.js"
import forumsRouter from "./src/routes/researcherforums.js";

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173", 
  credentials: true,
}));

app.use("/api/researchers", researcherRouter);
app.use("/api/ai", aiRouter);

app.use("/api/forums", forumRouter);
app.use("/api/recommendations", recommendationsRouter);

app.use("/api/researcherforums", forumsRouter);

app.use("/api/researchers", researcherDashboardRouter);
app.get("/", (req, res) => {
  res.send("✅ Backend is live and running successfully!");
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
