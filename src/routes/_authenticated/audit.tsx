import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrg, fmtDate } from "@/lib/org";
import { PageHeader, EmptyState } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({ meta: [{ title: "Audit log — LocateNG" }, { name: "description", content: "Organization audit log." }] }),
  component: Page,
});

function Page() {
  const org = useOrg();
  const orgId = org.data?.id;
  const q = useQuery({
    queryKey: ["audit", orgId],
    enabled: !!orgId,
    queryFn: async () => (await supabase.from("audit_events").select("*").eq("organization_id", orgId!).order("created_at", { ascending: false }).limit(200)).data ?? [],
  });
  return (
    <>
      <PageHeader title="Audit log" description="Actions taken by members of your organization." />
      <div className="p-6">
        {!q.isLoading && (q.data ?? []).length === 0 ? <EmptyState title="No events yet" /> : (
          <div className="overflow-x-auto rounded-md border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>{["Time", "Action", "Resource", "Resource ID"].map((h) => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {(q.data ?? []).map((e) => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap px-4 py-2 text-muted-foreground">{fmtDate(e.created_at, true)}</td>
                    <td className="px-4 py-2 font-mono text-xs">{e.action}</td>
                    <td className="px-4 py-2">{e.resource_type}</td>
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{e.resource_id?.slice(0, 8) ?? "—"}</td>
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
