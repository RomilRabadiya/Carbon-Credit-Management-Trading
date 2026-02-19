import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
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
import apiClient from "@/api/client";
import { toast } from "sonner";

export default function CompleteProfilePage() {
    const { user, checkSession } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState<string>("");
    const [orgName, setOrgName] = useState("");
    const [address, setAddress] = useState("");
    const [taxId, setTaxId] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) {
            toast.error("Please select a role");
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                role,
                additionalData: {
                    name: orgName, // For Org Service this might be mapped to 'name'
                    address,
                    taxId
                }
            };

            await apiClient.post("/users/complete-profile", payload);

            // Refresh session to get updated user with isProfileComplete=true
            await checkSession();

            toast.success("Profile completed successfully!");
            navigate("/dashboard");
        } catch (error) {
            console.error("Failed to complete profile", error);
            toast.error("Failed to complete profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Complete Your Profile
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Please provide a few more details to finish setting up your account.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="role">I am a...</Label>
                        <Select onValueChange={setRole} value={role}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USER">Individual Trader</SelectItem>
                                <SelectItem value="ORGANIZATION">Organization (Issuer/Buyer)</SelectItem>
                                <SelectItem value="VERIFIER">Verifier</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {role === "ORGANIZATION" && (
                        <div className="space-y-4 rounded-md border p-4">
                            <h3 className="text-sm font-medium">Organization Details</h3>
                            <div className="space-y-2">
                                <Label htmlFor="orgName">Organization Name</Label>
                                <Input
                                    id="orgName"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    placeholder="Acme Corp"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="123 Green St"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="taxId">Tax ID / Reg Number</Label>
                                <Input
                                    id="taxId"
                                    value={taxId}
                                    onChange={(e) => setTaxId(e.target.value)}
                                    placeholder="TAX-123456"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Complete Setup"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
