import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { Copy, ExternalLink } from "lucide-react";
import { useOrg } from "@/lib/org";
import { createVerificationRequest } from "@/lib/verification.functions";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/verifications/new")({
  head: () => ({ meta: [{ title: "New verification — LocateNG" }, { name: "description", content: "Create a verification request." }] }),
  component: Page,
});

const PURPOSES = ["Delivery address confirmation", "Merchant onboarding", "Customer onboarding", "Field service visit", "Other"];

function Page() {
  const org = useOrg();
  const create = useServerFn(createVerificationRequest);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ id: string; url: string } | null>(null);
  const [qr, setQr] = useState<string>("");

  useEffect(() => { if (result) QRCode.toDataURL(result.url, { margin: 1, width: 220 }).then(setQr); }, [result]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!org.data) return;
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const r = await create({ data: {
        organizationId: org.data.id,
        recipientName: String(f.get("name")),
        recipientEmail: String(f.get("email") ?? ""),
        recipientPhone: String(f.get("phone") ?? ""),
        reference: String(f.get("reference") ?? ""),
        purpose: String(f.get("purpose")),
        expiresInDays: Number(f.get("days")),
      } });
      if ("error" in r && r.error) throw new Error(r.error);
      if ("path" in r) { setResult({ id: r.id, url: window.location.origin + r.path }); qc.invalidateQueries(); }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create request");
    } finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader title="New verification request" description="The recipient gets a secure link to submit and confirm their location." />
      <div className="max-w-2xl p-6">
        {result ? (
          <div className="space-y-5 rounded-md border bg-card p-6">
            <div>
              <h2 className="font-semibold">Request created</h2>
              <p className="mt-1 text-sm text-muted-foreground">Copy this link now — for security it won't be shown again. Share it with the recipient by your usual channel.</p>
            </div>
            <div className="flex gap-2">
              <Input readOnly value={result.url} className="font-mono text-xs" aria-label="Verification link" />
              <Button variant="outline" onClick={() => { navigator.clipboard.writeText(result.url); toast.success("Link copied"); }}><Copy /></Button>
              <Button variant="outline" asChild><a href={result.url} target="_blank" rel="noreferrer"><ExternalLink /></a></Button>
            </div>
            {qr && <img src={qr} alt="QR code for the verification link" className="h-44 w-44 rounded-sm border" />}
            <div className="flex gap-2">
              <Button asChild><Link to="/verifications/$id" params={{ id: result.id }}>View request</Link></Button>
              <Button variant="outline" onClick={() => setResult(null)}>Create another</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5 rounded-md border bg-card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <F id="name" label="Recipient name" required maxLength={120} />
              <F id="reference" label="Your reference (optional)" maxLength={60} placeholder="ORD-12345" />
              <F id="email" label="Recipient email (optional)" type="email" maxLength={255} />
              <F id="phone" label="Recipient phone (optional)" maxLength={30} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="purpose">Purpose</Label>
                <select id="purpose" name="purpose" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {PURPOSES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="days">Link expires after</Label>
                <select id="days" name="days" defaultValue="7" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {[1, 3, 7, 14, 30].map((d) => <option key={d} value={d}>{d} day{d > 1 ? "s" : ""}</option>)}
                </select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Sending by email or SMS isn't connected yet — you'll copy the link after creating the request.</p>
            <Button type="submit" disabled={busy || !org.data}>{busy ? "Creating…" : "Create request"}</Button>
          </form>
        )}
      </div>
    </>
  );
}

function F({ id, label, ...rest }: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <div className="space-y-1.5"><Label htmlFor={id}>{label}</Label><Input id={id} name={id} {...rest} /></div>;
}
