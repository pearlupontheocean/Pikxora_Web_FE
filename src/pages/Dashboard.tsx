import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCurrentUser, useMyProfile, useMyWalls, useUpdateWall, useMyAssociations, useSendAssociationRequest, usePendingAssociations } from "@/lib/api-hooks";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Profile } from "@/types/jobs";
import { DiscoverCreatorsList } from "@/components/DiscoverCreatorsList";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Plus, Eye, Settings, Sparkles, Zap, Award, Globe, Lock, CheckCircle2, Users, ExternalLink } from "lucide-react";
import RatingStars from "@/components/RatingStars";
import { toast } from "sonner";
import IndustryAssociationsSection from "@/components/IndustryAssociationsSection";

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
                  className={`${wall.published
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
                  className={`h-8 px-2 text-xs ${wall.published
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

const Dashboard = () => {
  const navigate = useNavigate();

  // React Query hooks
  const { data: currentUserData, isLoading: userLoading } = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: walls = [], isLoading: wallsLoading } = useMyWalls();
  const { mutateAsync: updateWall, isPending: isUpdatingWall } = useUpdateWall();
  const { data: pendingAssociations, isLoading: isLoadingPendingAssociations } = usePendingAssociations();

  console.log("Walls", walls);
  console.log("Profile", profile);

  const user = currentUserData?.user;
  const loading = userLoading || profileLoading || wallsLoading || isLoadingPendingAssociations;

  // Check if the current user is a verified artist or studio
  const isArtistOrStudio = user?.roles?.includes('artist') || user?.roles?.includes('studio');
  const hasWall = walls.length > 0;

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
  const pendingRequestsCount = pendingAssociations?.length || 0;

  return (
    <div className="min-h-screen">
      <Navbar user={user} profile={profile} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-3xl sm:text-4xl font-bold red-glow-intense mb-2">
                Welcome, {profile?.name}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Email: <span className="text-primary break-all">{profile?.email}</span>
              </p>
              {profile?.rating && (
                <div className="mt-2">
                  <RatingStars rating={profile.rating} showBadge />
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              {user?.roles?.includes('studio') || user?.roles?.includes('admin') ? (
                <Button onClick={() => navigate("/jobs/create")} className="flex-1 sm:flex-none">
                  <Plus className="h-4 w-4 mr-2" />
                  Post VFX project
                </Button>
              ) : null}
              <Button variant="outline" onClick={() => navigate("/profile/settings")} className="flex-1 sm:flex-none">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Pending Association Request Alert */}
          {pendingRequestsCount > 0 && (
            <Alert className="bg-yellow-900 border-yellow-700 text-yellow-100">
              <AlertTitle className="text-sm sm:text-base">You have {pendingRequestsCount} pending association request(s)!</AlertTitle>
              <AlertDescription className="text-sm">
                Review them on the <a onClick={() => navigate("/associations")} className="underline cursor-pointer font-medium">Associations Page</a>.
              </AlertDescription>
            </Alert>
          )}

          {/* Verification Status */}
          {(isPending || isRejected) && (
            <Card
              className={`p-4 sm:p-6 border-2 ${isRejected ? "border-destructive" : "border-yellow-500"}`}
            >
              <h3 className="font-semibold text-base sm:text-lg mb-2">
                {isPending ? "Verification Pending" : "Verification Rejected"}
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                {isPending
                  ? "Your account is awaiting admin verification. You'll be able to create walls once approved."
                  : "Your verification was rejected. Please contact support for more information."}
              </p>
            </Card>
          )}

          {/* Walls Section */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Your Walls</h2>
              {profile?.verification_status === "approved" && !hasWall && (
                <Button onClick={() => navigate("/wall/create")} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Wall
                </Button>
              )}
            </div>

            {walls.length === 0 && profile?.verification_status === "approved" ? (
              <Card className="p-8 sm:p-12 text-center border-dashed">
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  You haven't created any walls yet
                </p>
                {!hasWall && (
                  <Button onClick={() => navigate("/wall/create")} className="w-full sm:w-auto">
                    Create Your First Wall
                  </Button>
                )}
              </Card>
            ) : walls.length === 0 && profile?.verification_status !== "approved" ? (
              <Card className="p-8 sm:p-12 text-center border-dashed">
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  You cannot create a wall until your profile is approved.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

          {/* Associations Section - Updated for Responsiveness */}
          {(user?.roles?.includes('artist') || user?.roles?.includes('studio')) && (
            <div className="w-full">
              <AssociationsSummaryCard currentUserId={user?.id} pendingRequestsCount={pendingRequestsCount} />
            </div>
          )}

          {/* Industry Associations Section */}
          <IndustryAssociationsSection />

          {/* Discover Creators Section - Updated for Responsiveness */}
          <div className="w-full">
            <DiscoverCreatorsList
              isArtistOrStudio={isArtistOrStudio}
              currentUserId={user?.id}
            />
          </div>

          {/* VFX Jobs Section */}
          {(user?.roles?.includes('studio') || user?.roles?.includes('admin') || user?.roles?.includes('artist')) && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-6">VFX projects</h2>
              <Card className="p-4 sm:p-6">
                <div className="flex flex-col gap-4">
                  <Button
                    onClick={() => navigate("/jobs")}
                    className="w-full"
                    size="lg"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Browse Projects
                  </Button>
                  <Button
                    onClick={() => navigate("/studio/jobs")}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    My Projects & Bids
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm mt-6">
                  {user?.roles?.includes('studio') || user?.roles?.includes('admin')
                    ? "Post VFX Projects and manage your projects"
                    : "Browse available VFX projects and submit bids"
                  }
                </p>
              </Card>
            </div>
          )}

          {/* Admin Section */}
          {user?.roles?.includes("admin") && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-6">Admin Panel</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate("/admin/verifications")}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Approve Studios
                </Button>
                <Button
                  onClick={() => navigate("/admin/verifications")}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
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

// Associations Summary Card Component - Updated for Professional Look
interface AssociationsSummaryCardProps {
  currentUserId: string | undefined;
  pendingRequestsCount: number;
}

const AssociationsSummaryCard: React.FC<AssociationsSummaryCardProps> = ({ currentUserId, pendingRequestsCount }) => {
  const navigate = useNavigate();
  const { data: myAssociations, isLoading: isLoadingMyAssociations, error: myAssociationsError } = useMyAssociations();

  if (isLoadingMyAssociations) {
    return (
      <Card className="relative overflow-hidden border-2 border-gray-800 bg-black">
        <div className="h-1 bg-red-600 w-full" />
        <div className="p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          </div>
          <div className="h-4 bg-gray-700 rounded w-2/3 mb-6"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-gray-900/50">
                <div className="h-16 w-16 rounded-full bg-gray-700"></div>
                <div className="h-4 bg-gray-700 rounded w-20"></div>
                <div className="h-3 bg-gray-600 rounded w-16"></div>
              </div>
            ))}
          </div>
          <div className="h-12 bg-gray-700 rounded w-full"></div>
        </div>
      </Card>
    );
  }

  if (myAssociationsError) {
    return (
      <Card className="relative overflow-hidden border-2 border-red-900 bg-black">
        <div className="h-1 bg-red-600 w-full" />
        <div className="p-6 text-red-500">
          <p className="text-sm sm:text-base">Error loading associations: {myAssociationsError.message}</p>
        </div>
      </Card>
    );
  }

  const connectedCount = myAssociations?.length || 0;
  const sortedAssociations = myAssociations?.sort((a, b) => {
    const dateA = a.requester._id === currentUserId
      ? new Date(a.recipient.lastActivityTimestamp || 0).getTime()
      : new Date(a.requester.lastActivityTimestamp || 0).getTime();
    const dateB = b.requester._id === currentUserId
      ? new Date(b.recipient.lastActivityTimestamp || 0).getTime()
      : new Date(b.requester.lastActivityTimestamp || 0).getTime();
    return dateB - dateA; // Sort in descending order (most recent first)
  }) || [];

  const previewAssociations = sortedAssociations.slice(0, 6) || [];

  return (
    <Card className="relative overflow-hidden border-0  bg-black  transition-all duration-300">
      {/* Red accent bar */}
      {/* <div className="h-0.5 bg-red-600 w-full" /> */}
      
      <div className="p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/10 rounded-lg">
              <Users className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Associations</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {connectedCount > 0 
                  ? `Connected with ${connectedCount} ${connectedCount === 1 ? 'creator' : 'creators'}`
                  : 'Build your network'
                }
              </p>
            </div>
          </div>
          
          {/* View All Button - Shows when associations exist */}
          {connectedCount > 0 && (
            <Button 
              onClick={() => navigate("/associations")} 
              className="bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20 whitespace-nowrap"
              size="sm"
            >
              <Users className="h-4 w-4 mr-1.5" />
              View All
              {pendingRequestsCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-2 py-0 text-xs animate-pulse border-0"
                >
                  {pendingRequestsCount}
                </Badge>
              )}
            </Button>
          )}
          
          {/* Show separate pending badge only in empty state */}
          {connectedCount === 0 && pendingRequestsCount > 0 && (
            <Badge variant="destructive" className="text-sm px-3 py-1.5 animate-pulse self-start sm:self-center">
              <span className="mr-1.5">●</span>
              {pendingRequestsCount} Pending Request{pendingRequestsCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        {connectedCount > 0 ? (
          <>
            {/* Association Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {previewAssociations.map((association, index) => {
                const otherUser = association.requester._id === currentUserId
                  ? association.recipient
                  : association.requester;

                return (
                  <motion.div
                    key={association._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/creators/${otherUser._id}`)}
                  >
                    <div className="relative p-4 rounded-xl  border border-gray-800 group-hover:border-red-600/50  transition-all duration-300">
                      {/* Avatar Section */}
                      <div className="flex flex-col items-center">
                        <div className="relative mb-3">
                          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center text-white text-xl font-bold border-2 border-gray-800 group-hover:border-red-600 transition-all duration-300 shadow-lg group-hover:shadow-red-600/20">
                            {(otherUser.name || otherUser.email).charAt(0).toUpperCase()}
                          </div>
                          {/* Online Status Indicator */}
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-gray-900 shadow-lg"></div>
                        </div>
                        
                        {/* User Info */}
                        <div className="text-center w-full">
                          <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-red-600 transition-colors mb-1.5">
                            {otherUser.name || otherUser.email.split('@')[0]}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className="text-xs px-2 py-0.5 bg-gray-800/80 text-gray-300 border border-gray-700 capitalize"
                          >
                            {otherUser.roles[0]}
                          </Badge>
                          {otherUser.lastActivityType && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{otherUser.lastActivityType}</p>
                          )}
                        </div>
                        
                        {/* Hidden on default, shown on hover */}
                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <span className="text-xs text-red-500 font-medium">View Profile →</span>
                        </div>
                      </div>
                      
                      {/* Hover Overlay Effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="relative inline-block mb-6">
              <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-2 border-gray-700">
                <Users className="h-10 w-10 text-gray-600" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-red-600 rounded-full flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Associations Yet</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Start building your network by connecting with talented creators in the VFX community.
            </p>
            <Button 
              onClick={() => navigate("/associations")}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20"
              size="lg"
            >
              <Users className="h-4 w-4 mr-2" />
              Start Connecting
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Dashboard;