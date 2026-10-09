import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 font-semibold tracking-tight">
      <span className={inverted ? "grid h-6 w-6 place-items-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground" : "grid h-6 w-6 place-items-center rounded-sm bg-primary text-primary-foreground"}>
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden><path fill="currentColor" d="M8 1a5 5 0 0 0-5 5c0 3.6 5 9 5 9s5-5.4 5-9a5 5 0 0 0-5-5Zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/></svg>
      </span>
      <span>Locate<span className={inverted ? "text-sidebar-primary" : "text-primary"}>NG</span></span>
    </span>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="border-b bg-background/95">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link to="/" aria-label="LocateNG home"><Logo /></Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link to="/how-it-works" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>How it works</Link>
          <Link to="/pricing" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Pricing</Link>
          <Link to="/docs" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Developers</Link>
          <Link to="/trust" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Trust & security</Link>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
          <Button asChild size="sm"><Link to="/auth" search={{ mode: "signup" }}>Get started</Link></Button>
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={open}><Menu /></Button>
      </div>
      {open && (
        <nav className="border-t px-6 py-4 md:hidden">
          <div className="grid gap-1 text-sm">
            <Link to="/how-it-works" className="py-2">How it works</Link>
            <Link to="/pricing" className="py-2">Pricing</Link>
            <Link to="/docs" className="py-2">Developers</Link>
            <Link to="/trust" className="py-2">Trust & security</Link>
            <div className="mt-2 flex gap-2 border-t pt-4"><Button asChild variant="outline" size="sm"><Link to="/auth">Sign in</Link></Button><Button asChild size="sm"><Link to="/auth" search={{ mode: "signup" }}>Get started</Link></Button></div>
          </div>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-surface">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 text-sm text-muted-foreground md:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm">Turn Nigerian addresses into reliable, structured business data your teams and systems can reuse.</p>
        </div>
        <div className="space-y-2">
          <div className="eyebrow">Product</div>
          <Link to="/how-it-works" className="block hover:text-foreground">How it works</Link>
          <Link to="/pricing" className="block hover:text-foreground">Pricing</Link>
          <Link to="/trust" className="block hover:text-foreground">Trust & security</Link>
        </div>
        <div className="space-y-2">
          <div className="eyebrow">Resources</div>
          <Link to="/docs" className="block hover:text-foreground">API documentation</Link>
          <Link to="/auth" className="block hover:text-foreground">Sign in</Link>
          <Link to="/auth" search={{ mode: "signup" }} className="block hover:text-foreground">Get started</Link>
        </div>
      </div>
    </footer>
  );
}
