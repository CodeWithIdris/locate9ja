import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { getPublicVerification, submitPublicLocation, decidePublicVerification } from "@/lib/verification.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site";
import { fmtDate } from "@/lib/org";

export const Route = createFileRoute("/v/$publicId")({
  validateSearch: (s) => z.object({ t: z.string().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Confirm your location — LocateNG" },
      { name: "description", content: "Secure location confirmation request." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Confirm your location — LocateNG" },
      { property: "og:description", content: "A secure request to confirm a physical location." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const { publicId } = Route.useParams();
  const { t = "" } = Route.useSearch();
  const qc = useQueryClient();
  const get = useServerFn(getPublicVerification);
  const submit = useServerFn(submitPublicLocation);
  const decide = useServerFn(decidePublicVerification);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const key = ["public-vr", publicId, t];
  const q = useQuery({ queryKey: key, queryFn: () => get({ data: { publicId, token: t } }), enabled: t.length >= 16, retry: false });

  async function run(fn: () => Promise<{ error?: string }>) {
    setBusy(true); setErr(null);
    const r = await fn();
    setBusy(false);
    if (r.error) setErr(r.error); else qc.invalidateQueries({ queryKey: key });
  }

  let body: React.ReactNode;
  if (t.length < 16 || q.data?.state === "invalid") {
    body = <Notice tone="danger" title="This link isn't valid">Ask the organization that sent it for a new link.</Notice>;
  } else if (q.isLoading) {
    body = <p className="text-sm text-muted-foreground">Loading request…</p>;
  } else if (q.isError || !q.data || q.data.state !== "ok") {
    body = <Notice tone="danger" title="We couldn't load this request">Please try again in a moment.</Notice>;
  } else {
    const d = q.data;
    body = (
      <div className="space-y-6">
        <div>
          <div className="eyebrow">Location confirmation request</div>
          <h1 className="mt-2 text-xl font-semibold">{d.recipientFirstName ? `Hi ${d.recipientFirstName}, ` : ""}{d.organization} asked you to confirm a location.</h1>
          <p className="mt-1 text-sm text-muted-foreground">Purpose: {d.purpose} · Expires {fmtDate(d.expiresAt)}</p>
        </div>

        {d.status === "opened" && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); const ref = String(new FormData(e.currentTarget).get("ref")); run(() => submit({ data: { publicId, token: t, reference: ref } })); }}>
            <Label htmlFor="ref">Your location reference</Label>
            <Input id="ref" name="ref" required placeholder="e.g. DEMO-LA-0001" className="font-mono" />
            <p className="text-xs text-muted-foreground">Demo mode: try DEMO-LA-0001, DEMO-FC-0002, DEMO-RI-0004 or DEMO-KN-0005.</p>
            <Button type="submit" disabled={busy}>{busy ? "Looking up…" : "Find location"}</Button>
          </form>
        )}

        {d.status === "awaiting_confirmation" && d.location && (
          <div className="space-y-4">
            <dl className="divide-y rounded-md border text-sm">
              {[["Reference", d.location.postcode], ["Address", d.location.formatted_address], ["Area", d.location.area], ["LGA", d.location.lga], ["State", d.location.state]].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[110px_1fr] px-3 py-2"><dt className="text-muted-foreground">{k}</dt><dd className={k === "Reference" ? "font-mono" : ""}>{v ?? "—"}</dd></div>
              ))}
            </dl>
            <p className="text-sm">Is this the place you meant?</p>
            <div className="flex gap-2">
              <Button disabled={busy} onClick={() => run(() => decide({ data: { publicId, token: t, decision: "confirm" } }))}>Yes, confirm</Button>
              <Button variant="outline" disabled={busy} onClick={() => run(() => decide({ data: { publicId, token: t, decision: "reject" } }))}>No, this is wrong</Button>
            </div>
          </div>
        )}

        {d.status === "completed" && <Notice tone="success" title="Location confirmed">Thank you. {d.organization} has been notified. You can close this page.</Notice>}
        {d.status === "rejected" && <Notice tone="danger" title="Marked as incorrect">{d.organization} will follow up with you.</Notice>}
        {d.status === "expired" && <Notice tone="neutral" title="This request has expired">Ask {d.organization} for a new link.</Notice>}
        {d.status === "revoked" && <Notice tone="neutral" title="This request was withdrawn">No further action is needed.</Notice>}
        {err && <p role="alert" className="rounded-md bg-danger-soft p-3 text-sm text-destructive">{err}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b bg-background"><div className="mx-auto flex h-14 max-w-xl items-center px-6"><Logo /></div></header>
      <main className="mx-auto max-w-xl px-6 py-10">
        <div className="rounded-md border bg-card p-6 shadow-sm">{body}</div>
        <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Your response is recorded for the stated purpose. It does not establish identity, residence or ownership.
        </p>
      </main>
    </div>
  );
}

function Notice({ tone, title, children }: { tone: "success" | "danger" | "neutral"; title: string; children: React.ReactNode }) {
  const cls = tone === "success" ? "bg-success-soft" : tone === "danger" ? "bg-danger-soft" : "bg-muted";
  return (
    <div className={`rounded-md p-4 ${cls}`}>
      <div className="flex items-center gap-2 font-medium">{tone !== "success" && <AlertTriangle className="h-4 w-4" />}{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
