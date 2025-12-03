import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCurrentUser, useMyProfile, useMyWalls, useUpdateWall } from "@/lib/api-hooks";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Eye, Settings, Sparkles, Zap, Award, Globe, Lock, CheckCircle2 } from "lucide-react";
import RatingStars from "@/components/RatingStars";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();

  // React Query hooks
  const { data: currentUserData, isLoading: userLoading } = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: walls = [], isLoading: wallsLoading } = useMyWalls();
  const { mutateAsync: updateWall, isPending: isUpdatingWall } = useUpdateWall();

  console.log("Walls", walls);
  console.log("Profile", profile);

  const user = (currentUserData as { user?: { roles?: string[] } })?.user;
  const loading = userLoading || profileLoading || wallsLoading;

  useEffect(() => {
    const hasToken = !!localStorage.getItem("token");
    if (!userLoading && !currentUserData && !hasToken) {
      navigate("/auth");
    }
  }, [userLoading, currentUserData, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isPending = profile?.verification_status === "pending";
  const isRejected = profile?.verification_status === "rejected";

  return (
    <div className="min-h-screen">
      <Navbar user={user} profile={profile} />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold red-glow-intense mb-2">
                Welcome, {profile?.name}
              </h1>
              <p className="text-muted-foreground">
                Email: <span className="text-primary">{profile?.email}</span>
              </p>
              {profile?.rating && (
                <div className="mt-2">
                  <RatingStars rating={profile.rating} showBadge />
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {user?.roles?.includes('studio') || user?.roles?.includes('admin') ? (
                <Button onClick={() => navigate("/jobs/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post VFX Job
                </Button>
              ) : null}
              <Button variant="outline" onClick={() => navigate("/profile/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Verification Status */}
          {(isPending || isRejected) && (
            <Card
              className={`p-6 border-2 ${
                isRejected ? "border-destructive" : "border-yellow-500"
              }`}
            >
              <h3 className="font-semibold text-lg mb-2">
                {isPending ? "Verification Pending" : "Verification Rejected"}
              </h3>
              <p className="text-muted-foreground">
                {isPending
                  ? "Your account is awaiting admin verification. You'll be able to create walls once approved."
                  : "Your verification was rejected. Please contact support for more information."}
              </p>
            </Card>
          )}

          {/* Walls Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your Walls</h2>
              {profile?.verification_status === "approved" && (
                <Button onClick={() => navigate("/wall/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Wall
                </Button>
              )}
            </div>

            {walls.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <p className="text-muted-foreground mb-4">
                  You haven't created any walls yet
                </p>
                {profile?.verification_status === "approved" && (
                  <Button onClick={() => navigate("/wall/create")}>
                    Create Your First Wall
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {walls.map((wall, index) => (
                  <WallCard
                    key={wall._id}
                    wall={wall}
                    index={index}
                    profileRating={profile?.rating}
                    onClick={() => {
                      console.log("Navigating to wall:", wall._id);
                      navigate(`/wall/${wall._id}`);
                    }}
                    onPublishToggle={async (wallId: string, currentStatus: boolean) => {
                      try {
                        await updateWall({
                          id: wallId,
                          data: { published: !currentStatus }
                        });
                        toast.success(
                          !currentStatus 
                            ? "Wall published successfully!" 
                            : "Wall unpublished successfully!"
                        );
                        // The query will automatically refetch due to React Query invalidation
                      } catch (error: unknown) {
                        const errorMessage = error instanceof Error 
                          ? error.message 
                          : (error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to update publish status";
                        toast.error(errorMessage);
                        console.error("Failed to update publish status:", error);
                      }
                    }}
                    isUpdating={isUpdatingWall}
                  />
                ))}
              </div>
            )}
          </div>

          {/* VFX Jobs Section */}
          {(user?.roles?.includes('studio') || user?.roles?.includes('admin') || user?.roles?.includes('artist')) && (
            <div>
              <h2 className="text-2xl font-bold mb-6">VFX Jobs</h2>
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => navigate("/jobs")}
                    className="flex-1"
                    size="lg"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Browse Jobs
                  </Button>
                  <Button
                    onClick={() => navigate("/studio/jobs")}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    My Jobs & Bids
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm mt-4">
                  {user?.roles?.includes('studio') || user?.roles?.includes('admin')
                    ? "Post VFX jobs and manage your projects"
                    : "Browse available VFX jobs and submit bids"
                  }
                </p>
              </Card>
            </div>
          )}

          {/* Admin Section */}
          {user?.roles?.includes("admin") && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
              <div className="flex gap-4">
                <Button
                  onClick={() => navigate("/admin/verifications")}
                  size="lg"
                >
                  Approve Studios
                </Button>
                <Button
                  onClick={() => navigate("/admin/verifications")}
                  variant="outline"
                  size="lg"
                >
                  Manage All Users
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Wall type definition
interface Wall {
  _id: string;
  title: string;
  description?: string;
  logo_url?: string;
  view_count?: number;
  rating?: number;
  updatedAt?: string;
  published?: boolean;
}

// Redesigned WallCard with red and black theme
const WallCard = ({ 
  wall, 
  index, 
  profileRating, 
  onClick,
  onPublishToggle,
  isUpdating
}: { 
  wall: Wall; 
  index: number; 
  profileRating?: number; 
  onClick: () => void;
  onPublishToggle?: (wallId: string, currentStatus: boolean) => void;
  isUpdating?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Get rating from wall.rating (added by server) or fallback to profileRating
  const rating = wall?.rating || profileRating;

  const handleClick = () => {
    if (wall?._id) {
      onClick();
    } else {
      console.error("Wall ID is missing:", wall);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <Card className="relative overflow-hidden border-2 border-gray-800 bg-black group-hover:border-red-600 transition-all duration-300">
        
        {/* Red accent bar */}
        <div className="h-1 bg-red-600 w-full" />
        
        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              {wall.logo_url ? (
                <img
                  src={wall.logo_url}
                  alt={wall.title || "Studio logo"}
                  className="w-12 h-12 rounded-lg object-cover border-2 border-red-600/50"
                />
              ) : (
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {/* Published Status Badge */}
                <Badge 
                  variant={wall.published ? "default" : "secondary"}
                  className={`${
                    wall.published 
                      ? "bg-green-600 hover:bg-green-700 text-white border-green-500" 
                      : "bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600"
                  } border`}
                >
                  {wall.published ? (
                    <>
                      <Globe className="h-3 w-3 mr-1" />
                      Published
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Draft
                    </>
                  )}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Eye className="h-4 w-4" />
              <span>{wall.view_count || 0}</span>
            </div>
          </div>

          {/* Title and Description */}
          <div className="mb-4">
            <h3 className="font-bold text-xl text-white mb-2 group-hover:text-red-600 transition-colors">
              {wall.title || "Untitled Wall"}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2">
              {wall.description || "No description available"}
            </p>
          </div>

          {/* Rating - Show studio rating */}
          {rating && (
            <div className="flex items-center gap-2 mb-4">
              <RatingStars rating={rating} showBadge={false} />
              <span className="text-sm text-gray-400">({rating}/5)</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <span className="text-sm text-gray-400">
              {wall.updatedAt ? new Date(wall.updatedAt).toLocaleDateString() : "Recently updated"}
            </span>
            <div className="flex items-center gap-2">
              {onPublishToggle && (
                <Button
                  size="sm"
                  variant="ghost"
                  className={`h-8 px-2 text-xs ${
                    wall.published 
                      ? "text-green-400 hover:text-green-300 hover:bg-green-600/10" 
                      : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPublishToggle(wall._id, wall.published || false);
                  }}
                  disabled={isUpdating}
                  title={wall.published ? "Click to unpublish" : "Click to publish"}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Updating...
                    </>
                  ) : wall.published ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Published
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Draft
                    </>
                  )}
                </Button>
              )}
              <motion.div
                animate={{ x: isHovered ? 4 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                  <Zap className="h-3 w-3 text-white" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>
    </motion.div>
  );
};

export default Dashboard;