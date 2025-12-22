import React from 'react';
import { useNavigate } from "react-router-dom";
import { useMyAssociations, usePendingAssociations, useRespondToAssociation, useRemoveAssociation, useCurrentUser } from '@/lib/api-hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import RatingStars from '@/components/RatingStars';
import Navbar from '@/components/Navbar';

const AssociationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: currentUserData } = useCurrentUser();
  const currentUserId = currentUserData?.user?.id;
  const { data: myAssociations, isLoading: isLoadingMyAssociations, error: myAssociationsError } = useMyAssociations();
  const { data: pendingAssociations, isLoading: isLoadingPendingAssociations, error: pendingAssociationsError } = usePendingAssociations();

  const removeAssociationMutation = useRemoveAssociation();
  const respondToAssociationMutation = useRespondToAssociation();

  const handleRemove = async (id: string) => {
    try {
      await removeAssociationMutation.mutateAsync(id);
      toast.success('Association removed successfully.');
    } catch (error: any) {
      toast.error(`Failed to remove association: ${error.response?.data?.error || 'Unknown error'}`);
    }
  };

  const handleRespond = async (id: string, action: 'accept' | 'reject') => {
    try {
      await respondToAssociationMutation.mutateAsync({ id, action });
      toast.success(`Association ${action}ed successfully.`);
    } catch (error: any) {
      toast.error(`Failed to ${action} association: ${error.response?.data?.error || 'Unknown error'}`);
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
      <Navbar user={currentUserData?.user} profile={currentUserData?.profile} />
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
                        <div className="flex items-center gap-4 w-full sm:w-auto">
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
                          <Button variant="outline" size="sm" onClick={() => navigate(`/wall/${otherUser.profile?.wall_id}`)} disabled={!otherUser.profile?.wall_id} className="w-full sm:w-auto">
                            View Wall
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleRemove(association._id)} className="w-full sm:w-auto">
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
                        <div className="flex items-center gap-4 w-full sm:w-auto">
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
                          <Button variant="default" size="sm" onClick={() => handleRespond(association._id, 'accept')} className="w-full sm:w-auto">
                            Accept
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleRespond(association._id, 'reject')} className="w-full sm:w-auto">
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
    </div>
  );
};

export default AssociationsPage;
