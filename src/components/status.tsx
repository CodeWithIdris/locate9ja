import { CheckCircle2, Clock, XCircle, CircleDashed, AlertTriangle, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";
const MAP: Record<string, { label: string; tone: Tone }> = {
  resolved: { label: "Resolved", tone: "success" },
  unresolved: { label: "Unresolved", tone: "neutral" },
  not_found: { label: "Not found", tone: "danger" },
  confirmed: { label: "Confirmed", tone: "success" },
  unconfirmed: { label: "Unconfirmed", tone: "neutral" },
  awaiting_confirmation: { label: "Awaiting confirmation", tone: "warning" },
  rejected: { label: "Rejected", tone: "danger" },
  created: { label: "Created", tone: "neutral" },
  sent: { label: "Sent", tone: "info" },
  opened: { label: "Opened", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  expired: { label: "Expired", tone: "neutral" },
  revoked: { label: "Revoked", tone: "neutral" },
};
const TONE: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-destructive",
  info: "bg-info-soft text-info",
  neutral: "bg-muted text-muted-foreground",
};
const ICON: Record<Tone, typeof Clock> = {
  success: CheckCircle2, warning: Clock, danger: XCircle, info: CircleDashed, neutral: CircleDashed,
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const m = MAP[status] ?? { label: status, tone: "neutral" as Tone };
  const Icon = status === "revoked" ? Ban : status === "not_found" ? AlertTriangle : ICON[m.tone];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-medium whitespace-nowrap", TONE[m.tone], className)}>
      <Icon className="h-3 w-3" aria-hidden />
      {m.label}
    </span>
  );
}

export function ProviderTag({ provider }: { provider: string }) {
  return (
    <span className="inline-flex items-center rounded-sm border border-dashed border-warning/50 bg-warning-soft px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-warning">
      {provider === "mock" ? "Demo provider" : provider}
    </span>
  );
}
