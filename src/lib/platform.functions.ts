import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { hasCapability } from "./permissions";

async function requireOrgCapability(
  context: { supabase: Parameters<typeof getMembership>[0]; userId: string },
  organizationId: string,
  capability: Parameters<typeof hasCapability>[1],
) {
  const membership = await getMembership(context.supabase, organizationId, context.userId);
  if (!membership || !hasCapability(membership.role, capability)) throw new Error("You do not have permission to perform this action.");
  return membership;
}

async function getMembership(supabase: any, organizationId: string, userId: string) {
  const { data } = await supabase.from("organization_members").select("role").eq("organization_id", organizationId).eq("user_id", userId).maybeSingle();
  return data as { role: string } | null;
}

function randomSecret(prefix: string, bytes = 24) {
  const values = crypto.getRandomValues(new Uint8Array(bytes));
  return prefix + Array.from(values).map((value) => value.toString(16).padStart(2, "0")).join("");
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((item) => item.toString(16).padStart(2, "0")).join("");
}

export const createBusinessLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    organizationId: z.string().uuid(), name: z.string().trim().min(1).max(120),
    locationType: z.enum(["office", "warehouse", "retail", "field_site", "other"]),
    addressLine1: z.string().trim().min(1).max(240), city: z.string().trim().max(120).optional(),
    state: z.string().trim().max(120).optional(), isPrimary: z.boolean(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    await requireOrgCapability(context as any, data.organizationId, "manageOperations");
    const { data: row, error } = await context.supabase.from("business_locations").insert({
      organization_id: data.organizationId, name: data.name, location_type: data.locationType,
      address_line1: data.addressLine1, city: data.city || null, state: data.state || null,
      is_primary: data.isPrimary, created_by: context.userId,
    }).select("id").single();
    if (error) return { error: "The business location could not be saved." } as const;
    await context.supabase.from("audit_events").insert({ organization_id: data.organizationId, actor_user_id: context.userId, action: "business_location.created", resource_type: "business_location", resource_id: row.id });
    return { id: row.id } as const;
  });

export const createDeveloperProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ organizationId: z.string().uuid(), name: z.string().trim().min(1).max(120), environment: z.enum(["sandbox", "production"]) }).parse(input))
  .handler(async ({ data, context }) => {
    await requireOrgCapability(context as any, data.organizationId, "manageDevelopers");
    const { data: row, error } = await context.supabase.from("developer_projects").insert({ ...data, organization_id: data.organizationId, created_by: context.userId }).select("id").single();
    if (error) return { error: "The project could not be created." } as const;
    await context.supabase.from("audit_events").insert({ organization_id: data.organizationId, actor_user_id: context.userId, action: "developer_project.created", resource_type: "developer_project", resource_id: row.id });
    return { id: row.id } as const;
  });

export const listDeveloperSecrets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ organizationId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireOrgCapability(context as any, data.organizationId, "manageDevelopers");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [keys, hooks] = await Promise.all([
      supabaseAdmin.from("api_keys").select("id, developer_project_id, name, key_prefix, scopes, status, last_used_at, expires_at, created_at").eq("organization_id", data.organizationId).order("created_at", { ascending: false }),
      supabaseAdmin.from("webhook_endpoints").select("id, developer_project_id, name, url, secret_prefix, event_types, status, created_at").eq("organization_id", data.organizationId).order("created_at", { ascending: false }),
    ]);
    return { keys: keys.data ?? [], webhooks: hooks.data ?? [] };
  });

export const createApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ organizationId: z.string().uuid(), projectId: z.string().uuid(), name: z.string().trim().min(1).max(120) }).parse(input))
  .handler(async ({ data, context }) => {
    await requireOrgCapability(context as any, data.organizationId, "manageDevelopers");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const secret = randomSecret("lng_live_");
    const prefix = secret.slice(0, 13);
    const { data: project } = await supabaseAdmin.from("developer_projects").select("id").eq("id", data.projectId).eq("organization_id", data.organizationId).maybeSingle();
    if (!project) return { error: "Choose a valid project." } as const;
    const { data: row, error } = await supabaseAdmin.from("api_keys").insert({ organization_id: data.organizationId, developer_project_id: data.projectId, name: data.name, key_prefix: prefix, key_hash: await sha256(secret), scopes: ["locations:read", "locations:write", "verifications:write"], created_by: context.userId }).select("id").single();
    if (error) return { error: "The API key could not be created." } as const;
    await supabaseAdmin.from("audit_events").insert({ organization_id: data.organizationId, actor_user_id: context.userId, action: "api_key.created", resource_type: "api_key", resource_id: row.id, metadata: { prefix } });
    return { id: row.id, secret } as const;
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ organizationId: z.string().uuid(), id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireOrgCapability(context as any, data.organizationId, "manageDevelopers");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("api_keys").update({ status: "revoked", revoked_at: new Date().toISOString(), revoked_by: context.userId }).eq("id", data.id).eq("organization_id", data.organizationId);
    if (error) return { error: "The API key could not be revoked." } as const;
    await supabaseAdmin.from("audit_events").insert({ organization_id: data.organizationId, actor_user_id: context.userId, action: "api_key.revoked", resource_type: "api_key", resource_id: data.id });
    return { ok: true } as const;
  });

export const createWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ organizationId: z.string().uuid(), projectId: z.string().uuid(), name: z.string().trim().min(1).max(120), url: z.string().url().max(500), eventTypes: z.array(z.string()).min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    await requireOrgCapability(context as any, data.organizationId, "manageDevelopers");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const secret = randomSecret("whsec_");
    const { data: row, error } = await supabaseAdmin.from("webhook_endpoints").insert({ organization_id: data.organizationId, developer_project_id: data.projectId, name: data.name, url: data.url, secret_prefix: secret.slice(0, 12), secret_hash: await sha256(secret), event_types: data.eventTypes, created_by: context.userId }).select("id").single();
    if (error) return { error: "The webhook endpoint could not be created." } as const;
    await supabaseAdmin.from("audit_events").insert({ organization_id: data.organizationId, actor_user_id: context.userId, action: "webhook_endpoint.created", resource_type: "webhook_endpoint", resource_id: row.id });
    return { id: row.id, secret } as const;
  });

export const retryWebhookDelivery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ organizationId: z.string().uuid(), id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireOrgCapability(context as any, data.organizationId, "manageDevelopers");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("webhook_deliveries").update({ status: "retrying", next_attempt_at: new Date().toISOString() }).eq("id", data.id).eq("organization_id", data.organizationId).eq("status", "failed");
    if (error) return { error: "The delivery could not be queued for retry." } as const;
    await supabaseAdmin.from("audit_events").insert({ organization_id: data.organizationId, actor_user_id: context.userId, action: "webhook_delivery.retry_queued", resource_type: "webhook_delivery", resource_id: data.id });
    return { ok: true } as const;
  });