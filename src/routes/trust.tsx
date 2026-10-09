import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "Trust & security — LocateNG" },
      { name: "description", content: "How LocateNG protects location workflows with secure links, access controls, audit trails and organization isolation." },
      { property: "og:title", content: "Trust & security — LocateNG" },
      { property: "og:description", content: "Security controls for reliable location operations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="eyebrow">Trust & security</div>
        <h1 className="mt-3 text-3xl font-semibold">Controls around every location workflow</h1>
        <p className="mt-4 text-muted-foreground">LocateNG limits access, records important actions and keeps each organization’s operational data isolated.</p>
        <div className="mt-8 space-y-8 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold">Secure, revocable links</h2>
            <p className="mt-2 text-muted-foreground">Each recipient link uses a strong random secret. Only its cryptographic hash is stored. Links expire automatically and can be revoked before completion.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Organization isolation and access control</h2>
            <p className="mt-2 text-muted-foreground">Records are scoped to an organization at the database layer. Role-based permissions control who can manage members, locations, developer projects and integrations.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Auditability</h2>
            <p className="mt-2 text-muted-foreground">Request creation, link opens, resolution outcomes, recipient decisions and administrative changes are recorded with actor, resource and timestamp context.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Data minimization</h2>
            <p className="mt-2 text-muted-foreground">Public pages expose only the context a recipient needs to respond. API logs avoid request payloads and full secrets are never displayed after creation.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">API and webhook security</h2>
            <p className="mt-2 text-muted-foreground">API credentials and webhook secrets are generated server-side, stored as hashes and revealed only once. Webhook deliveries are signed and retry history remains visible to authorized team members.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Clear scope</h2>
            <p className="mt-2 text-muted-foreground">A confirmation records that the intended recipient accepted a resolved location for a stated purpose. It does not establish identity, residence, ownership or legal status.</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
