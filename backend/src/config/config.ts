// import "dotenv/config";  // env already loaded in package.json

type NodeEnv = "development" | "production" | "test";
type LogLevel = "error" | "warn" | "info" | "debug";

// small helper for validation with fallback
const valid = <T extends string>(
  val: string | undefined,
  allowed: readonly T[],
  fallback: T
): T => (val && allowed.includes(val as T) ? (val as T) : fallback);

// environment variables with validation and defaults
const nodeEnv: NodeEnv = valid(
  process.env.NODE_ENV,
  ["development", "production", "test"] as const,
  "development"
);

const logLevel: LogLevel = valid(
  process.env.LOG_LEVEL,
  ["error", "warn", "info", "debug"] as const,
  "info"
);

// secure mode is true only in production
const secure = nodeEnv === "production";

const jwtSecret = process.env.JWT_SECRET || "jwt-secret";

// if production and weak jwtSecret
secure && jwtSecret === "jwt-secret" &&
  (() => {
    throw new Error("A secure JWT_SECRET must be set in production");
  })();

export const config = {
  server: {
    env: nodeEnv,
    port: parseInt(process.env.PORT || "3000", 10),
    allowedOrigins: process.env.ALLOWED_ORIGINS || "*",
    jwtSecret,
    secure,
    logLevel,
  },
};
