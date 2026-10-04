import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useOrg() {
  return useQuery({
    queryKey: ["current-org"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("organization_members")
        .select("role, organizations(id, name, slug)")
        .eq("user_id", u.user!.id)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      const org = data?.organizations as { id: string; name: string; slug: string } | null;
      return org ? { ...org, role: data!.role, email: u.user!.email ?? "" } : null;
    },
    staleTime: 60_000,
  });
}

export function fmtDate(s: string | null | undefined, withTime = false) {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-NG", withTime
    ? { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "short", year: "numeric" });
}
