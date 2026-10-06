import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutGrid, MapPin, Send, ScrollText, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org";
import { Logo } from "@/components/site";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutGrid },
  { to: "/locations", label: "Locations", icon: MapPin },
  { to: "/verifications", label: "Verifications", icon: Send },
  { to: "/audit", label: "Audit log", icon: ScrollText },
] as const;

export function AppShell() {
  const org = useOrg();
  const qc = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col bg-sidebar text-sidebar-foreground max-md:hidden">
        <div className="px-4 py-4"><Link to="/dashboard"><Logo inverted /></Link></div>
        <div className="mx-3 mb-3 rounded-sm border border-sidebar-border px-2.5 py-2">
          <div className="font-mono text-[10px] uppercase tracking-wider opacity-70">Organization</div>
          <div className="truncate text-sm text-sidebar-accent-foreground">{org.data?.name ?? "…"}</div>
        </div>
        <nav className="flex-1 space-y-0.5 px-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}>
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3 text-xs">
          <div className="mb-2 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-warning" /> Demo provider active</div>
          <div className="truncate opacity-70">{org.data?.email}</div>
          <button onClick={signOut} className="mt-2 flex items-center gap-1.5 hover:text-sidebar-accent-foreground"><LogOut className="h-3.5 w-3.5" />Sign out</button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b bg-sidebar px-4 py-2 md:hidden">
          <Logo inverted />
          <nav className="flex gap-3 text-xs text-sidebar-foreground">
            {NAV.map(({ to, label }) => <Link key={to} to={to} activeProps={{ className: "text-sidebar-primary" }}>{label.split(" ")[0]}</Link>)}
          </nav>
        </div>
        <main className="flex-1"><Outlet /></main>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string | undefined; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b bg-background px-6 py-5">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed p-10 text-center">
      <div className="font-medium">{title}</div>
      {children && <div className="mt-1 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}
