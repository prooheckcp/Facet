import { Router } from "express";
import { readDb, writeDb } from "../db.js";
import type { SubscriptionTier } from "../types.js";

export const subscriptionsRouter = Router();

const TIERS: SubscriptionTier[] = [
  {
    id: "personal",
    name: "Personal",
    priceLabel: "$0/mo",
    monthlyCallLimit: 1000,
    features: ["1,000 API calls / month", "1 application", "Community support"],
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "$29/mo",
    monthlyCallLimit: 50000,
    features: ["50,000 API calls / month", "Unlimited applications", "Email support"],
  },
  {
    id: "max",
    name: "Max",
    priceLabel: "$99/mo",
    monthlyCallLimit: 250000,
    features: ["250,000 API calls / month", "Unlimited applications", "Priority support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceLabel: "Custom",
    monthlyCallLimit: null,
    features: ["Custom call limits", "Dedicated support", "SLA & onboarding"],
  },
];

subscriptionsRouter.get("/tiers", (_req, res) => {
  res.json(TIERS);
});

subscriptionsRouter.get("/current", (_req, res) => {
  const db = readDb();
  const tier = TIERS.find((t) => t.id === db.currentSubscriptionTier) ?? TIERS[0];
  res.json(tier);
});

subscriptionsRouter.put("/current", (req, res) => {
  const { tierId } = req.body as { tierId?: string };
  const tier = TIERS.find((t) => t.id === tierId);
  if (!tier) return res.status(400).json({ error: "Unknown tier id" });

  const db = readDb();
  db.currentSubscriptionTier = tier.id;
  writeDb(db);
  res.json(tier);
});
