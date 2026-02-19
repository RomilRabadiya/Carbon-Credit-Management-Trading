import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchCredits } from "@/store/slices/walletSlice";
import { PageHeader } from "@/components/PageHeader";
import { SummaryCard } from "@/components/SummaryCard";
import { StatusBadge, getCreditStatusVariant } from "@/components/StatusBadge";
import { FilterTabs } from "@/components/FilterTabs";
import { SearchInput } from "@/components/SearchInput";
import { SkeletonTable, SkeletonCard } from "@/components/SkeletonTable";
import { EmptyState, ErrorState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/auth/AuthContext";
import { useWebSocket } from "@/context/WebSocketContext";
import { useToast } from "@/components/ui/use-toast";
import { formatCarbonAmount, formatDate, formatNumber } from "@/utils/format";
import { Leaf, Coins, Archive, ArrowUpDown, FileText, DollarSign, XCircle } from "lucide-react";
import type { Credit } from "@/types";
import { motion } from "framer-motion";

type FilterValue = "all" | "active" | "retired";

export default function WalletPage() {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { credits, loading, error, stats } = useSelector((state: RootState) => state.wallet);
  const { subscribe } = useWebSocket();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.organizationId) {
      if (credits.length === 0) {
        dispatch(fetchCredits(String(user.organizationId)));
      }

      // Real-time subscriptions
      subscribe('/topic/credits', (msg: any) => {
        toast({ title: "New Credit Issued", description: `Amount: ${msg.amount} tCO2e` });
        dispatch(fetchCredits(String(user.organizationId)));
      });

      subscribe('/topic/retirements', (msg: any) => {
        toast({ title: "Credit Retired", description: `Serial: ${msg.serialNumber}` });
        dispatch(fetchCredits(String(user.organizationId)));
      });

      subscribe('/topic/trades', (msg: any) => {
        toast({ title: "Trade Completed", description: `Credit traded successfully` });
        dispatch(fetchCredits(String(user.organizationId)));
      });
    }
  }, [dispatch, user?.organizationId, credits.length, subscribe, toast]);

  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filtered and sorted credits
  const filteredCredits = useMemo(() => {
    let result = [...credits];

    // Apply status filter
    if (filter === "active") {
      result = result.filter((c) => c.status === "ACTIVE");
    } else if (filter === "retired") {
      result = result.filter((c) => c.status === "RETIRED");
    }

    // Apply search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter((c) =>
        c.serialNumber.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting by issuanceDate
    result.sort((a, b) => {
      const dateA = new Date(a.issuanceDate).getTime();
      const dateB = new Date(b.issuanceDate).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [credits, filter, search, sortOrder]);

  const filterTabs: { value: FilterValue; label: string; count?: number }[] = [
    { value: "all", label: "All", count: credits.length },
    { value: "active", label: "Active", count: stats.creditsMinted > 0 ? credits.filter(c => c.status === "ACTIVE").length : 0 }, // fallback count logic or use stats if aligned
    { value: "retired", label: "Retired", count: stats.creditsRetired > 0 ? credits.filter(c => c.status === "RETIRED").length : 0 },
  ];

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  // Action handlers
  const handleSell = (credit: Credit) => {
    console.log("Sell credit:", credit.serialNumber);
  };

  const handleRetire = (credit: Credit) => {
    console.log("Retire credit:", credit.serialNumber);
  };

  const handleViewCertificate = (credit: Credit) => {
    console.log("View certificate:", credit.serialNumber);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <PageHeader
        title="Wallet"
        description="Manage your carbon credits portfolio"
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && credits.length === 0 ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <SummaryCard
              title="My Carbon Share"
              value={`${formatCarbonAmount(stats.totalCarbonShare)} tCO₂e`}
              subtitle="Total active credits"
              icon={Leaf}
            />
            <SummaryCard
              title="Active Credits"
              value={formatNumber(credits.filter(c => c.status === "ACTIVE").length)}
              subtitle="Available for trade"
              icon={Coins}
            />
            <SummaryCard
              title="Retired Credits"
              value={formatNumber(credits.filter(c => c.status === "RETIRED").length)}
              subtitle="Permanently offset"
              icon={Archive}
            />
          </>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs<FilterValue> tabs={filterTabs} activeTab={filter} onTabChange={setFilter} />
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by serial number..."
          className="w-full sm:w-72"
        />
      </div>

      {/* Credits Table */}
      {loading && credits.length === 0 ? (
        <SkeletonTable rows={5} columns={5} />
      ) : error ? (
        <ErrorState onRetry={() => dispatch(fetchCredits(String(user?.organizationId || "")))} />
      ) : filteredCredits.length === 0 ? (
        <EmptyState
          title={search ? "No matching credits" : "No credits found"}
          description={
            search
              ? "Try adjusting your search or filters."
              : "Your wallet is empty. Credits will appear here once issued."
          }
          action={
            search
              ? {
                label: "Clear search",
                onClick: () => setSearch(""),
              }
              : undefined
          }
        />
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Serial Number</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <button
                    onClick={toggleSort}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    Issuance Date
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCredits.map((credit) => (
                <TableRow key={credit.id}>
                  <TableCell className="font-mono text-sm">
                    {credit.serialNumber}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCarbonAmount(credit.amount)} tCO₂e
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant={getCreditStatusVariant(credit.status)}>
                      {credit.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(credit.issuanceDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    {credit.status === "ACTIVE" ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSell(credit)}
                        >
                          <DollarSign className="mr-1 h-3.5 w-3.5" />
                          Sell
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetire(credit)}
                        >
                          <XCircle className="mr-1 h-3.5 w-3.5" />
                          Retire
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCertificate(credit)}
                      >
                        <FileText className="mr-1 h-3.5 w-3.5" />
                        View Certificate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </motion.div>
  );
}
