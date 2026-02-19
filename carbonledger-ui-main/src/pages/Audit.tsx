import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { AuditTimeline } from "@/components/AuditTimeline";
import { EmptyState, ErrorState } from "@/components/EmptyState";
import { SkeletonTable } from "@/components/SkeletonTable";
import { useAuditTimeline } from "@/api/audit";
import { Button } from "@/components/ui/button";
import { Search, ClipboardList } from "lucide-react";

export default function AuditPage() {
  const [serialNumber, setSerialNumber] = useState("");
  const [submittedSerial, setSubmittedSerial] = useState("");

  const { data, isLoading, error, refetch } = useAuditTimeline(submittedSerial);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (serialNumber.trim()) {
      setSubmittedSerial(serialNumber.trim());
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Audit Trail"
        description="Track the complete chain of custody for any carbon credit"
      />

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <SearchInput
          value={serialNumber}
          onChange={setSerialNumber}
          placeholder="Enter serial number (e.g., ISO-US-FarmA-2026-001)"
          className="flex-1 max-w-lg"
        />
        <Button type="submit" disabled={!serialNumber.trim()}>
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </form>

      {/* Results */}
      {!submittedSerial ? (
        <EmptyState
          icon={<ClipboardList className="h-10 w-10 text-muted-foreground" />}
          title="Search for a credit"
          description="Enter a serial number above to view its complete audit trail and chain of custody."
        />
      ) : isLoading ? (
        <div className="max-w-2xl">
          <SkeletonTable rows={3} columns={2} />
        </div>
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <div className="max-w-2xl">
          <div className="mb-4 rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Serial Number</p>
            <p className="font-mono text-lg font-medium text-foreground">
              {submittedSerial}
            </p>
          </div>
          <AuditTimeline events={data?.events || []} />
        </div>
      )}
    </div>
  );
}
