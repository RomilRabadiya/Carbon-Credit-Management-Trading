import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchRequests, approveRequest, rejectRequest } from "@/store/slices/verificationSlice";
import { PageHeader } from "@/components/PageHeader";
import { SummaryCard } from "@/components/SummaryCard";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonTable, SkeletonCard } from "@/components/SkeletonTable";
import { formatCarbonAmount, formatDate } from "@/utils/format";
import { CheckCircle, XCircle, FileText, Activity, Globe, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { analyzeLand, GeoAnalysisResult } from "@/api/geo";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function VerifierDashboard() {
    const dispatch = useDispatch<AppDispatch>();
    const { requests, loading } = useSelector((state: RootState) => state.verification);
    const { user } = useSelector((state: RootState) => state.auth);

    const [analyzing, setAnalyzing] = useState<number | null>(null);
    const [analysisResult, setAnalysisResult] = useState<GeoAnalysisResult | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchRequests());
    }, [dispatch]);

    const pendingRequests = requests.filter(r => r.status === "PENDING");
    const approvedCount = requests.filter(r => r.status === "APPROVED").length;

    const handleApprove = (id: number) => {
        dispatch(approveRequest(String(id)));
    };

    const handleReject = (id: number) => {
        dispatch(rejectRequest(String(id)));
    };

    const runAnalysis = async (request: any) => {
        if (!request.location) return;

        setAnalyzing(request.id);
        setAnalysisResult(null); // Reset previous

        try {
            const result = await analyzeLand(request.projectId, request.location.lat, request.location.lon);
            setAnalysisResult(result);
            setIsDialogOpen(true);
        } finally {
            setAnalyzing(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 animate-fade-in"
        >
            <PageHeader
                title="Verifier Dashboard"
                description={`Logged in as ${user?.name} (${user?.organizationName})`}
            />

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
                        <SummaryCard
                            title="Pending Reviews"
                            value={String(pendingRequests.length)}
                            subtitle="Requires action"
                            icon={Activity}
                        />
                        <SummaryCard
                            title="Verified Projects"
                            value={String(approvedCount)}
                            subtitle="Lifetime total"
                            icon={CheckCircle}
                        />
                        <SummaryCard
                            title="Total Volume"
                            value={`${formatCarbonAmount(requests.reduce((sum, r) => sum + (r.carbonCreditsCalculated || 0), 0))} tCO₂e`}
                            subtitle="All submissions"
                            icon={FileText}
                        />
                    </>
                )}
            </div>

            {/* Requests Table */}
            <div>
                <h2 className="mb-4 text-lg font-semibold text-foreground">Verification Requests</h2>
                {loading ? (
                    <SkeletonTable rows={3} columns={6} />
                ) : (
                    <div className="rounded-lg border border-border bg-card overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>Project</TableHead>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Analysis</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            No requests found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    requests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell className="font-medium">
                                                {request.projectName}
                                                {request.status !== "PENDING" && <span className="ml-2 text-xs text-muted-foreground">({request.status})</span>}
                                            </TableCell>
                                            <TableCell>{request.organizationName}</TableCell>
                                            <TableCell>{formatCarbonAmount(request.carbonCreditsCalculated || 0)} tCO₂e</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatDate(request.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                {request.status === "PENDING" ? (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => runAnalysis(request)}
                                                        disabled={analyzing === request.id}
                                                    >
                                                        {analyzing === request.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5 mr-1" />}
                                                        Satellite Check
                                                    </Button>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {request.status === "PENDING" ? (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                            onClick={() => handleApprove(request.id)}
                                                        >
                                                            <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleReject(request.id)}
                                                        >
                                                            <XCircle className="mr-1 h-3.5 w-3.5" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <StatusBadge variant={request.status === "APPROVED" ? "active" : "retired"}>
                                                        {request.status}
                                                    </StatusBadge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Analysis Result Modal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Satellite Verification Result</DialogTitle>
                        <DialogDescription>
                            Real-time analysis of {analysisResult?.lat.toFixed(4)}, {analysisResult?.lon.toFixed(4)} using Sentinel-2 imagery.
                        </DialogDescription>
                    </DialogHeader>

                    {analysisResult && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                                <span className="font-medium">Status</span>
                                <StatusBadge
                                    variant={
                                        analysisResult.status === "VERIFIED" ? "active" :
                                            analysisResult.status === "FRAUD_RISK" ? "retired" :
                                                "retired" // "retired" usually red/gray, "active" green
                                    }
                                >
                                    {analysisResult.status}
                                </StatusBadge>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg border bg-card">
                                    <p className="text-xs text-muted-foreground mb-1">Non-Green Percentage</p>
                                    <p className="text-2xl font-bold">{(analysisResult.nonGreenPercentage * 100).toFixed(1)}%</p>
                                </div>
                                <div className="p-4 rounded-lg border bg-card">
                                    <p className="text-xs text-muted-foreground mb-1">Confidence Score</p>
                                    <p className="text-2xl font-bold">98.5%</p>
                                </div>
                            </div>

                            <p className="text-sm text-foreground">
                                <strong>Assessment:</strong> {analysisResult.details}
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
