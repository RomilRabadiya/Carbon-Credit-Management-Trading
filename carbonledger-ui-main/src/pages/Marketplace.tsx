import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchListings } from "@/store/slices/marketSlice";
import { PageHeader } from "@/components/PageHeader";
import { SummaryCard } from "@/components/SummaryCard";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCarbonAmount } from "@/utils/format";
import { Store, TrendingUp, Clock, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { SkeletonCard } from "@/components/SkeletonTable";
import apiClient from "@/api/client";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthContext";

export default function MarketplacePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { listings, loading } = useSelector((state: RootState) => state.market);
  const { user } = useAuth();

  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (listings.length === 0) {
      dispatch(fetchListings());
    }
  }, [dispatch, listings.length]);

  const handleBuyClick = (listing: any) => {
    setSelectedListing(listing);
    setIsBuyDialogOpen(true);
  };

  const handleConfirmBuy = async () => {
    if (!selectedListing) return;

    setIsProcessing(true);
    try {
      await apiClient.post("/trading/buy", {
        listingId: selectedListing.id
      });
      toast.success("Carbon credits purchased successfully!");
      setIsBuyDialogOpen(false);
      dispatch(fetchListings()); // Refresh listings
    } catch (error) {
      console.error("Purchase failed", error);
      toast.error("Failed to purchase credits. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <PageHeader
        title="Marketplace"
        description="Browse and purchase verified carbon credits"
      />

      {/* Market Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          title="Available Credits"
          value={`${formatCarbonAmount(listings.reduce((sum, l) => sum + l.amount, 0))} tCO₂e`}
          subtitle={`Across ${listings.length} listings`}
          icon={Store}
        />
        <SummaryCard
          title="Average Price"
          value={`$${(listings.length > 0 ? listings.reduce((sum, l) => sum + l.pricePerUnit, 0) / listings.length : 0).toFixed(2)}`}
          subtitle="Per tCO₂e"
          icon={TrendingUp}
        />
        <SummaryCard
          title="Last Trade"
          value="2 hours ago"
          subtitle="45 tCO₂e @ $46.00"
          icon={Clock}
        />
      </div>

      {/* Listings */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Active Listings
        </h2>
        {loading && listings.length === 0 ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                key={listing.id}
                className="rounded-lg border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{listing.sellerName}</p>
                      <StatusBadge variant="active">{listing.projectType}</StatusBadge>
                    </div>
                    <p className="font-mono text-sm text-muted-foreground">
                      Credit #{listing.creditId} • {listing.location} ({listing.vintage})
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-foreground">
                        {formatCarbonAmount(listing.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">tCO₂e available</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-primary">
                        ${listing.pricePerUnit.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">per tCO₂e</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        onClick={() => handleBuyClick(listing)}
                        disabled={user?.role !== 'ORGANIZATION'} // Only orgs can buy for now (or improve role check)
                        title={user?.role !== 'ORGANIZATION' ? "Only Organizations can buy" : "Purchase Credits"}
                      >
                        Buy Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      {user?.role !== 'ORGANIZATION' && (
                        <span className="text-xs text-muted-foreground">Org Account Required</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Buy Dialog */}
      <Dialog open={isBuyDialogOpen} onOpenChange={setIsBuyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              You are about to purchase carbon credits. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedListing && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="font-medium">Seller:</span>
                <span>{selectedListing.sellerName}</span>

                <span className="font-medium">Amount:</span>
                <span>{formatCarbonAmount(selectedListing.amount)} tCO₂e</span>

                <span className="font-medium">Price per Credit:</span>
                <span>${selectedListing.pricePerUnit.toFixed(2)}</span>

                <span className="font-medium text-lg pt-2">Total Cost:</span>
                <span className="font-bold text-lg pt-2 text-primary">
                  ${(selectedListing.amount * selectedListing.pricePerUnit).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBuyDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBuy} disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}
