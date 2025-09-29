import cors from "cors";
import { config } from "./config.js";

const allowedOrigins =
  config.server.env === "production"
    ? config.cors.prodOrigins
    : [config.cors.devOrigin];

export const corsConfig = cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
