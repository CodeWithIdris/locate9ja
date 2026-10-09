import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [
    { title: "Pricing — LocateNG" },
    { name: "description", content: "Plans for reliable Nigerian location resolution, recipient confirmation and developer infrastructure." },
    { property: "og:title", content: "Pricing — LocateNG" },
    { property: "og:description", content: "Flexible LocateNG plans for teams and platforms." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: PricingPage,
});

const PLANS = [
  ["Starter", "For teams establishing reliable location workflows.", ["Location workspace", "Recipient confirmation links", "Audit history"]],
  ["Operations", "For growing teams managing higher operational volume.", ["Everything in Starter", "Business location profiles", "Team roles and analytics"]],
  ["Platform", "For products embedding location infrastructure.", ["Everything in Operations", "API projects and keys", "Signed webhooks and request logs"]],
] as const;

function PricingPage() {
  return <div className="min-h-screen"><SiteHeader /><main className="mx-auto max-w-6xl px-6 py-16"><div className="max-w-2xl"><div className="eyebrow">Pricing</div><h1 className="mt-3 text-3xl font-semibold">Plans that scale with your location operations</h1><p className="mt-4 text-muted-foreground">Usage and commercial terms are tailored to your workflow, volume and integration needs.</p></div><div className="mt-10 grid gap-px overflow-hidden rounded-md border bg-border lg:grid-cols-3">{PLANS.map(([name, description, items]) => <section key={name} className="flex flex-col bg-card p-6"><h2 className="text-lg font-semibold">{name}</h2><p className="mt-2 min-h-12 text-sm text-muted-foreground">{description}</p><div className="mt-6 text-2xl font-semibold">Contact Sales</div><ul className="my-8 flex-1 space-y-3 text-sm">{items.map((item) => <li key={item} className="flex gap-2"><Check className="h-4 w-4 text-success" />{item}</li>)}</ul><Button asChild variant={name === "Operations" ? "default" : "outline"}><Link to="/auth" search={{ mode: "signup" }}>Contact sales</Link></Button></section>)}</div></main><SiteFooter /></div>;
}