import { app } from "./app.js";
import { config } from "./config/config.js";

// import { logger } from "./src/lib/log.js";

console.log("➡️ Index.ts loaded")
console.log("➡️ Port =", config.server.port)

// Démarre un serveur
const port = config.server.port;
app.listen(port, () => {
  console.log(`🚀 server on : http://localhost:${port}`);
});
