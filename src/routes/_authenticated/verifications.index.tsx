import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg, fmtDate } from "@/lib/org";
import { PageHeader, EmptyState } from "@/components/app-shell";
import { StatusBadge } from "@/components/status";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/verifications/")({
  head: () => ({ meta: [{ title: "Verifications — LocateNG" }, { name: "description", content: "Verification requests." }] }),
  component: Page,
});

const FILTERS = ["all", "sent", "opened", "awaiting_confirmation", "completed", "rejected", "revoked", "expired"];

function Page() {
  const org = useOrg();
  const orgId = org.data?.id;
  const [f, setF] = useState("all");
  const q = useQuery({
    queryKey: ["verifications", orgId],
    enabled: !!orgId,
    queryFn: async () => (await supabase.from("verification_requests").select("id, public_id, reference, recipient_name, recipient_email, purpose, status, expires_at, created_at").eq("organization_id", orgId!).order("created_at", { ascending: false })).data ?? [],
  });
  const rows = (q.data ?? []).filter((r) => f === "all" || r.status === f);
  return (
    <>
      <PageHeader title="Verification requests" description="Ask the intended person to confirm a location."
        actions={<Button asChild size="sm"><Link to="/verifications/new"><Plus />New request</Link></Button>} />
      <div className="p-6">
        <div className="mb-4 flex flex-wrap gap-1">
          {FILTERS.map((x) => (
            <button key={x} onClick={() => setF(x)} className={`rounded-sm border px-2 py-1 text-xs ${f === x ? "border-primary bg-accent text-accent-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>
              {x === "all" ? "All" : x.replace("_", " ")}
            </button>
          ))}
        </div>
        {!q.isLoading && rows.length === 0 ? <EmptyState title="No requests match">Create a request to get started.</EmptyState> : (
          <div className="overflow-x-auto rounded-md border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>{["Recipient", "Reference", "Purpose", "Status", "Expires", "Created"].map((h) => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/40">
                    <td className="px-4 py-2.5"><Link to="/verifications/$id" params={{ id: r.id }} className="font-medium hover:underline">{r.recipient_name}</Link><div className="text-xs text-muted-foreground">{r.recipient_email}</div></td>
                    <td className="px-4 py-2.5 font-mono text-xs">{r.reference ?? "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.purpose}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(r.expires_at)}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
