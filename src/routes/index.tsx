import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader, SiteFooter } from "@/components/site";
import { StatusBadge } from "@/components/status";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LocateNG — Location verification infrastructure for Nigeria" },
      { name: "description", content: "Resolve, confirm and reuse Nigerian physical locations with auditable verification workflows and shareable verification links." },
      { property: "og:title", content: "LocateNG — Location verification infrastructure for Nigeria" },
      { property: "og:description", content: "Turn Nigerian physical locations into trusted, structured, reusable business data." },
    ],
  }),
  component: Home,
});

const CAPS = [
  ["Resolve", "Turn a location reference into a structured record with state, LGA, district and area, sourced from an authorized provider."],
  ["Confirm", "Send the intended person a secure link. They confirm the resolved place is theirs — or reject it."],
  ["Reuse", "Keep one location record per place and reuse it across deliveries, onboarding and support."],
  ["Audit", "Every request, open, submission and decision is recorded with a timestamp and actor."],
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="border-b">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <div className="eyebrow">Location verification infrastructure · Nigeria</div>
              <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight text-foreground md:text-[2.75rem]">
                Turn Nigerian physical locations into trusted, structured, reusable business data.
              </h1>
              <p className="mt-5 max-w-lg text-muted-foreground">
                Free-text addresses and landmarks are hard to act on. LocateNG gives your team a workflow to resolve a location, have the right person confirm it, and keep an auditable record you can reuse.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg"><Link to="/auth" search={{ mode: "signup" }}>Create an organization <ArrowRight /></Link></Button>
                <Button asChild size="lg" variant="outline"><Link to="/how-it-works">See how it works</Link></Button>
              </div>
            </div>
            <RecordPreview />
          </div>
        </section>

        <section className="border-b">
          <div className="mx-auto grid max-w-6xl md:grid-cols-4">
            {CAPS.map(([t, d], i) => (
              <div key={t} className="border-b p-6 md:border-b-0 md:border-r last:border-r-0">
                <div className="font-mono text-xs text-muted-foreground">0{i + 1}</div>
                <h2 className="mt-3 font-semibold">{t}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2">
            <div>
              <div className="eyebrow">Product boundary</div>
              <h2 className="mt-3 text-2xl font-semibold">What a verified location means — and doesn't.</h2>
              <p className="mt-3 text-muted-foreground">
                Authoritative postcode infrastructure belongs to NIPOST. LocateNG is the workflow layer around it. A confirmed location shows that a person confirmed a place for a purpose — nothing more.
              </p>
              <Link to="/trust" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">Read our trust boundaries <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <dl className="grid gap-px overflow-hidden rounded-md border bg-border text-sm">
              {[
                ["Is", "A record that a location was resolved and confirmed by the intended person"],
                ["Is not", "Proof of residence, property ownership, identity or business registration"],
                ["Is not", "NIPOST, or a copy of NIPOST postcode data"],
              ].map(([k, v], i) => (
                <div key={i} className="grid grid-cols-[80px_1fr] bg-card">
                  <dt className="border-r p-3 font-mono text-xs uppercase text-muted-foreground">{k}</dt>
                  <dd className="p-3">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function RecordPreview() {
  return (
    <div className="rounded-md border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <span className="font-mono text-xs text-muted-foreground">verification_request · vr_8f2c1a</span>
        <StatusBadge status="completed" />
      </div>
      <dl className="divide-y text-sm">
        {[
          ["Recipient", "Chinedu O."],
          ["Purpose", "Delivery address confirmation"],
          ["Area", "Lekki Phase 1, Eti-Osa, Lagos"],
          ["Location", <StatusBadge key="c" status="confirmed" />],
        ].map(([k, v], i) => (
          <div key={i} className="grid grid-cols-[120px_1fr] px-4 py-2.5">
            <dt className="text-muted-foreground">{k}</dt><dd>{v}</dd>
          </div>
        ))}
      </dl>
      <ol className="border-t px-4 py-3 font-mono text-xs text-muted-foreground">
        {["created", "opened", "location_resolved", "confirmed", "completed"].map((e, i) => (
          <li key={e} className="flex items-center gap-3 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="w-36">{e}</span>
            <span>09:{12 + i * 3} WAT</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
