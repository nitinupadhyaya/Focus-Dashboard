import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { analyzeActivity } from "./analyzeWithGroq.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

let recentActivities = [];

// Handle activity POSTs from the Chrome extension
app.post("/api/activity", async (req, res) => {
  const { url, title } = req.body;
  console.log(`🧭 Activity received: ${title} | ${url}`);

  const analysis = await analyzeActivity(title, url);
  console.log("🧩 Analysis result:", analysis);

  recentActivities.push({ url, title, analysis, time: new Date().toLocaleTimeString() });
  if (recentActivities.length > 10) recentActivities.shift();

  res.json({ ok: true, analysis });
});

// Endpoint for dashboard (summary)
app.get("/api/summary", (req, res) => {
  res.json(recentActivities);
});

app.listen(PORT, () => {
  console.log(`✅ Focus server running on http://localhost:${PORT}`);
});


