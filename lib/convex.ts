import "server-only";

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

function getConvexUrl() {
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!url) {
    throw new Error("Convex URL is not configured");
  }

  return url;
}

export function getConvexClient() {
  return new ConvexHttpClient(getConvexUrl());
}

export function getServerAccessKey() {
  const key = process.env.BETTER_AUTH_SECRET;

  if (!key) {
    throw new Error("BETTER_AUTH_SECRET is not configured");
  }

  return key;
}

export { api };
