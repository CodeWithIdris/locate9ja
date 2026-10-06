import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useOrg, fmtDate } from "@/lib/org";
import { createLocation } from "@/lib/locations.functions";
import { PageHeader, EmptyState } from "@/components/app-shell";
import { StatusBadge } from "@/components/status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/locations/")({
  head: () => ({ meta: [{ title: "Locations — LocateNG" }, { name: "description", content: "Organization location records." }] }),
  component: Page,
});

function Page() {
  const org = useOrg();
  const orgId = org.data?.id;
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const q = useQuery({
    queryKey: ["locations", orgId],
    enabled: !!orgId,
    queryFn: async () => (await supabase.from("locations").select("*").eq("organization_id", orgId!).order("created_at", { ascending: false })).data ?? [],
  });
  const rows = (q.data ?? []).filter((r) => !term || [r.label, r.postcode, r.area, r.state, r.lga].some((x) => x?.toLowerCase().includes(term.toLowerCase())));

  return (
    <>
      <PageHeader title="Locations" description="Reusable location records for your organization."
        actions={<Button size="sm" onClick={() => setOpen(true)}><Plus />Add location</Button>} />
      <div className="p-6">
        <div className="relative mb-4 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search label, reference, area…" className="pl-8" aria-label="Search locations" />
        </div>
        {!q.isLoading && rows.length === 0 ? (
          <EmptyState title={term ? "No matching locations" : "No locations yet"}>Add a location or send a verification request.</EmptyState>
        ) : (
          <div className="overflow-x-auto rounded-md border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>{["Label", "Reference", "Area / LGA / State", "Resolution", "Confirmation", "Created"].map((h) => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/40">
                    <td className="px-4 py-2.5"><Link to="/locations/$id" params={{ id: r.id }} className="font-medium hover:underline">{r.label}</Link></td>
                    <td className="px-4 py-2.5 font-mono text-xs">{r.postcode ?? "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{[r.area, r.lga, r.state].filter(Boolean).join(", ") || "—"}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={r.resolution_status} /></td>
                    <td className="px-4 py-2.5"><StatusBadge status={r.confirmation_status} /></td>
                    <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {orgId && <AddDialog open={open} onOpenChange={setOpen} orgId={orgId} />}
    </>
  );
}

function AddDialog({ open, onOpenChange, orgId }: { open: boolean; onOpenChange: (b: boolean) => void; orgId: string }) {
  const create = useServerFn(createLocation);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const r = await create({ data: { organizationId: orgId, label: String(f.get("label")), reference: String(f.get("reference") || "") || undefined, inputText: String(f.get("input") || "") || undefined } });
    setBusy(false);
    if ("error" in r && r.error) { toast.error(r.error); return; }
    toast.success(r.notFound ? "Saved — reference not found, location left unresolved" : "Location saved");
    qc.invalidateQueries({ queryKey: ["locations"] });
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add location</DialogTitle>
          <DialogDescription>Resolve via the configured provider, or save the free-text description to resolve later.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="label">Label</Label><Input id="label" name="label" required maxLength={120} placeholder="e.g. Ikeja warehouse" /></div>
          <div className="space-y-1.5"><Label htmlFor="reference">Location reference (optional)</Label><Input id="reference" name="reference" maxLength={40} className="font-mono" placeholder="DEMO-KN-0005" /></div>
          <div className="space-y-1.5"><Label htmlFor="input">Address as received (optional)</Label><Textarea id="input" name="input" maxLength={500} rows={2} /></div>
          <Button type="submit" disabled={busy}>{busy ? "Resolving…" : "Save location"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
