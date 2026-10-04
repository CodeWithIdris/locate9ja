import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "Trust & boundaries — LocateNG" },
      { name: "description", content: "What a LocateNG verification proves, what it does not, and how LocateNG relates to NIPOST." },
      { property: "og:title", content: "Trust & boundaries — LocateNG" },
      { property: "og:description", content: "Clear limits on what a confirmed location means." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="eyebrow">Trust & boundaries</div>
        <h1 className="mt-3 text-3xl font-semibold">What LocateNG is, and what it isn't</h1>
        <div className="mt-8 space-y-8 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold">Relationship with NIPOST</h2>
            <p className="mt-2 text-muted-foreground">NIPOST operates the National Digital Alphanumeric Postcode System. LocateNG is an independent workflow platform designed to use authorized NIPOST services as an external provider. LocateNG is not NIPOST, does not replace it, and does not keep a copy of NIPOST postcode data.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">What a confirmation means</h2>
            <p className="mt-2 text-muted-foreground">A confirmed location records that a location reference was resolved and that the person who received the request confirmed it as the intended place, for the stated purpose, at a recorded time.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">What it does not prove</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Proof of residence or occupancy</li>
              <li>Proof of property ownership or title</li>
              <li>Proof of identity</li>
              <li>Proof of business ownership or registration</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Data handling</h2>
            <p className="mt-2 text-muted-foreground">Organizations only see their own records. Verification links use random secrets that are stored as hashes, expire, and can be revoked. Public pages show only what the recipient needs to make a decision.</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
