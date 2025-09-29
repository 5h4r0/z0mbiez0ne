export const config = {
  server: {
    env: process.env.NODE_ENV || "development",
  },
  cors: {
    devOrigin: "http://localhost:5173",
    prodOrigins: ["https://ton-site-prod.com"],
  },
};
