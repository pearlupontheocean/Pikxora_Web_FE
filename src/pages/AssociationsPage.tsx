import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useMyAssociations, usePendingAssociations, useRespondToAssociation, useRemoveAssociation, useCurrentUser, useUserProfile } from '@/lib/api-hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, MapPin, Link, Tag } from 'lucide-react';
import { toast } from 'sonner';
import RatingStars from '@/components/RatingStars';

const AssociationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: currentUserData } = useCurrentUser();
  const currentUserId = currentUserData?.user?.id;
  const { data: myAssociations, isLoading: isLoadingMyAssociations, error: myAssociationsError } = useMyAssociations();
  const { data: pendingAssociations, isLoading: isLoadingPendingAssociations, error: pendingAssociationsError } = usePendingAssociations();

  const removeAssociationMutation = useRemoveAssociation();
  const respondToAssociationMutation = useRespondToAssociation();

  // State for profile modal
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data: selectedUserProfile, isLoading: isLoadingProfile } = useUserProfile(selectedUserId || '');

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleCloseProfile = () => {
    setSelectedUserId(null);
  };

  const handleRemove = async (id: string) => {
    try {
      await removeAssociationMutation.mutateAsync(id);
      toast.success('Association removed successfully.');
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string } } })?.response?.data?.error
        : error instanceof Error
        ? error.message
        : 'Unknown error';
      toast.error(`Failed to remove association: ${errorMessage || 'Unknown error'}`);
    }
  };

  const handleRespond = async (id: string, action: 'accept' | 'reject') => {
    try {
      await respondToAssociationMutation.mutateAsync({ id, action });
      toast.success(`Association ${action}ed successfully.`);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string } } })?.response?.data?.error
        : error instanceof Error
        ? error.message
        : 'Unknown error';
      toast.error(`Failed to ${action} association: ${errorMessage || 'Unknown error'}`);
    }
  };

  if (isLoadingMyAssociations || isLoadingPendingAssociations) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (myAssociationsError || pendingAssociationsError) {
    return (
      <div className="p-4 text-red-500">
        <p>Error loading associations: {myAssociationsError?.message || pendingAssociationsError?.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4 mt-24">
        <h1 className="text-3xl font-bold mb-6 text-white">Your Associations</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
          {/* Connected Associations Card */}
          <Card className="border-gray-800 shadow-lg flex flex-col h-full">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-xl text-white">Connected ({myAssociations?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
              {myAssociations && myAssociations.length > 0 ? (
                <div className="space-y-4">
                  {myAssociations.map((association) => {
                    const otherUser = association.requester._id === currentUserId
                      ? association.recipient
                      : association.requester;
                    
                    return (
                      <Card key={association._id} className="flex flex-col sm:flex-row items-center justify-between p-4 border border-gray-700 rounded-lg ">
                        <div 
                          className="flex items-center gap-4 w-full sm:w-auto cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleUserClick(otherUser._id)}
                        >
                          <Avatar className="h-12 w-12 border-2 border-red-600 flex-shrink-0">
                            <AvatarImage src={otherUser.profile_picture} alt={otherUser.name || otherUser.email} />
                            <AvatarFallback className="bg-red-600 text-white font-bold">{otherUser.name?.charAt(0).toUpperCase() || otherUser.email.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-lg text-white truncate">{otherUser.name || otherUser.email}</p>
                            <p className="text-sm text-gray-400 flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3 flex-shrink-0" /> 
                              <span className="truncate">{otherUser.email}</span>
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="secondary" className="capitalize">{otherUser.roles[0]}</Badge>
                              {otherUser.profile?.location && (
                                <Badge variant="outline" className="text-blue-400 border-blue-400">
                                  <MapPin className="h-3 w-3 mr-1" /> {otherUser.profile.location}
                                </Badge>
                              )}
                              {otherUser.profile?.rating && <RatingStars rating={otherUser.profile.rating} showBadge />}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0 w-full sm:w-auto flex-shrink-0">
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/wall/${otherUser.profile?.wall_id}`); }} disabled={!otherUser.profile?.wall_id} className="w-full sm:w-auto">
                            View Wall
                          </Button>
                          <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleRemove(association._id); }} className="w-full sm:w-auto">
                            Remove
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-center text-gray-500">No connected associations.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Requests Card */}
          <Card className="border-gray-800 shadow-lg flex flex-col h-full">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-xl text-white">Pending Requests ({pendingAssociations?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
              {pendingAssociations && pendingAssociations.length > 0 ? (
                <div className="space-y-4">
                  {pendingAssociations.map((association) => {
                    const otherUser = association.requester._id === currentUserId
                      ? association.recipient
                      : association.requester;

                    return (
                      <Card key={association._id} className="flex flex-col sm:flex-row items-center justify-between p-4 border border-gray-700 rounded-lg ">
                        <div 
                          className="flex items-center gap-4 w-full sm:w-auto cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleUserClick(otherUser._id)}
                        >
                          <Avatar className="h-12 w-12 border-2 border-yellow-600 flex-shrink-0">
                            <AvatarImage src={otherUser.profile_picture} alt={otherUser.name || otherUser.email} />
                            <AvatarFallback className="bg-yellow-600 text-white font-bold">{otherUser.name?.charAt(0).toUpperCase() || otherUser.email.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-lg text-white truncate">{otherUser.name || otherUser.email}</p>
                            <p className="text-sm text-gray-400 flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{otherUser.email}</span>
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="secondary" className="capitalize">{otherUser.roles[0]}</Badge>
                              {otherUser.profile?.location && (
                                <Badge variant="outline" className="text-blue-400 border-blue-400">
                                  <MapPin className="h-3 w-3 mr-1" /> {otherUser.profile.location}
                                </Badge>
                              )}
                              {otherUser.profile?.rating && <RatingStars rating={otherUser.profile.rating} showBadge />}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0 w-full sm:w-auto flex-shrink-0">
                          <Button variant="default" size="sm" onClick={(e) => { e.stopPropagation(); handleRespond(association._id, 'accept'); }} className="w-full sm:w-auto">
                            Accept
                          </Button>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleRespond(association._id, 'reject'); }} className="w-full sm:w-auto">
                            Reject
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-center text-gray-500">No pending association requests.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Profile Modal */}
      <Dialog open={!!selectedUserId} onOpenChange={(open) => !open && handleCloseProfile()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-950 border-gray-800 text-white">
          {isLoadingProfile ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
          ) : selectedUserProfile && selectedUserProfile.profile ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-20 w-20 border-4 border-red-600">
                    <AvatarImage src={selectedUserProfile.profile.avatar_url} alt={selectedUserProfile.profile.name} />
                    <AvatarFallback className="bg-red-600 text-white text-2xl font-bold">
                      {selectedUserProfile.profile.name?.charAt(0).toUpperCase() || selectedUserProfile.user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DialogTitle className="text-3xl font-bold text-white mb-1">
                      {selectedUserProfile.profile.name || selectedUserProfile.user.email}
                    </DialogTitle>
                    <DialogDescription className="text-red-400 text-lg font-medium mb-2">
                      {selectedUserProfile.user.roles[0]?.toUpperCase()}
                    </DialogDescription>
                    {selectedUserProfile.profile.tagline && (
                      <p className="text-gray-300 text-sm italic">"{selectedUserProfile.profile.tagline}"</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        {selectedUserProfile.profile.verification_status === "approved" ? "Verified" : "Pending"}
                      </Badge>
                      {selectedUserProfile.profile.location && (
                        <Badge variant="outline" className="text-blue-400 border-blue-400">
                          <MapPin className="h-3 w-3 mr-1" /> {selectedUserProfile.profile.location}
                        </Badge>
                      )}
                      {selectedUserProfile.profile.rating && <RatingStars rating={selectedUserProfile.profile.rating} showBadge />}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {selectedUserProfile.profile.bio && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">About</h3>
                    <p className="text-gray-300 leading-relaxed">{selectedUserProfile.profile.bio}</p>
                  </div>
                )}

                {selectedUserProfile.profile.skills && selectedUserProfile.profile.skills.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedUserProfile.profile.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-100">
                          <Tag className="h-3 w-3 mr-1 text-red-400" /> {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Contact & Socials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-300">
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-red-500" /> {selectedUserProfile.user.email}
                    </p>
                    {selectedUserProfile.profile.social_links?.website && (
                      <a href={selectedUserProfile.profile.social_links.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-red-400 transition-colors">
                        <Link className="h-4 w-4 text-red-500" /> Website
                      </a>
                    )}
                    {selectedUserProfile.profile.social_links?.linkedin && (
                      <a href={selectedUserProfile.profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-red-400 transition-colors">
                        <Link className="h-4 w-4 text-red-500" /> LinkedIn
                      </a>
                    )}
                    {selectedUserProfile.profile.social_links?.twitter && (
                      <a href={selectedUserProfile.profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-red-400 transition-colors">
                        <Link className="h-4 w-4 text-red-500" /> Twitter
                      </a>
                    )}
                    {selectedUserProfile.profile.social_links?.instagram && (
                      <a href={selectedUserProfile.profile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-red-400 transition-colors">
                        <Link className="h-4 w-4 text-red-500" /> Instagram
                      </a>
                    )}
                  </div>
                </div>

                {selectedUserProfile.profile.wall_id && (
                  <div className="pt-4">
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        handleCloseProfile();
                        navigate(`/wall/${selectedUserProfile.profile.wall_id}`);
                      }} 
                      className="w-full text-red-400 border-red-600 hover:bg-red-600 hover:text-white"
                    >
                      View Wall
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>Profile not found</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssociationsPage;
