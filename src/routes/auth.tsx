import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site";

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => z.object({ mode: z.enum(["signin", "signup", "forgot"]).optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Sign in — LocateNG" },
      { name: "description", content: "Sign in or create a LocateNG organization account." },
      { property: "og:title", content: "Sign in — LocateNG" },
      { property: "og:description", content: "Access your LocateNG workspace." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode = "signin" } = Route.useSearch();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setSent("If an account exists for that email, a reset link is on its way.");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: String(f.get("name") ?? ""), organization_name: String(f.get("org") ?? "") },
          },
        });
        if (error) throw error;
        setSent("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) { toast.error("Google sign-in failed"); return; }
    if (r.redirected) return;
    navigate({ to: "/dashboard" });
  }

  const title = mode === "signup" ? "Create your organization" : mode === "forgot" ? "Reset your password" : "Sign in to LocateNG";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between bg-sidebar p-10 text-sidebar-foreground max-lg:hidden">
        <Link to="/"><Logo inverted /></Link>
        <div className="max-w-sm">
          <p className="text-lg text-sidebar-accent-foreground">Resolve a location. Have the right person confirm it. Keep the record.</p>
          <p className="mt-4 text-sm">New workspaces include sample locations and requests so you can explore every workflow.</p>
        </div>
        <p className="font-mono text-xs">LocateNG is not affiliated with NIPOST.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden"><Logo /></Link>
          <h1 className="mt-6 text-2xl font-semibold">{title}</h1>
          {sent ? (
            <div className="mt-6 rounded-md border bg-success-soft p-4 text-sm">{sent}</div>
          ) : (
            <>
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                {mode === "signup" && (
                  <>
                    <Field id="name" label="Your name" required />
                    <Field id="org" label="Organization name" required />
                  </>
                )}
                <Field id="email" label="Work email" type="email" required />
                {mode !== "forgot" && <Field id="password" label="Password" type="password" required minLength={8} />}
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
                </Button>
              </form>
              {mode !== "forgot" && (
                <>
                  <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
                  <Button variant="outline" className="w-full" onClick={google}>Continue with Google</Button>
                </>
              )}
            </>
          )}
          <div className="mt-6 space-y-1 text-sm text-muted-foreground">
            {mode === "signin" && (
              <>
                <p>No account? <Link to="/auth" search={{ mode: "signup" }} className="text-primary hover:underline">Create one</Link></p>
                <p><Link to="/auth" search={{ mode: "forgot" }} className="text-primary hover:underline">Forgot password?</Link></p>
              </>
            )}
            {mode !== "signin" && <p><Link to="/auth" search={{ mode: "signin" }} className="text-primary hover:underline">Back to sign in</Link></p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ id, label, ...rest }: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} {...rest} />
    </div>
  );
}
