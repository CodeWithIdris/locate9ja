import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteHeader, SiteFooter } from "@/components/site";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — LocateNG" },
      { name: "description", content: "How LocateNG resolves a location, sends a secure confirmation link, and records an auditable result." },
      { property: "og:title", content: "How it works — LocateNG" },
      { property: "og:description", content: "Resolve, confirm, record: the LocateNG verification workflow." },
    ],
  }),
  component: Page,
});

const STEPS = [
  ["Create a request", "Your team creates a verification request for a customer, merchant or partner and gets a secure, single-purpose link."],
  ["Recipient opens the link", "They see who is asking and why. No account is needed. The link expires and can be revoked at any time."],
  ["Location is resolved", "The recipient enters their location reference. LocateNG resolves it through the configured provider and shows the structured result."],
  ["Recipient confirms or rejects", "They confirm the resolved place is the one they meant — or reject it. Provider failures are recorded separately from rejections."],
  ["You get a reusable record", "The confirmed location is saved to your organization with its full event history, ready to reuse."],
];

function Page() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="eyebrow">Workflow</div>
        <h1 className="mt-3 text-3xl font-semibold">How a verification works</h1>
        <ol className="mt-10 space-y-0 border-l">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="relative pb-8 pl-8">
              <span className="absolute -left-3 top-0 grid h-6 w-6 place-items-center rounded-full border bg-card font-mono text-xs">{i + 1}</span>
              <h2 className="font-semibold">{t}</h2>
              <p className="mt-1 text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 rounded-md border bg-warning-soft p-4 text-sm">
          <strong className="font-medium">Current status:</strong> the authorized NIPOST connection is not yet live. The workspace uses a clearly-labelled demo provider with sample references such as <code className="font-mono">DEMO-LA-0001</code>.
        </div>
        <Button asChild className="mt-8"><Link to="/auth" search={{ mode: "signup" }}>Try it with demo data</Link></Button>
      </main>
      <SiteFooter />
    </div>
  );
}
