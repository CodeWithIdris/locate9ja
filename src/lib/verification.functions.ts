import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getLocationProvider } from "./provider/location-provider";

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function randomToken(bytes = 24) {
  const a = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(a).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const createVerificationRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      organizationId: z.string().uuid(),
      recipientName: z.string().trim().min(1).max(120),
      recipientEmail: z.string().trim().email().max(255).optional().or(z.literal("")),
      recipientPhone: z.string().trim().max(30).optional(),
      reference: z.string().trim().max(60).optional(),
      purpose: z.string().trim().max(120),
      expiresInDays: z.number().int().min(1).max(30),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const secret = randomToken();
    const publicId = "vr_" + randomToken(6);
    const { data: row, error } = await supabase.from("verification_requests").insert({
      public_id: publicId,
      organization_id: data.organizationId,
      recipient_name: data.recipientName,
      recipient_email: data.recipientEmail || null,
      recipient_phone: data.recipientPhone || null,
      reference: data.reference || null,
      purpose: data.purpose,
      token_hash: await sha256(secret),
      status: "sent",
      expires_at: new Date(Date.now() + data.expiresInDays * 864e5).toISOString(),
      created_by: userId,
    }).select("id").single();
    if (error) return { error: "Could not create the request." } as const;
    await supabase.from("verification_events").insert([
      { verification_request_id: row.id, organization_id: data.organizationId, event_type: "created", actor_type: "user", actor_id: userId },
      { verification_request_id: row.id, organization_id: data.organizationId, event_type: "link_issued", actor_type: "user", actor_id: userId },
    ]);
    await supabase.from("audit_events").insert({
      organization_id: data.organizationId, actor_user_id: userId,
      action: "verification_request.created", resource_type: "verification_request", resource_id: row.id,
    });
    // Secret is returned once and never stored in plain form.
    return { id: row.id, path: `/v/${publicId}?t=${secret}` } as const;
  });

export const revokeVerificationRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase.from("verification_requests")
      .update({ status: "revoked", updated_at: new Date().toISOString() })
      .eq("id", data.id).select("organization_id").single();
    if (error) return { error: "Could not revoke." } as const;
    await supabase.from("verification_events").insert({ verification_request_id: data.id, organization_id: row.organization_id, event_type: "revoked", actor_type: "user", actor_id: userId });
    return { ok: true } as const;
  });

/* ---------------- Public recipient flow (token-verified) ---------------- */

const tokenInput = z.object({ publicId: z.string().min(4).max(40), token: z.string().min(16).max(128) });

async function loadByToken(publicId: string, token: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("verification_requests")
    .select("id, organization_id, status, token_hash, expires_at, purpose, recipient_name, location_id, organizations(name)")
    .eq("public_id", publicId).maybeSingle();
  if (!data || data.token_hash !== (await sha256(token))) return { admin: supabaseAdmin, req: null };
  return { admin: supabaseAdmin, req: data };
}

const FINAL = ["completed", "rejected", "revoked", "expired"];

export const getPublicVerification = createServerFn({ method: "POST" })
  .inputValidator((d) => tokenInput.parse(d))
  .handler(async ({ data }) => {
    const { admin, req } = await loadByToken(data.publicId, data.token);
    if (!req) return { state: "invalid" as const };
    let status = req.status;
    if (!FINAL.includes(status) && new Date(req.expires_at) < new Date()) {
      status = "expired";
      await admin.from("verification_requests").update({ status }).eq("id", req.id);
    }
    if (status === "sent" || status === "created") {
      status = "opened";
      await admin.from("verification_requests").update({ status, opened_at: new Date().toISOString() }).eq("id", req.id);
      await admin.from("verification_events").insert({ verification_request_id: req.id, organization_id: req.organization_id, event_type: "opened", actor_type: "recipient" });
    }
    let location = null;
    if (req.location_id) {
      const { data: loc } = await admin.from("locations")
        .select("postcode, formatted_address, state, lga, district, area").eq("id", req.location_id).maybeSingle();
      location = loc;
    }
    return {
      state: "ok" as const,
      status,
      organization: (req.organizations as { name: string } | null)?.name ?? "An organization",
      purpose: req.purpose,
      recipientFirstName: (req.recipient_name ?? "").split(" ")[0],
      expiresAt: req.expires_at,
      location,
    };
  });

export const submitPublicLocation = createServerFn({ method: "POST" })
  .inputValidator((d) => tokenInput.extend({ reference: z.string().trim().min(3).max(40) }).parse(d))
  .handler(async ({ data }) => {
    const { admin, req } = await loadByToken(data.publicId, data.token);
    if (!req) return { error: "This link is not valid." };
    if (FINAL.includes(req.status) || new Date(req.expires_at) < new Date()) return { error: "This request is no longer active." };
    const out = await getLocationProvider().resolvePostcode({ postcode: data.reference });
    if (!out.ok) {
      await admin.from("verification_events").insert({ verification_request_id: req.id, organization_id: req.organization_id, event_type: out.code === "provider_unavailable" ? "provider_error" : "resolution_failed", actor_type: "system" });
      return { error: out.message };
    }
    const r = out.result;
    const { data: loc, error } = await admin.from("locations").insert({
      organization_id: req.organization_id,
      label: `Submitted by ${req.recipient_name ?? "recipient"}`,
      provider: r.provider, provider_reference: r.providerReference ?? null, postcode: r.postcode,
      formatted_address: r.formattedAddress ?? null, state: r.hierarchy?.state ?? null, lga: r.hierarchy?.lga ?? null,
      district: r.hierarchy?.district ?? null, area: r.hierarchy?.area ?? null,
      latitude: r.coordinates?.latitude ?? null, longitude: r.coordinates?.longitude ?? null,
      resolution_status: "resolved", confirmation_status: "awaiting_confirmation", source_updated_at: new Date().toISOString(),
    }).select("id").single();
    if (error) return { error: "Could not save the location." };
    await admin.from("verification_requests").update({ location_id: loc.id, status: "awaiting_confirmation", updated_at: new Date().toISOString() }).eq("id", req.id);
    await admin.from("verification_events").insert([
      { verification_request_id: req.id, organization_id: req.organization_id, event_type: "location_submitted", actor_type: "recipient" },
      { verification_request_id: req.id, organization_id: req.organization_id, event_type: "location_resolved", actor_type: "system" },
    ]);
    return { ok: true };
  });

export const decidePublicVerification = createServerFn({ method: "POST" })
  .inputValidator((d) => tokenInput.extend({ decision: z.enum(["confirm", "reject"]) }).parse(d))
  .handler(async ({ data }) => {
    const { admin, req } = await loadByToken(data.publicId, data.token);
    if (!req) return { error: "This link is not valid." };
    if (req.status !== "awaiting_confirmation" || !req.location_id) return { error: "Nothing to confirm right now." };
    const now = new Date().toISOString();
    if (data.decision === "confirm") {
      await admin.from("locations").update({ confirmation_status: "confirmed", updated_at: now }).eq("id", req.location_id);
      await admin.from("verification_requests").update({ status: "completed", completed_at: now, updated_at: now }).eq("id", req.id);
      await admin.from("verification_events").insert([
        { verification_request_id: req.id, organization_id: req.organization_id, event_type: "confirmed", actor_type: "recipient" },
        { verification_request_id: req.id, organization_id: req.organization_id, event_type: "completed", actor_type: "system" },
      ]);
    } else {
      await admin.from("locations").update({ confirmation_status: "rejected", updated_at: now }).eq("id", req.location_id);
      await admin.from("verification_requests").update({ status: "rejected", completed_at: now, updated_at: now }).eq("id", req.id);
      await admin.from("verification_events").insert({ verification_request_id: req.id, organization_id: req.organization_id, event_type: "rejected", actor_type: "recipient" });
    }
    return { ok: true };
  });
