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
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://curalink-1.onrender.com",  // ✅ your frontend Render URL
  "http://localhost:5173",                   // ✅ keep for local testing
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `CORS policy does not allow access from origin ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);


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
