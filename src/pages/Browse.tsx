import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCurrentUser, useMyProfile, useWalls } from "@/lib/api-hooks";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Star, Loader2 } from "lucide-react";
import RatingStars from "@/components/RatingStars";

interface WallUser {
  _id?: string;
  name?: string;
  email?: string;
  rating?: number;
  location?: string;
  associations?: string[];
  user_id?: string;
  roles?: string[];
}

interface Wall {
  _id: string;
  id?: string;
  title?: string;
  description?: string;
  hero_media_url?: string;
  user_id?: WallUser;
}

interface CurrentUserData {
  user?: {
    id: string;
    email: string;
    roles?: string[];
  };
}

const Browse = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // React Query hooks
  const { data: currentUserData, isLoading: userLoading } = useCurrentUser();
  const { data: profile } = useMyProfile();
  const { data: walls = [], isLoading: loading } = useWalls();

  const user = (currentUserData as CurrentUserData)?.user;
  const isLoading = loading || userLoading;

  // Backend already filters out artist walls, so we just need to apply search filter
  const filteredWalls = (walls as Wall[]).filter((wall) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      wall.title?.toLowerCase().includes(term) ||
      wall.description?.toLowerCase().includes(term) ||
      wall.user_id?.name?.toLowerCase().includes(term) ||
      wall.user_id?.location?.toLowerCase().includes(term)
    );
  });

  const sortedWalls = [...filteredWalls].sort((a: Wall, b: Wall) => {
    const ratingA = a.user_id?.rating || 0;
    const ratingB = b.user_id?.rating || 0;
    return ratingB - ratingA;
  });

  console.log("Sorted Walls",sortedWalls);
  

  if (isLoading) {
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
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold red-glow-intense mb-4">
              Discover Global Talent
            </h1>
            <p className="text-xl text-muted-foreground">
              Explore VFX studios and artists from around the world
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, location, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-6 text-lg border-red-glow"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="text-center text-muted-foreground">
            {sortedWalls.length} {sortedWalls.length === 1 ? "wall" : "walls"} found
          </div>

          {/* Walls Grid */}
          {sortedWalls.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <p className="text-muted-foreground">
                No walls found. Try adjusting your search.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedWalls.map((wall, index) => (
                <motion.div
                  key={wall.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="hover-lift"
                >
                      <Card
                        className="overflow-hidden border-red-glow cursor-pointer h-full"
                        onClick={() => navigate(`/wall/${wall._id}`)}
                      >
                    {wall.hero_media_url && (
                      <div className="aspect-video bg-darker-grey relative overflow-hidden">
                        <img
                          src={wall.hero_media_url}
                          alt={wall.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      </div>
                    )}
                    
                    <div className="p-6 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-xl line-clamp-1">{wall.title}</h3>
                        {wall.user_id?.rating && (
                          <div className="flex-shrink-0">
                            <RatingStars rating={wall.user_id.rating} />
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-primary capitalize">
                        {wall.user_id?.name || "User"}
                      </p>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {wall.description || "No description available"}
                      </p>

                      {wall.user_id?.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {wall.user_id.location}
                        </div>
                      )}

                      {wall.user_id?.associations && wall.user_id.associations.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {wall.user_id.associations.slice(0, 3).map((assoc: string, i: number) => (
                            <span key={i} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                              {assoc}
                            </span>
                          ))}
                          {wall.user_id.associations.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                              +{wall.user_id.associations.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Browse;
