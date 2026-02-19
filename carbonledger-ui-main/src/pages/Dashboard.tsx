import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useWebSocket } from "@/context/WebSocketContext";
import { useToast } from "@/components/ui/use-toast";
import { RootState, AppDispatch } from "@/store";
import { fetchCredits } from "@/store/slices/walletSlice";
import { PageHeader } from "@/components/PageHeader";
import { SummaryCard } from "@/components/SummaryCard";
import { useAuth } from "@/auth/AuthContext";
import { useActivity, mapAuditToActivity } from "@/api/activity";
import { SkeletonCard } from "@/components/SkeletonTable";
import { formatCarbonAmount, formatNumber, formatRelativeTime } from "@/utils/format";
import {
  Leaf,
  Coins,
  Archive,
  ArrowRightLeft,
  TrendingUp,
} from "lucide-react";
import type { Activity } from "@/types";
import { motion } from "framer-motion";

const activityIcons: Record<string, React.ElementType> = {
  mint: Coins,
  transfer: ArrowRightLeft,
  retire: Archive,
  sale: TrendingUp,
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

export default function DashboardPage() {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const { stats, loading } = useSelector((state: RootState) => state.wallet);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch real activity
  const { data: rawActivity, isLoading: isLoadingActivity } = useActivity(String(user?.organizationId || ""));
  const activity = rawActivity?.map(mapAuditToActivity) || [];

  const { subscribe } = useWebSocket();
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to general emissions topic
    subscribe('/topic/emissions', (message: any) => {
      console.log('Received emission update:', message);
      toast({
        title: "New Emission Reported",
        description: `Project: ${message.projectName} - Amount: ${message.amount} tCO2e`,
      });
      // Refresh data
      if (user?.organizationId) {
        dispatch(fetchCredits(String(user.organizationId)));
        queryClient.invalidateQueries({ queryKey: ["activity", String(user.organizationId)] });
      }
    });

    // Subscribe to verifications
    subscribe('/topic/verifications', (message: any) => {
      console.log('Received verification update:', message);
      toast({
        title: "Emission Verified",
        description: `Emission ID: ${message.emissionId} has been verified.`,
      });
      if (user?.organizationId) {
        dispatch(fetchCredits(String(user.organizationId)));
        queryClient.invalidateQueries({ queryKey: ["activity", String(user.organizationId)] });
      }
    });

    // Subscribe to credit retirements
    subscribe('/topic/retirements', (message: any) => {
      console.log('Received retirement update:', message);
      toast({
        title: "Credit Retired",
        description: `Credit ID: ${message.creditId} - Amount: ${message.amount} has been retired.`,
      });
      if (user?.organizationId) {
        dispatch(fetchCredits(String(user.organizationId)));
        queryClient.invalidateQueries({ queryKey: ["activity", String(user.organizationId)] });
      }
    });

    // Subscribe to trades
    subscribe('/topic/trades', (message: any) => {
      console.log('Received trade update:', message);
      toast({
        title: "Trade Completed",
        description: `Trade for Credit ID: ${message.creditId} completed.`,
      });
      if (user?.organizationId) {
        dispatch(fetchCredits(String(user.organizationId)));
        queryClient.invalidateQueries({ queryKey: ["activity", String(user.organizationId)] });
      }
    });

  }, [subscribe, toast, dispatch, user?.organizationId]);

  useEffect(() => {
    if (user?.organizationId) {
      dispatch(fetchCredits(String(user.organizationId)));
    }
  }, [dispatch, user?.organizationId]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <PageHeader
          title="Dashboard"
          description={`Welcome back, ${user?.name || "User"}. Here's your carbon portfolio overview.`}
        />
        {(user?.role === "ORGANIZATION" || user?.role === "USER") && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Submit Project
          </Button>
        )}
      </div>

      <CreateProjectDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <motion.div variants={item}>
              <SummaryCard
                title="Total Carbon Share"
                value={`${formatCarbonAmount(stats.totalCarbonShare)} tCO₂e`}
                subtitle="Active credits only"
                icon={Leaf}
              />
            </motion.div>
            <motion.div variants={item}>
              <SummaryCard
                title="Credits Minted"
                value={formatNumber(stats.creditsMinted)}
                subtitle="Lifetime total"
                icon={Coins}
              />
            </motion.div>
            <motion.div variants={item}>
              <SummaryCard
                title="Credits Retired"
                value={formatNumber(stats.creditsRetired)}
                subtitle="Offset applied"
                icon={Archive}
              />
            </motion.div>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <motion.div variants={item}>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Activity</h2>
        <div className="rounded-lg border border-border bg-card">
          {isLoadingActivity ? (
            <div className="p-4 text-center text-muted-foreground">Loading activity...</div>
          ) : activity.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No recent activity found.</div>
          ) : (
            activity.map((item, index) => {
              const Icon = activityIcons[item.type] || Coins;
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 ${index !== activity.length - 1 ? "border-b border-border" : ""
                    }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
                    <Icon className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {item.type === "retire" || item.type === "sale" ? "-" : "+"}
                      {formatCarbonAmount(item.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">tCO₂e</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
