import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getLocationProvider } from "./provider/location-provider";

export const createLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      organizationId: z.string().uuid(),
      label: z.string().trim().min(1).max(120),
      reference: z.string().trim().max(40).optional(),
      inputText: z.string().trim().max(500).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    let resolved = null as null | Awaited<ReturnType<ReturnType<typeof getLocationProvider>["resolvePostcode"]>>;
    if (data.reference) resolved = await getLocationProvider().resolvePostcode({ postcode: data.reference });
    if (resolved && !resolved.ok && resolved.code !== "not_found") {
      return { error: resolved.message } as const;
    }
    const r = resolved?.ok ? resolved.result : null;
    const { data: row, error } = await supabase.from("locations").insert({
      organization_id: data.organizationId,
      label: data.label,
      input_text: data.inputText ?? null,
      provider: getLocationProvider().name,
      provider_reference: r?.providerReference ?? null,
      postcode: r?.postcode ?? null,
      formatted_address: r?.formattedAddress ?? null,
      state: r?.hierarchy?.state ?? null,
      lga: r?.hierarchy?.lga ?? null,
      district: r?.hierarchy?.district ?? null,
      area: r?.hierarchy?.area ?? null,
      latitude: r?.coordinates?.latitude ?? null,
      longitude: r?.coordinates?.longitude ?? null,
      resolution_status: r ? "resolved" : resolved ? "not_found" : "unresolved",
      source_updated_at: r ? new Date().toISOString() : null,
      created_by: userId,
    }).select("id").single();
    if (error) return { error: "Could not save the location." } as const;
    await supabase.from("audit_events").insert({
      organization_id: data.organizationId, actor_user_id: userId,
      action: "location.created", resource_type: "location", resource_id: row.id,
      metadata: { resolution: r ? "resolved" : "unresolved" },
    });
    return { id: row.id, notFound: resolved && !resolved.ok } as const;
  });
