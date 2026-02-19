import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { submitReport, resetEmissionState } from "@/store/slices/emissionSlice";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthContext";
import { LocationPicker } from "./LocationPicker";

interface CreateProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useAuth();
    const { loading } = useSelector((state: RootState) => state.emissions);

    const [formData, setFormData] = useState({
        projectId: "",
        projectType: "REFORESTATION",
        location: "", // Lat,Lon string or generic
        latitude: "",
        longitude: "",
        area_hectares: "",
        methane_volume_m3: "",
        evidenceUrl: "https://example.com/evidence.pdf", // Default for demo
    });

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!user?.organizationId) return;

        // Prepare data map based on type
        const data: Record<string, any> = {};
        if (formData.projectType === "REFORESTATION") {
            data["area_hectares"] = Number(formData.area_hectares);
        } else if (formData.projectType === "METHANE_CAPTURE") {
            data["volume_m3"] = Number(formData.methane_volume_m3);
        }

        try {
            await dispatch(submitReport({
                projectId: Number(formData.projectId) || Math.floor(Math.random() * 10000), // Auto-gen if empty
                organizationId: Number(user.organizationId),
                projectType: formData.projectType,
                data: data,
                evidenceUrl: formData.evidenceUrl,
                latitude: Number(formData.latitude) || 0,
                longitude: Number(formData.longitude) || 0,
            })).unwrap();

            toast.success("Project submitted successfully for verification!");
            onOpenChange(false);
            dispatch(resetEmissionState());
        } catch (error: any) {
            toast.error(error.message || "Failed to submit project");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Submit New Project</DialogTitle>
                    <DialogDescription>
                        Register a new carbon offset project for verification.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="projectId">Project ID (Optional)</Label>
                        <Input
                            id="projectId"
                            placeholder="Auto-generated if empty"
                            value={formData.projectId}
                            onChange={(e) => handleChange("projectId", e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="type">Project Type</Label>
                        <Select
                            value={formData.projectType}
                            onValueChange={(val) => handleChange("projectType", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="REFORESTATION">Reforestation</SelectItem>
                                <SelectItem value="METHANE_CAPTURE">Methane Capture</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Project Location</Label>
                        <LocationPicker
                            value={
                                formData.latitude && formData.longitude
                                    ? {
                                        lat: Number(formData.latitude),
                                        lng: Number(formData.longitude),
                                    }
                                    : null
                            }
                            onChange={(lat, lng) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    latitude: lat.toString(),
                                    longitude: lng.toString(),
                                }));
                            }}
                        />
                    </div>

                    {formData.projectType === "REFORESTATION" && (
                        <div className="grid gap-2">
                            <Label htmlFor="area">Area (Hectares)</Label>
                            <Input
                                id="area"
                                type="number"
                                placeholder="e.g. 50"
                                value={formData.area_hectares}
                                onChange={(e) => handleChange("area_hectares", e.target.value)}
                            />
                        </div>
                    )}

                    {formData.projectType === "METHANE_CAPTURE" && (
                        <div className="grid gap-2">
                            <Label htmlFor="volume">Volume (m³)</Label>
                            <Input
                                id="volume"
                                type="number"
                                placeholder="e.g. 1000"
                                value={formData.methane_volume_m3}
                                onChange={(e) => handleChange("methane_volume_m3", e.target.value)}
                            />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="evidence">Evidence URL</Label>
                        <Input
                            id="evidence"
                            placeholder="https://..."
                            value={formData.evidenceUrl}
                            onChange={(e) => handleChange("evidenceUrl", e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Project
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
