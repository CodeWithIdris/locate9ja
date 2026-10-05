import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg, fmtDate } from "@/lib/org";
import { PageHeader } from "@/components/app-shell";
import { StatusBadge } from "@/components/status";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Overview — LocateNG" }, { name: "description", content: "Organization overview." }] }),
  component: Dashboard,
});

function Dashboard() {
  const org = useOrg();
  const orgId = org.data?.id;
  const q = useQuery({
    queryKey: ["dashboard", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const [locs, vrs] = await Promise.all([
        supabase.from("locations").select("resolution_status, confirmation_status").eq("organization_id", orgId!),
        supabase.from("verification_requests").select("id, public_id, recipient_name, purpose, status, created_at").eq("organization_id", orgId!).order("created_at", { ascending: false }),
      ]);
      return { locs: locs.data ?? [], vrs: vrs.data ?? [] };
    },
  });
  const l = q.data?.locs ?? [], v = q.data?.vrs ?? [];
  const open = v.filter((x) => ["sent", "opened", "awaiting_confirmation", "created"].includes(x.status)).length;
  const stats = [
    ["Locations", l.length],
    ["Confirmed", l.filter((x) => x.confirmation_status === "confirmed").length],
    ["Open requests", open],
    ["Completed requests", v.filter((x) => x.status === "completed").length],
  ] as const;

  return (
    <>
      <PageHeader title="Overview" description={org.data?.name}
        actions={<Button asChild size="sm"><Link to="/verifications/new"><Plus />New verification</Link></Button>} />
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border lg:grid-cols-4">
          {stats.map(([k, n]) => (
            <div key={k} className="bg-card p-4">
              <div className="eyebrow">{k}</div>
              <div className="mt-2 font-mono text-2xl">{q.isLoading ? "–" : n}</div>
            </div>
          ))}
        </div>
        <section className="rounded-md border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Recent verification requests</h2>
            <Link to="/verifications" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y">
              {v.slice(0, 6).map((r) => (
                <tr key={r.id} className="hover:bg-muted/50">
                  <td className="px-4 py-2.5"><Link to="/verifications/$id" params={{ id: r.id }} className="font-medium hover:underline">{r.recipient_name}</Link><div className="text-xs text-muted-foreground">{r.purpose}</div></td>
                  <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{fmtDate(r.created_at)}</td>
                </tr>
              ))}
              {!q.isLoading && v.length === 0 && <tr><td className="px-4 py-8 text-center text-muted-foreground">No requests yet.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
