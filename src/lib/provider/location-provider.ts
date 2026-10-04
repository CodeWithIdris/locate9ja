/**
 * Provider-neutral location model. The rest of the app depends only on this
 * shape, never on a specific provider's response format.
 */
export type ProviderLocationResult = {
  provider: string;
  providerReference?: string;
  postcode: string;
  formattedAddress?: string;
  hierarchy?: { state?: string; lga?: string; district?: string; area?: string };
  coordinates?: { latitude: number; longitude: number };
};

export type ResolveOutcome =
  | { ok: true; result: ProviderLocationResult }
  | { ok: false; code: "not_found" | "invalid_input" | "provider_unavailable"; message: string };

export interface LocationProvider {
  name: string;
  resolvePostcode(input: { postcode: string }): Promise<ResolveOutcome>;
}

/**
 * Demo provider. Uses clearly-labelled DEMO references only — it does not
 * mimic NIPOST postcode formats or data. Replace with the authorized NIPOST
 * adapter once API access and documentation are available.
 */
const FIXTURES: Record<string, ProviderLocationResult> = {
  "DEMO-LA-0001": {
    provider: "mock", providerReference: "mock_ref_1001", postcode: "DEMO-LA-0001",
    formattedAddress: "Plot 14, Admiralty Way, Lekki Phase 1",
    hierarchy: { state: "Lagos", lga: "Eti-Osa", district: "Lekki", area: "Lekki Phase 1" },
    coordinates: { latitude: 6.4474, longitude: 3.4723 },
  },
  "DEMO-FC-0002": {
    provider: "mock", providerReference: "mock_ref_1002", postcode: "DEMO-FC-0002",
    formattedAddress: "12 Aminu Kano Crescent, Wuse II",
    hierarchy: { state: "Federal Capital Territory", lga: "Abuja Municipal", district: "Wuse", area: "Wuse II" },
    coordinates: { latitude: 9.0765, longitude: 7.4704 },
  },
  "DEMO-LA-0003": {
    provider: "mock", providerReference: "mock_ref_1003", postcode: "DEMO-LA-0003",
    formattedAddress: "5 Isaac John Street, Ikeja GRA",
    hierarchy: { state: "Lagos", lga: "Ikeja", district: "Ikeja", area: "Ikeja GRA" },
    coordinates: { latitude: 6.5795, longitude: 3.355 },
  },
  "DEMO-RI-0004": {
    provider: "mock", providerReference: "mock_ref_1004", postcode: "DEMO-RI-0004",
    formattedAddress: "22 Aba Road, by Garrison Junction",
    hierarchy: { state: "Rivers", lga: "Port Harcourt", district: "D-Line", area: "Garrison" },
    coordinates: { latitude: 4.8156, longitude: 7.0498 },
  },
  "DEMO-KN-0005": {
    provider: "mock", providerReference: "mock_ref_1005", postcode: "DEMO-KN-0005",
    formattedAddress: "8 Bompai Road, Nassarawa GRA",
    hierarchy: { state: "Kano", lga: "Nassarawa", district: "Bompai", area: "Nassarawa GRA" },
    coordinates: { latitude: 12.0022, longitude: 8.5357 },
  },
};

export const DEMO_REFERENCES = Object.keys(FIXTURES);

export const mockProvider: LocationProvider = {
  name: "mock",
  async resolvePostcode({ postcode }) {
    const key = postcode.trim().toUpperCase();
    if (key.length < 3 || key.length > 40) {
      return { ok: false, code: "invalid_input", message: "Enter a valid location reference." };
    }
    if (key === "DEMO-OUTAGE") {
      return { ok: false, code: "provider_unavailable", message: "The location provider is temporarily unavailable. Try again shortly." };
    }
    const hit = FIXTURES[key];
    if (!hit) return { ok: false, code: "not_found", message: "No location matched this reference." };
    return { ok: true, result: hit };
  },
};

export function getLocationProvider(): LocationProvider {
  // Swap to the NIPOST adapter here once authorized credentials exist.
  return mockProvider;
}
