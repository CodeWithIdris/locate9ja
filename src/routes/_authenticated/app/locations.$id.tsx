import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate } from "@/lib/org";
import { PageHeader } from "@/components/app-shell";
import { StatusBadge, ProviderTag } from "@/components/status";

export const Route = createFileRoute("/_authenticated/app/locations/$id")({
  head: () => ({ meta: [{ title: "Location — LocateNG" }, { name: "description", content: "Location record detail." }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const q = useQuery({
    queryKey: ["location", id],
    queryFn: async () => {
      const [l, v] = await Promise.all([
        supabase.from("locations").select("*").eq("id", id).maybeSingle(),
        supabase.from("verification_requests").select("id, recipient_name, status, created_at").eq("location_id", id),
      ]);
      return { loc: l.data, vrs: v.data ?? [] };
    },
  });
  const l = q.data?.loc;
  if (q.isLoading) return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;
  if (!l) return <p className="p-6">Location not found.</p>;
  return (
    <>
      <PageHeader title={l.label} description={l.formatted_address ?? "Not yet resolved"}
        actions={<Link to="/app/locations" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Locations</Link>} />
      <div className="grid gap-6 p-6 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-md border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3"><h2 className="text-sm font-semibold">Structured record</h2><ProviderTag provider={l.provider} /></div>
          <dl className="divide-y text-sm">
            {([
              ["Reference", <span key="p" className="font-mono">{l.postcode ?? "—"}</span>],
              ["Address", l.formatted_address],
              ["Area", l.area], ["District", l.district], ["LGA", l.lga], ["State", l.state],
              ["Coordinates", l.latitude ? <span key="c" className="font-mono">{l.latitude}, {l.longitude}</span> : null],
              ["Resolution", <StatusBadge key="r" status={l.resolution_status} />],
              ["Confirmation", <StatusBadge key="cf" status={l.confirmation_status} />],
              ["Provider reference", l.provider_reference ? <span key="pr" className="font-mono text-xs">{l.provider_reference}</span> : null],
              ["Source updated", fmtDate(l.source_updated_at, true)],
              ["Address as received", l.input_text],
            ] as const).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[160px_1fr] px-4 py-2.5"><dt className="text-muted-foreground">{k}</dt><dd>{v ?? "—"}</dd></div>
            ))}
          </dl>
        </section>
        <section className="h-fit rounded-md border bg-card">
          <h2 className="border-b px-4 py-3 text-sm font-semibold">Linked verifications</h2>
          <ul className="divide-y text-sm">
            {q.data!.vrs.map((v) => (
              <li key={v.id} className="flex items-center justify-between px-4 py-2.5">
                <Link to="/app/verifications/$id" params={{ id: v.id }} className="hover:underline">{v.recipient_name}</Link>
                <StatusBadge status={v.status} />
              </li>
            ))}
            {q.data!.vrs.length === 0 && <li className="px-4 py-6 text-center text-muted-foreground">None</li>}
          </ul>
        </section>
      </div>
    </>
  );
}
