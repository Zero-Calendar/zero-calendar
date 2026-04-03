import "server-only";

import {
  createOpenRouter,
  type OpenRouterProviderOptions,
} from "@openrouter/ai-sdk-provider";

const apiKey = process.env.OPENROUTER_API_KEY;
const defaultModel = process.env.OPENROUTER_MODEL || "x-ai/grok-4.1-fast";

if (!apiKey) {
  throw new Error("OPENROUTER_API_KEY is not configured");
}

const openrouter = createOpenRouter({
  apiKey,
  compatibility: "strict",
});

export function getOpenRouterModel() {
  return openrouter.chat(defaultModel);
}

function supportsReasoningEffort(model: string) {
  // Grok models via OpenRouter reject the reasoning.effort payload.
  return !model.startsWith("x-ai/");
}

export function getOpenRouterProviderOptions(user?: string): {
  openrouter: OpenRouterProviderOptions;
} {
  return {
    openrouter: {
      ...(supportsReasoningEffort(defaultModel)
        ? {
            reasoning: {
              enabled: true,
              effort: "high",
            },
          }
        : {}),
      ...(user ? { user } : {}),
    },
  };
}
