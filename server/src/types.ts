export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface EndpointField {
  name: string;
  type: string;
}

export interface Endpoint {
  id: string;
  method: HttpMethod;
  path: string;
  description: string;
  requestFields: EndpointField[];
  responseFields: EndpointField[];
}

export interface Application {
  id: string;
  name: string;
  abstract: string;
  endpoints: Endpoint[];
  createdAt: string;
  /**
   * Cosmetic image for the marketplace listing only. This is NOT sent to the
   * AI build agent — it is purely a visual for the marketplace page.
   */
  imageUrl?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  appIds: string[];
  expiresAt: string | null;
  createdAt: string;
}

export interface GeneratedApp {
  id: string;
  applicationId: string;
  prompt: string;
  htmlFile: string;
  createdAt: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  priceLabel: string;
  monthlyCallLimit: number | null;
  features: string[];
}

export interface Db {
  applications: Application[];
  apiKeys: ApiKey[];
  currentSubscriptionTier: string;
  generatedApps: GeneratedApp[];
}
