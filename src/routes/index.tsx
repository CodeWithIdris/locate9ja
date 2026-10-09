import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, MapPin, Send, Database, Activity, ShoppingBag, Truck, Landmark, ClipboardCheck, Building2, Code2 } from "lucide-react";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const CAPS = [
  ["Resolve", "Turn a location reference into a structured record with state, LGA, district and area."],
  ["Confirm", "Send the intended person a secure link. They confirm the resolved place is theirs — or reject it."],
  ["Reuse", "Keep one location record per place and reuse it across deliveries, onboarding and support."],
  ["Audit", "Every request, open, submission and decision is recorded with a timestamp and actor."],
];

const USE_CASES = [
  [ShoppingBag, "E-commerce", "Reduce address ambiguity before fulfilment and keep reusable customer location records."],
  [Truck, "Logistics", "Give dispatch and operations teams consistent location data and a clear confirmation history."],
  [Landmark, "Financial services", "Collect dependable location data during customer and merchant onboarding workflows."],
  [ClipboardCheck, "Field operations", "Prepare field teams with structured locations and a record of recipient confirmation."],
  [Building2, "Business operations", "Maintain confirmed offices, warehouses, branches and service locations in one workspace."],
  [Code2, "Platforms & developers", "Resolve locations and manage verification workflows through a consistent API."],
] as const;

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="border-b">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-20">
            <div>
              <div className="eyebrow">Location verification infrastructure · Nigeria</div>
              <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight text-foreground md:text-[2.75rem]">Know exactly where your customers are.</h1>
              <p className="mt-5 max-w-lg text-muted-foreground">
                Turn Nigerian addresses into reliable business data. Resolve a physical location, confirm it with the intended recipient, and reuse a structured record across your operations.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg"><Link to="/auth" search={{ mode: "signup" }}>Get started <ArrowRight /></Link></Button>
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

        <section className="border-b bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="max-w-2xl">
              <div className="eyebrow">The operational gap</div>
              <h2 className="mt-3 text-3xl font-semibold">Addresses are easy to collect. Reliable locations are harder.</h2>
              <p className="mt-4 text-muted-foreground">Free-text addresses, landmarks and delivery notes are inconsistent. LocateNG gives teams a controlled process to resolve, confirm and maintain the location record behind each address.</p>
            </div>
            <div className="mt-10 grid gap-px overflow-hidden rounded-md border bg-border md:grid-cols-3">
              {[
                [MapPin, "Resolve consistently", "Convert references and address inputs into the same structured location shape."],
                [CheckCircle2, "Confirm with context", "Ask the intended recipient to confirm the resolved place for a stated purpose."],
                [Database, "Reuse across systems", "Keep one auditable record for fulfilment, onboarding, support and operations."],
              ].map(([Icon, title, copy]) => <div key={String(title)} className="bg-card p-6"><Icon className="h-5 w-5 text-primary" /><h3 className="mt-4 font-semibold">{String(title)}</h3><p className="mt-2 text-sm text-muted-foreground">{String(copy)}</p></div>)}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="eyebrow">Built for operations</div>
            <h2 className="mt-3 text-2xl font-semibold">One location layer across your business</h2>
            <div className="mt-8 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
              {USE_CASES.map(([Icon, title, copy]) => <div key={title}><Icon className="h-5 w-5 text-primary" /><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-2 text-sm text-muted-foreground">{copy}</p></div>)}
            </div>
          </div>
        </section>

        <section className="border-t bg-ink text-ink-foreground">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-12 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold">Make location data operational.</h2>
              <p className="mt-2 text-sm text-sidebar-foreground">Start with a demo workspace and explore the complete workflow.</p>
            </div>
            <Button asChild variant="secondary"><Link to="/auth" search={{ mode: "signup" }}>Create workspace <ArrowRight /></Link></Button>
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
        <span className="font-mono text-xs text-muted-foreground">location operation · DEMO-8F2C1A</span>
        <StatusBadge status="completed" />
      </div>
      <dl className="divide-y text-sm">
        {[
          ["Recipient", "Adaeze N."],
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
        {["request_created", "link_opened", "location_resolved", "recipient_confirmed", "completed"].map((e, i) => (
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
