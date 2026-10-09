import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site";

export const Route = createFileRoute("/docs")({
  head: () => ({ meta: [
    { title: "API documentation — LocateNG" },
    { name: "description", content: "Conceptual v1 API reference for Nigerian location resolution and recipient verification workflows." },
    { property: "og:title", content: "LocateNG API documentation" },
    { property: "og:description", content: "Authentication, endpoints, idempotency, errors, limits and signed webhooks." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: DocsPage,
});

const sections = [
  ["Authentication", "Send your project key in the Authorization header as a Bearer token. Keys are scoped to one project and shown only once."],
  ["POST /v1/locations/resolve", "Resolve a supported location reference into a structured location response."],
  ["GET /v1/locations/:id", "Retrieve one location owned by the authenticated project’s organization."],
  ["POST /v1/verifications", "Create a recipient confirmation request. Supply an Idempotency-Key for safe retries."],
  ["GET /v1/verifications/:id", "Retrieve lifecycle status, expiration and the linked location result."],
  ["POST /v1/verifications/:id/revoke", "Revoke an active request before it reaches a terminal status."],
  ["GET /v1/usage", "Read project usage for the current billing period."],
] as const;

function DocsPage() {
  return <div className="min-h-screen"><SiteHeader /><main className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[240px_1fr]"><aside><div className="eyebrow">API v1</div><nav className="mt-4 grid gap-2 text-sm text-muted-foreground">{sections.map(([title]) => <a key={title} href={`#${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="hover:text-foreground">{title}</a>)}</nav></aside><div><h1 className="text-3xl font-semibold">LocateNG API</h1><p className="mt-4 max-w-2xl text-muted-foreground">Build location resolution and recipient confirmation into your product with organization-scoped credentials and predictable responses.</p><div className="mt-10 space-y-10">{sections.map(([title, copy]) => <section id={title.toLowerCase().replace(/[^a-z0-9]+/g, "-")} key={title} className="border-t pt-6"><h2 className="font-mono text-sm font-medium">{title}</h2><p className="mt-3 text-sm text-muted-foreground">{copy}</p></section>)}<section className="border-t pt-6"><h2 className="text-lg font-semibold">Errors, limits and webhooks</h2><p className="mt-3 text-sm text-muted-foreground">Responses use stable error codes with a request identifier. Rate-limit headers describe remaining capacity and reset time. Webhook deliveries include a timestamped HMAC signature, retry with backoff, and can be replayed from the application.</p></section></div></div></main><SiteFooter /></div>;
}