import { cn } from "@/lib/utils";

interface FilterTabsProps<T extends string> {
  tabs: { value: T; label: string; count?: number }[];
  activeTab: T;
  onTabChange: (value: T) => void;
  className?: string;
}

export function FilterTabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  className,
}: FilterTabsProps<T>) {
  return (
    <div className={cn("flex gap-1 rounded-lg bg-muted p-1", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            activeTab === tab.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                "ml-1.5 rounded-full px-1.5 py-0.5 text-xs",
                activeTab === tab.value
                  ? "bg-primary/10 text-primary"
                  : "bg-muted-foreground/20 text-muted-foreground"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
