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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const STEPS = [
  ["Create a request", "Your team creates a verification request for a customer, merchant or partner and gets a secure, single-purpose link."],
  ["Recipient opens the link", "They see who is asking and why. No account is needed. The link expires and can be revoked at any time."],
  ["Location is resolved", "The recipient enters their location reference. LocateNG resolves it and presents a clear, structured result."],
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
        <div className="mt-6 rounded-md border bg-muted p-4 text-sm text-muted-foreground">New workspaces include clearly labelled synthetic records, so your team can evaluate the workflow without using customer data.</div>
        <Button asChild className="mt-8"><Link to="/auth" search={{ mode: "signup" }}>Explore a demo workspace</Link></Button>
      </main>
      <SiteFooter />
    </div>
  );
}
