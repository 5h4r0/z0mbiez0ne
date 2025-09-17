import express from "express";
import { router as apiRouter } from "./routers/index.router.js";

export const app = express();

app.use((req, res, next) => {
  res.setHeader("X-Powered-By", "ZombieLand");
  next();
});

// mount API on /api
app.use("/api", apiRouter);

// health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

// homepage
app.get("/", (req, res) => {
  res.send("Welcome | homepage 👋");
});



