import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCurrentUser, useMyProfile, usePendingProfiles, useVerifyProfile, useApprovedProfiles } from "@/lib/api-hooks";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Check, X, MapPin, Link as LinkIcon } from "lucide-react";
import RatingStars from "@/components/RatingStars";

const AdminVerifications = () => {
  const [selectedRatings, setSelectedRatings] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<"pending" | "approved">("pending");
  const navigate = useNavigate();

  // React Query hooks
  const { data: currentUserData } = useCurrentUser();
  const { data: profile } = useMyProfile();
  const { data: pendingUsers = [], isLoading: loadingPending, refetch } = usePendingProfiles();
  const { data: approvedUsers = [], isLoading: loadingApproved } = useApprovedProfiles();
  const verifyMutation = useVerifyProfile();

  const user = (currentUserData as { user?: { roles?: string[] } } | undefined)?.user;
  const loading = loadingPending || loadingApproved;

  // Debug: Log approved users to see if rating is included
  useEffect(() => {
    if (approvedUsers.length > 0) {
      console.log("Approved users with ratings:", approvedUsers.map((u: any) => ({
        name: u.name,
        rating: u.rating,
        verification_status: u.verification_status
      })));
    }
  }, [approvedUsers]);

  useEffect(() => {
    const hasToken = !!localStorage.getItem('token');
    if (hasToken && !loading && !currentUserData) {
      navigate("/auth");
    } else if (!hasToken && !loading) {
      navigate("/auth");
    } else if (currentUserData && user && !user?.roles?.includes('admin')) {
      navigate("/dashboard");
    }
  }, [currentUserData, user, loading, navigate]);

  const handleVerification = async (userId: string, status: "approved" | "rejected", rating?: number) => {
    try {
      await verifyMutation.mutateAsync({ id: userId, verification_status: status, rating });
      toast.success(`Profile ${status}${rating ? ` with ${rating} star rating` : ""}`);
      refetch();
    } catch (err: any) {
      console.error("Error verifying profile:", err);
      toast.error(err.message || "An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} profile={profile} />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold red-glow-intense mb-2">
                  Studio Approvals
                </h1>
                <p className="text-muted-foreground">
                  Review and manage studio registrations
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "pending" ? "default" : "outline"}
                  onClick={() => setViewMode("pending")}
                >
                  Pending ({pendingUsers.length})
                </Button>
                <Button
                  variant={viewMode === "approved" ? "default" : "outline"}
                  onClick={() => setViewMode("approved")}
                >
                  Approved ({approvedUsers.length})
                </Button>
              </div>
            </div>
          </div>

          {viewMode === "pending" ? (
            pendingUsers.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <p className="text-muted-foreground">
                  No pending verifications at this time
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {pendingUsers.map((pendingUser) => (
                <Card key={pendingUser._id} className="p-6 border-red-glow">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-1">{pendingUser.name}</h3>
                        <p className="text-muted-foreground">{pendingUser.email}</p>
                      </div>

                      {pendingUser.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {pendingUser.location}
                        </div>
                      )}

                      {pendingUser.bio && (
                        <div>
                          <h4 className="font-semibold mb-1">Bio</h4>
                          <p className="text-sm text-muted-foreground">{pendingUser.bio}</p>
                        </div>
                      )}

                      {pendingUser.associations && pendingUser.associations.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Associations</h4>
                          <div className="flex flex-wrap gap-2">
                            {pendingUser.associations.map((assoc: string, i: number) => (
                              <span key={i} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                                {assoc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-sm text-muted-foreground">
                        Registered: {new Date(pendingUser.createdAt || pendingUser.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Assign Rating</h4>
                        <Select
                          value={selectedRatings[pendingUser._id] || ""}
                          onValueChange={async (value) => {
                            const rating = parseInt(value);
                            await handleVerification(pendingUser._id, "approved", rating);
                            // Clear the selection after approval
                            setSelectedRatings(prev => ({ ...prev, [pendingUser._id]: "" }));
                          }}
                          disabled={verifyMutation.isPending}
                        >
                          <SelectTrigger className="border-border" disabled={verifyMutation.isPending}>
                            <SelectValue placeholder={verifyMutation.isPending ? "Processing..." : "Select rating and approve"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">
                              <div className="flex items-center gap-2">
                                <RatingStars rating={5} />
                                <span className="text-xs">- Global Elite</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="4">
                              <div className="flex items-center gap-2">
                                <RatingStars rating={4} />
                                <span className="text-xs">- Premier</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="3">
                              <div className="flex items-center gap-2">
                                <RatingStars rating={3} />
                                <span className="text-xs">- Verified</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="2">
                              <div className="flex items-center gap-2">
                                <RatingStars rating={2} />
                                <span className="text-xs">- Approved</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="1">
                              <div className="flex items-center gap-2">
                                <RatingStars rating={1} />
                                <span className="text-xs">- Entry Level</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleVerification(pendingUser._id, "rejected")}
                        disabled={verifyMutation.isPending}
                      >
                        {verifyMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Reject Application
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              </div>
            )
          ) : (
            <div className="space-y-6">
              {approvedUsers.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                  <p className="text-muted-foreground">
                    No approved studios yet
                  </p>
                </Card>
              ) : (
                <>
                  {approvedUsers.map((approvedUser: any) => (
                    <Card key={approvedUser._id} className="p-6 border-green-500">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-2xl font-bold mb-1">{approvedUser.name}</h3>
                              <p className="text-muted-foreground">{approvedUser.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                                Approved
                              </span>
                              {approvedUser.rating ? (
                                <RatingStars rating={approvedUser.rating} showBadge />
                              ) : (
                                <span className="text-xs text-muted-foreground">No rating</span>
                              )}
                            </div>
                          </div>

                          {approvedUser.location && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {approvedUser.location}
                            </div>
                          )}

                          {approvedUser.bio && (
                            <div>
                              <h4 className="font-semibold mb-1">Bio</h4>
                              <p className="text-sm text-muted-foreground">{approvedUser.bio}</p>
                            </div>
                          )}

                          {approvedUser.associations && approvedUser.associations.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Associations</h4>
                              <div className="flex flex-wrap gap-2">
                                {approvedUser.associations.map((assoc: string, i: number) => (
                                  <span key={i} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                                    {assoc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="text-sm text-muted-foreground">
                            Approved: {approvedUser.updatedAt ? new Date(approvedUser.updatedAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold">Rating:</span>
                              {approvedUser.rating ? (
                                <div className="flex items-center gap-2">
                                  <RatingStars rating={approvedUser.rating} showBadge={false} />
                                  <span className="text-sm text-foreground font-bold">
                                    {approvedUser.rating}/5
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">Not rated</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Status: {approvedUser.verification_status}
                            </p>
                            {approvedUser.rating && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {approvedUser.rating === 5 && "Global Elite Studio"}
                                {approvedUser.rating === 4 && "Premier Studio"}
                                {approvedUser.rating === 3 && "Verified Studio"}
                                {approvedUser.rating === 2 && "Approved Studio"}
                                {approvedUser.rating === 1 && "Entry Level Studio"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminVerifications;
