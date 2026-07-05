import "dotenv/config";
import cors from "cors";
import express from "express";
import { applicationsRouter } from "./routes/applications.js";
import { apiKeysRouter } from "./routes/apiKeys.js";
import { subscriptionsRouter } from "./routes/subscriptions.js";
import { marketplaceRouter } from "./routes/marketplace.js";
import { buildRouter } from "./routes/build.js";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/applications", applicationsRouter);
app.use("/api/api-keys", apiKeysRouter);
app.use("/api/subscriptions", subscriptionsRouter);
app.use("/api/marketplace", marketplaceRouter);
app.use("/api", buildRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(port, () => {
  console.log(`Facet server listening on http://localhost:${port}`);
});
