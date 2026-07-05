import type {
  Application,
  ApplicationDetail,
  ApiKey,
  GeneratedApp,
  MarketplaceApplication,
  SubscriptionTier,
} from "./types";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  listApplications: () => request<Application[]>("/applications"),
  getApplication: (id: string) => request<Application>(`/applications/${id}`),
  createApplication: (data: { name: string; abstract: string }) =>
    request<Application>("/applications", { method: "POST", body: JSON.stringify(data) }),
  updateApplication: (id: string, data: Partial<Application>) =>
    request<Application>(`/applications/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteApplication: (id: string) => request<void>(`/applications/${id}`, { method: "DELETE" }),

  searchMarketplace: (search: string) =>
    request<MarketplaceApplication[]>(`/marketplace?search=${encodeURIComponent(search)}`),
  getMarketplaceApp: (id: string) => request<ApplicationDetail>(`/marketplace/${id}`),

  build: (applicationId: string, prompt: string) =>
    request<GeneratedApp>("/build", { method: "POST", body: JSON.stringify({ applicationId, prompt }) }),
  getGeneratedHtml: async (id: string): Promise<string> => {
    const res = await fetch(`/api/generated/${id}`);
    if (!res.ok) throw new Error("Failed to load generated app");
    return res.text();
  },

  listApiKeys: () => request<ApiKey[]>("/api-keys"),
  createApiKey: (data: { name: string; appIds: string[]; expiresAt: string | null }) =>
    request<ApiKey>("/api-keys", { method: "POST", body: JSON.stringify(data) }),
  regenerateApiKey: (id: string) => request<ApiKey>(`/api-keys/${id}/regenerate`, { method: "POST" }),
  deleteApiKey: (id: string) => request<void>(`/api-keys/${id}`, { method: "DELETE" }),

  listTiers: () => request<SubscriptionTier[]>("/subscriptions/tiers"),
  getCurrentTier: () => request<SubscriptionTier>("/subscriptions/current"),
  setCurrentTier: (tierId: string) =>
    request<SubscriptionTier>("/subscriptions/current", { method: "PUT", body: JSON.stringify({ tierId }) }),
};
