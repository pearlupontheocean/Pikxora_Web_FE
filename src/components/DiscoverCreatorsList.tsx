import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser, useMyAssociations, useDiscoverProfiles, useSendAssociationRequest } from "@/lib/api-hooks";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DiscoverProfile } from "@/types/jobs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CompactDiscoverCreatorCardProps {
  creator: DiscoverProfile;
  isArtistOrStudio: boolean;  
  onSendAssociationRequest: (recipientProfileId: string) => void;
  isSendingThisCreatorAssociation: boolean; // Per-creator loading state
  navigate: ReturnType<typeof useNavigate>;
}

const CompactDiscoverCreatorCard: React.FC<CompactDiscoverCreatorCardProps> = ({
  creator,
  isArtistOrStudio,
  onSendAssociationRequest,
  isSendingThisCreatorAssociation,
  navigate,
}) => {
  const displaySkills = creator.skills && creator.skills.length > 0
    ? creator.skills.slice(0, 3).join(', ')
    : "VFX, Animation, 3D Modeling"; // Fallback skills

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-shrink-0 w-72 h-80 sm:w-64 cursor-pointer"
      onClick={() => navigate(`/creators/${creator._id}`)}
    >
      <Card className="flex flex-col items-center text-center p-4 border border-gray-800 bg-black rounded-lg h-full shadow-lg hover:border-red-600 transition-all duration-300">
        {/* Circular Avatar */}
        {creator.avatar_url ? (
          <img
            src={creator.avatar_url}
            alt={creator.name || "Creator avatar"}
            className="h-16 w-16 rounded-full object-cover mb-3 border-2 border-red-600"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-red-600 flex items-center justify-center text-white text-xl font-bold mb-3">
            {creator.name.charAt(0).toUpperCase()}
          </div>
        )}
        {/* Name and Role */}
        <p className="text-lg font-semibold line-clamp-1 h-8 mb-2 text-white">{creator.name}</p>
        <Badge variant="secondary" className="mt-1 bg-gray-700 text-gray-100">{creator.role}</Badge>
        {/* Location (if available) */}
        {creator.location && <p className="text-sm text-muted-foreground mt-2 line-clamp-1 text-gray-400">{creator.location}</p>}
        {/* Short Skills Snippet */}
        <p className="text-xs text-gray-500 mt-2 line-clamp-2 h-10 text-gray-400">
          Skills: {displaySkills}
        </p>

        <div className="flex flex-col gap-2 mt-4 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); navigate(`/wall/${creator._id}`); }} // Navigate to wall, stop event propagation
            disabled={!creator.wall_id}
            className="w-full text-red-400 border-red-600 hover:bg-red-600 hover:text-white transition-colors"
          >
            View {creator.wall_id ? "Wall" : "Profile"}
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onSendAssociationRequest(creator._id); }} // Stop event propagation
                  disabled={!isArtistOrStudio || isSendingThisCreatorAssociation}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  {isSendingThisCreatorAssociation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Request Association
                </Button>
              </TooltipTrigger>
              {!isArtistOrStudio && (
                <TooltipContent className="bg-gray-800 text-white border-gray-700">
                  <p>Only verified artists and studios can send association requests.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </Card>
    </motion.div>
  );
};

// Skeleton Card Component
const SkeletonCard: React.FC = () => (
  <div className="flex-shrink-0 w-72 h-80 sm:w-64 animate-pulse">
    <Card className="flex flex-col items-center text-center p-4 border border-gray-800 rounded-lg h-full bg-gray-900">
      <div className="h-16 w-16 rounded-full bg-gray-700 mb-3"></div>
      <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-600 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-600 rounded w-full mt-2 mb-4"></div>
      <div className="h-10 bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-10 bg-gray-700 rounded w-full"></div>
    </Card>
  </div>
);

interface DiscoverCreatorsListProps {
  isArtistOrStudio: boolean;
  currentUserId: string | undefined;
}

export const DiscoverCreatorsList: React.FC<DiscoverCreatorsListProps> = ({
  isArtistOrStudio,
  currentUserId,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Get query client for invalidation
  const [sendingCreatorId, setSendingCreatorId] = useState<string | null>(null); // Per-creator loading state

  // Fetch my associations first
  const { data: myAssociations, isLoading: isLoadingMyAssociations } = useMyAssociations();

  // Derive excludedUserIds from current user and associations
  const excludedUserIds = useMemo(() => {
    const ids = new Set<string>();
    if (currentUserId) {
      ids.add(currentUserId);
    }
    myAssociations?.forEach(association => {
      const otherUser = association.requester._id === currentUserId
        ? association.recipient
        : association.requester;
      ids.add(otherUser._id);
    });
    return Array.from(ids);
  }, [currentUserId, myAssociations]);

  // Then fetch discover profiles, passing the excluded IDs
  const { data: discoverProfiles, isLoading: isLoadingDiscoverProfiles, error: discoverProfilesError } = useDiscoverProfiles(6, excludedUserIds);

  const { mutate: sendAssociationRequest } = useSendAssociationRequest({
    onMutate: (recipientProfileId) => {
      setSendingCreatorId(recipientProfileId); // Set loading for this specific creator
    },
    onSuccess: () => {
      toast.success("Association request sent!");
      setSendingCreatorId(null); // Reset loading
      queryClient.invalidateQueries({ queryKey: ['myAssociations'] }); // Invalidate to refetch associations
      queryClient.invalidateQueries({ queryKey: ['pendingAssociations'] }); // Invalidate pending requests for dashboard
      queryClient.invalidateQueries({ queryKey: ['discoverProfiles'] }); // Invalidate discover profiles to refetch with new exclusions
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || "Failed to send association request.";
      toast.error(errorMessage);
      setSendingCreatorId(null); // Reset loading
    },
  });

  if (isLoadingDiscoverProfiles || isLoadingMyAssociations) {
    return (
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-6 text-white">Discover Verified Creators</h3>
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-gray-900 pb-4">
          <div className="flex gap-4 pb-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (discoverProfilesError) {
    return (
      <Card className="p-6 text-red-500 bg-gray-900 border-red-800">
        <p>Error loading discover profiles: {discoverProfilesError.message}</p>
      </Card>
    );
  }

  const verifiedCreators = discoverProfiles?.filter(profile =>
    profile.verification_status === "approved" &&
    (profile.role === "artist" || profile.role === "studio")
  ) || [];

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-6 text-white">Discover Verified Creators</h3>
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-gray-900 pb-4">
        <div className="flex gap-4 pb-4">
          {verifiedCreators.length > 0 ? (
            verifiedCreators.map((creator: DiscoverProfile) => (
              <CompactDiscoverCreatorCard
                key={creator._id}
                creator={creator}
                isArtistOrStudio={isArtistOrStudio}
                onSendAssociationRequest={sendAssociationRequest} // Pass the function directly
                isSendingThisCreatorAssociation={sendingCreatorId === creator._id}
                navigate={navigate}
              />
            ))
          ) : (
            <div className="text-center py-8 w-full">
              <p className="text-muted-foreground mb-4 text-gray-400">No verified creators found at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};