import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate } from "@/lib/org";
import { revokeVerificationRequest } from "@/lib/verification.functions";
import { PageHeader } from "@/components/app-shell";
import { StatusBadge } from "@/components/status";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/verifications/$id")({
  head: () => ({ meta: [{ title: "Verification request — LocateNG" }, { name: "description", content: "Verification request detail." }] }),
  component: Page,
});

const ACTIVE = ["created", "sent", "opened", "awaiting_confirmation"];

function Page() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const revoke = useServerFn(revokeVerificationRequest);
  const q = useQuery({
    queryKey: ["verification", id],
    queryFn: async () => {
      const [r, e] = await Promise.all([
        supabase.from("verification_requests").select("*, locations(id, label, postcode, area, lga, state)").eq("id", id).maybeSingle(),
        supabase.from("verification_events").select("*").eq("verification_request_id", id).order("created_at"),
      ]);
      return { req: r.data, events: e.data ?? [] };
    },
  });
  const r = q.data?.req;
  if (q.isLoading) return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;
  if (!r) return <p className="p-6">Request not found.</p>;
  const loc = r.locations as { id: string; label: string; postcode: string | null; area: string | null; lga: string | null; state: string | null } | null;

  async function doRevoke() {
    const res = await revoke({ data: { id } });
    if ("error" in res && res.error) return toast.error(res.error);
    toast.success("Request revoked");
    qc.invalidateQueries();
  }

  return (
    <>
      <PageHeader title={r.recipient_name ?? "Verification request"} description={`${r.purpose ?? ""} · ${r.public_id}`}
        actions={<>
          <Link to="/verifications" className="inline-flex items-center gap-1 self-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />All requests</Link>
          {ACTIVE.includes(r.status) && <Button size="sm" variant="outline" onClick={doRevoke}>Revoke</Button>}
        </>} />
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-md border bg-card">
          <h2 className="border-b px-4 py-3 text-sm font-semibold">Details</h2>
          <dl className="divide-y text-sm">
            {([
              ["Status", <StatusBadge key="s" status={r.status} />],
              ["Reference", r.reference], ["Email", r.recipient_email], ["Phone", r.recipient_phone],
              ["Created", fmtDate(r.created_at, true)], ["Opened", fmtDate(r.opened_at, true)],
              ["Completed", fmtDate(r.completed_at, true)], ["Expires", fmtDate(r.expires_at, true)],
              ["Location", loc ? <Link key="l" to="/locations/$id" params={{ id: loc.id }} className="text-primary hover:underline">{loc.postcode ?? loc.label} · {[loc.area, loc.state].filter(Boolean).join(", ")}</Link> : "Awaiting submission"],
            ] as const).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[120px_1fr] px-4 py-2.5"><dt className="text-muted-foreground">{k}</dt><dd>{v ?? "—"}</dd></div>
            ))}
          </dl>
        </section>
        <section className="h-fit rounded-md border bg-card">
          <h2 className="border-b px-4 py-3 text-sm font-semibold">Event history</h2>
          <ol className="p-4">
            {q.data!.events.map((e, i) => (
              <li key={e.id} className="relative flex gap-3 pb-4 last:pb-0">
                {i < q.data!.events.length - 1 && <span className="absolute left-[3px] top-3 h-full w-px bg-border" />}
                <span className="mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full bg-primary" />
                <div className="text-sm">
                  <div className="font-mono text-xs">{e.event_type}</div>
                  <div className="text-xs text-muted-foreground">{e.actor_type} · {fmtDate(e.created_at, true)}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
