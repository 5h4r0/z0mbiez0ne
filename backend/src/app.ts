import express from "express";
import { router as apiRouter } from "./routers/index.router.js";

// create an express app
export const app = express();

// middleware, json parsing
app.use(express.json());

// header
app.use((req, res, next) => {
  res.setHeader("X-Powered-By", "ZombieLand");
  next();
});

// mount API router on /api
app.use("/api", apiRouter);














// homepage
app.get("/", (req, res) => {
  res.send("Welcome | homepage 👋");
});

// health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

