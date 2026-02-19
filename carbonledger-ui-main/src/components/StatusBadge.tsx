import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        active: "bg-success/10 text-success",
        retired: "bg-muted text-muted-foreground",
        pending: "bg-warning/10 text-warning",
        error: "bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ variant, className, children }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ variant }), className)}>
      {children}
    </span>
  );
}

// Helper to map credit status to badge variant
export function getCreditStatusVariant(
  status: string
): "active" | "retired" | "pending" | "default" {
  switch (status) {
    case "ACTIVE":
      return "active";
    case "RETIRED":
      return "retired";
    case "PENDING":
      return "pending";
    default:
      return "default";
  }
}
