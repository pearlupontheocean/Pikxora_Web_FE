import { useParams, useNavigate } from "react-router-dom";
import {
  useCurrentUser,
  useUserProfile,
  useMyAssociations,
  useSendAssociationRequest,
  useWallsByUser,
  useProjectsByUser,
} from "@/lib/api-hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Link, MapPin, Tag, Plus } from "lucide-react";
import RatingStars from "@/components/RatingStars";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar"; // Import Navbar

const CreatorDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Helper function to navigate back with fallback
  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/browse');
    }
  };

  const { data: currentUserData, isLoading: userLoading } = useCurrentUser();
  const currentUserId = currentUserData?.user?.id;
  const isArtistOrStudio = currentUserData?.user?.roles?.includes("artist") || currentUserData?.user?.roles?.includes("studio");

  const {
    data: creatorProfile,
    isLoading: isLoadingCreatorProfile,
    error: creatorProfileError,
  } = useUserProfile(id!);

  const {
    data: myAssociations,
    isLoading: isLoadingMyAssociations,
    error: myAssociationsError,
  } = useMyAssociations();

  const {
    mutate: sendAssociationRequest,
    isPending: isSendingAssociation,
  } = useSendAssociationRequest();

  const { data: creatorWalls, isLoading: isLoadingCreatorWalls, error: creatorWallsError } = useWallsByUser(id!);
  const { data: creatorProjects, isLoading: isLoadingCreatorProjects, error: creatorProjectsError } = useProjectsByUser(id!);

  const isAssociated = myAssociations?.some(
    (assoc) =>
      (assoc.requester._id === currentUserId && assoc.recipient._id === id && assoc.status === "accepted") ||
      (assoc.recipient._id === currentUserId && assoc.requester._id === id && assoc.status === "accepted")
  );

  const isPendingAssociation = myAssociations?.some(
    (assoc) =>
      (assoc.requester._id === currentUserId && assoc.recipient._id === id && assoc.status === "pending") ||
      (assoc.recipient._id === currentUserId && assoc.requester._id === id && assoc.status === "pending")
  );

  const handleSendAssociation = () => {
    if (id) {
      sendAssociationRequest(id, {
        onSuccess: () => {
          toast.success("Association request sent!");
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.error || "Failed to send association request.");
        },
      });
    }
  };

  if (isLoadingCreatorProfile || isLoadingMyAssociations || isLoadingCreatorWalls || isLoadingCreatorProjects || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center  text-white">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        {/* <p className="mt-4 text-muted-foreground">Loading creator details...</p> */}
      </div>
    );
  }

  if (creatorProfileError || !creatorProfile || !creatorProfile.profile) {
    return (
      <div className="min-h-screen container mx-auto p-4 pt-24 pb-12 text-center text-red-500  flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Creator Not Found</h1>
        <p>The creator you are looking for does not exist or an error occurred.</p>
        <Button onClick={handleBack} className="mt-4 bg-red-600 hover:bg-red-700 text-white">
          Back to Browse Creators
        </Button>
      </div>
    );
  }

  const { profile, user } = creatorProfile;

  return (
    <div className="min-h-screen  text-white">
      <Navbar user={currentUserData?.user} profile={currentUserData?.profile} /> {/* Pass user and profile to Navbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto p-4 pt-24 pb-12 max-w-4xl"
      >
        <Card className="bg-gray-950 border-gray-800 shadow-xl rounded-lg overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-center gap-6 p-8 bg-gradient-to-br from-gray-900 to-black border-b border-gray-800">
            <Avatar className="h-28 w-28 border-4 border-red-600 shadow-lg">
              <AvatarImage src={profile.avatar_url} alt={profile.name} />
              <AvatarFallback className="bg-red-600 text-white text-4xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-grow">
              <CardTitle className="text-5xl font-extrabold text-white mb-2 leading-tight red-glow-text">{profile.name}</CardTitle>
              <CardDescription className="text-red-400 text-xl font-medium mb-2">{user.roles[0]?.toUpperCase()}</CardDescription>
              {profile.tagline && <p className="text-gray-300 text-md italic mb-3">"{profile.tagline}"</p>}
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                <Badge variant="outline" className="text-green-400 border-green-400 px-3 py-1 text-sm bg-green-900/20">
                  {profile.verification_status === "approved" ? "Verified Account" : "Verification Pending"}
                </Badge>
                {profile.location && (
                  <Badge variant="outline" className="text-blue-400 border-blue-400 px-3 py-1 text-sm bg-blue-900/20">
                    <MapPin className="h-3 w-3 mr-1" /> {profile.location}
                  </Badge>
                )}
                {profile.rating && <RatingStars rating={profile.rating} showBadge />}
              </div>
            </div>
            {currentUserId !== id && ( // Don't show button for own profile
              <div className="flex flex-col gap-3 w-full sm:w-auto mt-6 sm:mt-0">
                {profile.wall_id && (
                  <Button variant="secondary" onClick={() => navigate(`/wall/${profile.wall_id}`)} className="w-full text-red-400 border-red-600 hover:bg-red-600 hover:text-white transition-colors">
                    View Wall
                  </Button>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleSendAssociation}
                        disabled={!isArtistOrStudio || isSendingAssociation || isAssociated || isPendingAssociation}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isSendingAssociation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isAssociated ? "Associated" : isPendingAssociation ? "Request Sent" : "Request Association"}
                      </Button>
                    </TooltipTrigger>
                    {!isArtistOrStudio && (
                      <TooltipContent className="bg-gray-800 text-white border-gray-700">
                        <p>Only verified artists and studios can send association requests.</p>
                      </TooltipContent>
                    )}
                    {(isAssociated || isPendingAssociation) && (
                      <TooltipContent className="bg-gray-800 text-white border-gray-700">
                        <p>{isAssociated ? "You are already associated with this creator." : "An association request is already pending or sent."}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-8 grid gap-8">
            {profile.bio && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-4 red-glow-text">About {profile.name}</h2>
                <p className="text-gray-300 leading-relaxed text-lg">{profile.bio}</p>
              </div>
            )}

            {(profile.skills && profile.skills.length > 0) && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-4 red-glow-text">Skills</h2>
                <div className="flex flex-wrap gap-3">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="px-4 py-2 text-md bg-gray-700 text-gray-100 hover:bg-gray-600 transition-colors">
                      <Tag className="h-4 w-4 mr-2 text-red-400" /> {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="bg-gray-700" />

            <div>
              <h2 className="text-3xl font-bold text-white mb-4 red-glow-text">Contact & Socials</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300 text-lg">
                <p className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-red-500" /> {user.email}
                </p>
                {profile.social_links?.website && (
                  <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-red-400 transition-colors">
                    <Link className="h-5 w-5 text-red-500" /> Website
                  </a>
                )}
                {profile.social_links?.linkedin && (
                  <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-red-400 transition-colors">
                    <Link className="h-5 w-5 text-red-500" /> LinkedIn
                  </a>
                )}
                {profile.social_links?.twitter && (
                  <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-red-400 transition-colors">
                    <Link className="h-5 w-5 text-red-500" /> Twitter
                  </a>
                )}
                {profile.social_links?.instagram && (
                  <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-red-400 transition-colors">
                    <Link className="h-5 w-5 text-red-500" /> Instagram
                  </a>
                )}
              </div>
            </div>

            <Separator className="bg-gray-700" />

            <div>
              <h2 className="text-3xl font-bold text-white mb-4 red-glow-text">Walls ({creatorWalls?.length || 0})</h2>
              {isLoadingCreatorWalls ? (
                <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto" />
              ) : creatorWalls && creatorWalls.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {creatorWalls.map((wall) => (
                    <Card key={wall._id} className="bg-gray-800 border-gray-700 hover:border-red-600 transition-colors cursor-pointer group" onClick={() => navigate(`/wall/${wall._id}`)}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg text-white line-clamp-1 group-hover:text-red-400 transition-colors">{wall.name}</CardTitle>
                        <CardDescription className="text-gray-400 text-sm line-clamp-2">{wall.description || "No description provided."}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No walls found for this creator.</p>
              )}
            </div>

            <Separator className="bg-gray-700" />

            <div>
              <h2 className="text-3xl font-bold text-white mb-4 red-glow-text">Projects ({creatorProjects?.length || 0})</h2>
              {isLoadingCreatorProjects ? (
                <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto" />
              ) : creatorProjects && creatorProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {creatorProjects.map((project) => (
                    <Card key={project._id} className="bg-gray-800 border-gray-700 hover:border-red-600 transition-colors cursor-pointer group" onClick={() => navigate(`/project/${project._id}`)}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg text-white line-clamp-1 group-hover:text-red-400 transition-colors">{project.name}</CardTitle>
                        <CardDescription className="text-gray-400 text-sm line-clamp-2">{project.description || "No description provided."}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No projects found for this creator.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CreatorDetailsPage;