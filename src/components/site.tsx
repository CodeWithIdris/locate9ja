import { Link } from "@tanstack/react-router";
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
  return (
    <header className="border-b bg-background/95">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link to="/" aria-label="LocateNG home"><Logo /></Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link to="/how-it-works" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>How it works</Link>
          <Link to="/trust" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Trust & boundaries</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
          <Button asChild size="sm"><Link to="/auth" search={{ mode: "signup" }}>Create account</Link></Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-surface">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 text-sm text-muted-foreground md:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm">
            LocateNG is an independent workflow platform. It is not NIPOST and does not operate the National Digital Alphanumeric Postcode System.
          </p>
        </div>
        <div className="space-y-2">
          <div className="eyebrow">Product</div>
          <Link to="/how-it-works" className="block hover:text-foreground">How it works</Link>
          <Link to="/trust" className="block hover:text-foreground">Trust & boundaries</Link>
        </div>
        <div className="space-y-2">
          <div className="eyebrow">Account</div>
          <Link to="/auth" className="block hover:text-foreground">Sign in</Link>
          <Link to="/auth" search={{ mode: "signup" }} className="block hover:text-foreground">Create account</Link>
        </div>
      </div>
    </footer>
  );
}
