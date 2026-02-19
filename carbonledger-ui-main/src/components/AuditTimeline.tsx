import { cn } from "@/lib/utils";
import type { AuditAction } from "@/types";
import {
  FileCheck,
  ShieldCheck,
  Coins,
  ArrowRightLeft,
  Archive,
} from "lucide-react";
import { formatDateTime } from "@/utils/format";

interface TimelineEvent {
  id: number;
  action: AuditAction;
  timestamp: string;
  actor: string;
  details: string;
}

interface AuditTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const actionConfig: Record<
  AuditAction,
  { icon: React.ElementType; label: string; color: string }
> = {
  EMISSION_REPORTED: {
    icon: FileCheck,
    label: "Emission Reported",
    color: "bg-blue-100 text-blue-700",
  },
  VERIFICATION_COMPLETED: {
    icon: ShieldCheck,
    label: "Verification Completed",
    color: "bg-purple-100 text-purple-700",
  },
  CREDIT_ISSUED: {
    icon: Coins,
    label: "Credit Issued",
    color: "bg-success/10 text-success",
  },
  TRADE_COMPLETED: {
    icon: ArrowRightLeft,
    label: "Trade Completed",
    color: "bg-amber-100 text-amber-700",
  },
  CREDIT_RETIRED: {
    icon: Archive,
    label: "Credit Retired",
    color: "bg-muted text-muted-foreground",
  },
};

export function AuditTimeline({ events, className }: AuditTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          No audit events found for this serial number.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Timeline line */}
      <div className="absolute left-[19px] top-0 h-full w-0.5 bg-border" />

      <div className="space-y-6">
        {events.map((event, index) => {
          const config = actionConfig[event.action];
          const Icon = config.icon;

          return (
            <div key={event.id} className="relative flex gap-4 animate-fade-in">
              {/* Icon */}
              <div
                className={cn(
                  "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  config.color
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 rounded-lg border border-border bg-card p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {config.label}
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDateTime(event.timestamp)}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {event.actor}
                  </span>
                </div>
                <p className="mt-2 text-sm text-foreground/80">{event.details}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
