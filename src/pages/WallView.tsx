import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCurrentUser, useMyProfile, useWall as useWallHook, useCreateProject, useUpdateProject, useUpdateWall, useTeamMembers, useCreateTeamMember, useUpdateTeamMember, useDeleteTeamMember } from "@/lib/api-hooks";
import axiosInstance from "@/lib/axios";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import StudioIdentity from "@/components/StudioIdentity";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin, Mail, Eye, Edit, Video, Briefcase, Users, BookOpen, Plus, X, Trash2, Globe, Lock, User, Linkedin, Twitter, Instagram, ExternalLink, Award, ChevronDown, ArrowRight, Building2, Network, Shield } from "lucide-react";
import RatingStars from "@/components/RatingStars";
import { toast } from "sonner";

const WallView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // React Query hooks
  const { data: currentUserData } = useCurrentUser();
  const { data: profile } = useMyProfile();
  const { data: wall, isLoading: wallLoading } = useWallHook(id!);
  
  const user = (currentUserData as { user?: { id?: string } })?.user;
  const loading = wallLoading;

  // Load projects
  const [projects, setProjects] = useState<Array<{
    _id: string;
    title: string;
    description?: string;
    media_url?: string;
    media_type?: string;
    category?: string;
    showreel_url?: string;
    showreel_type?: string;
    order_index?: number;
  }>>([]);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<{
    _id: string;
    title: string;
    description?: string;
    media_url?: string;
    media_type?: string;
    category?: string;
    showreel_url?: string;
    showreel_type?: string;
    order_index?: number;
  } | null>(null);
  
  const updateProjectMutation = useUpdateProject();
  const { mutateAsync: updateWall } = useUpdateWall();
  
  // Team members
  const { data: teamMembers = [], isLoading: teamLoading } = useTeamMembers(id!);
  const createTeamMemberMutation = useCreateTeamMember();
  const updateTeamMemberMutation = useUpdateTeamMember();
  const deleteTeamMemberMutation = useDeleteTeamMember();
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<{
    _id: string;
    name: string;
    role: string;
    bio?: string;
    email?: string;
    experience_years?: number;
    skills?: string[];
    avatar_url?: string;
    social_links?: {
      linkedin?: string;
      twitter?: string;
      instagram?: string;
      website?: string;
      portfolio?: string;
    };
    order_index?: number;
  } | null>(null);
  
  const loadProjects = useCallback(async () => {
    if (!id) return;
      try {
        const response = await axiosInstance.get(`/projects/wall/${id}`);
        setProjects(response.data || []);
      } catch (error) {
        console.error('Error loading projects:', error);
      }
  }, [id]);

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/projects/${projectId}`);
      toast.success("Project deleted successfully!");
      loadProjects();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to delete project";
      toast.error(errorMessage);
    }
  };
  
  useEffect(() => {
    if (!wall && !wallLoading) {
      navigate("/browse");
    }
  }, [wall, wallLoading, navigate]);

  useEffect(() => {
      loadProjects();
  }, [loadProjects]);

  // Debug logging for ownership
  useEffect(() => {
    if (wall && profile) {
      const wallOwner = wall.user_id;
      const isOwnerCheck = profile && wallOwner && (
        (typeof wallOwner === 'object' && profile._id?.toString() === wallOwner._id?.toString()) ||
        (typeof wallOwner === 'string' && profile._id?.toString() === wallOwner.toString())
      );
      console.log("Wall ownership check:", {
        profileId: profile._id,
        wallUserId: wall.user_id,
        wallUserIdType: typeof wall.user_id,
        wallOwnerId: typeof wallOwner === 'object' ? wallOwner._id : wallOwner,
        isOwner: isOwnerCheck,
        profileExists: !!profile,
        wallOwnerExists: !!wallOwner
      });
    }
  }, [wall, profile]);

  if (loading || !wall) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const wallOwner = wall.user_id;
  // Check ownership: wall.user_id can be either the profile object (populated) or profile._id string
  // Compare profile._id with wall.user_id._id (if populated) or wall.user_id (if string)
  const isOwner = profile && wallOwner && (
    (typeof wallOwner === 'object' && profile._id?.toString() === wallOwner._id?.toString()) ||
    (typeof wallOwner === 'string' && profile._id?.toString() === wallOwner.toString())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} profile={profile} />

      {/* Hero Section */}
      {wall?.hero_media_url && (
        <div className="relative h-[50vh] overflow-hidden">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1 }}
            src={wall.hero_media_url}
            alt={wall.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
      )}

      <div className="container mx-auto px-4 py-4 -mt-32 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-2">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold red-glow-intense mb-1">{wall?.title}</h1>
              {wallOwner && (
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">by {wallOwner.name}</span>
                    {wallOwner.rating && (
                      <RatingStars rating={wallOwner.rating} />
                    )}
                  </div>
                  {wallOwner.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{wallOwner.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{wall.view_count || 0} views</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {isOwner && (
                <>
                  <Button
                    variant={wall.published ? "outline" : "default"}
                    onClick={async () => {
                      try {
                        await updateWall({
                          id: id!,
                          data: { published: !wall.published }
                        });
                        toast.success(
                          wall.published 
                            ? "Wall unpublished successfully!" 
                            : "Wall published successfully!"
                        );
                        // Refresh the page data
                        window.location.reload();
                      } catch (error: unknown) {
                        const errorMessage = error instanceof Error 
                          ? error.message 
                          : (error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to update publish status";
                        toast.error(errorMessage);
                      }
                    }}
                  >
                    {wall.published ? (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4 mr-2" />
                        Publish
                      </>
                    )}
                  </Button>
                <Link to={`/wall/${id}/edit`}>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Wall
                  </Button>
                </Link>
                </>
              )}
              {wallOwner?.email && (
                <Button onClick={() => {
                  const contactSection = document.getElementById('contact-section');
                  contactSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}>
                  <Mail className="h-4 w-4 mr-2" />
                  Get in Touch
                </Button>
              )}
            </div>
          </div>

          {wall?.description && (
            <p className="text-base text-muted-foreground max-w-3xl mt-2">
              {wall.description}
            </p>
          )}
        </motion.div>

        {/* Single Scrollable Page with Sections */}
        <div className="space-y-8 scroll-smooth">

          {/* Overview Section */}
          <section id="overview-section" className="scroll-mt-24 space-y-4">
            {wall?.showreel_url && wall?.showreel_type && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="mb-4"
              >
                <div className="flex gap-0 items-start mt-12 mb-12">
                  {/* Vertical Text Label */}
                  <div className="flex-shrink-0 flex items-start justify-start" style={{ 
                    width: '120px',
                    position: 'relative',
                    zIndex: 1,
                    alignSelf: 'flex-start'
                  }}>
                    <div 
                      className="text-vertical-outline-red text-5xl md:text-6xl lg:text-[80px]"
                      style={{ 
                        transform: 'rotate(-90deg)',
                        transformOrigin: 'center',
                        whiteSpace: 'nowrap',
                        height: 'fit-content',
                        width: 'fit-content',
                        position: 'absolute',
                        top: 240,
                        left: '-100%',
                        marginLeft: '-70px',
                      }}
                    >
                      {'SHOWREEL'.split('').map((letter, index) => (
                        <span key={index} className="letter inline-block">
                          {letter === ' ' ? '\u00A0' : letter}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Video Player Content */}
                  <div className="flex-1 relative pl-0">
                    <div className="max-w-5xl mx-auto">
                <VideoPlayer
                  url={wall.showreel_url}
                  type={wall.showreel_type}
                        className="w-full"
                />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Studio Identity and Brand Identity Side by Side */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Studio Identity (Logo & Tagline) */}
              <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-2 border-primary/20">
                <h3 className="text-xl font-bold mb-4 text-center">Studio Identity</h3>
                <div className="space-y-4">
                  {wall?.logo_url && (
                    <div className="flex justify-center">
                      <img
                        src={wall.logo_url}
                        alt="Studio Logo"
                        className="h-24 w-auto object-contain"
                      />
                    </div>
                  )}
                  {wall?.tagline && (
                    <p className="text-lg text-muted-foreground italic text-center">
                      "{wall.tagline}"
                    </p>
                  )}
                </div>
              </Card>

              {/* Brand Identity (Colors) */}
              {/* {wall?.brand_colors && (
                <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-2 border-primary/20">
                  <h3 className="text-xl font-bold mb-4 text-center">Brand Identity</h3>
                  <div className="flex justify-center gap-6">
                    <div className="space-y-2">
                      <div
                        className="w-20 h-20 rounded-lg border-2 border-border shadow-lg"
                        style={{ backgroundColor: (wall.brand_colors as { primary?: string; secondary?: string }).primary || "#ef4444" }}
                      />
                      <p className="text-sm text-muted-foreground text-center">Primary</p>
                    </div>
                    <div className="space-y-2">
                      <div
                        className="w-20 h-20 rounded-lg border-2 border-border shadow-lg"
                        style={{ backgroundColor: (wall.brand_colors as { primary?: string; secondary?: string }).secondary || "#1a1a1a" }}
                      />
                      <p className="text-sm text-muted-foreground text-center">Secondary</p>
                    </div>
                  </div>
                </Card>
              )} */}

              {/* Associations Only */}
            {wallOwner?.associations && wallOwner.associations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-2 border-primary/20">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Network className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-center">Associations</h3>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {wallOwner.associations.map((assoc: string, index: number) => {
                      // Select icon based on association name or use default
                      const getIcon = (name: string) => {
                        const lowerName = name.toLowerCase();
                        if (lowerName.includes('academy') || lowerName.includes('award') || lowerName.includes('oscar') || lowerName.includes('ves')) {
                          return Award;
                        } else if (lowerName.includes('studio') || lowerName.includes('company') || lowerName.includes('corp')) {
                          return Building2;
                        } else if (lowerName.includes('union') || lowerName.includes('guild') || lowerName.includes('association')) {
                          return Shield;
                        } else {
                          return Network;
                        }
                      };
                      const IconComponent = getIcon(assoc);
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                          className="group"
                        >
                          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/30 rounded-lg hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/20 hover:to-primary/10 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer">
                            <IconComponent className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                            <span className="text-sm md:text-base font-medium text-foreground group-hover:text-primary transition-colors">
                              {assoc}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            )}
            </motion.div>

            

            {/* Awards Timeline */}
            {wall?.awards && wall.awards.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8"
              >
                <AwardsTimeline awards={wall.awards} />
              </motion.div>
            )}
          </section>

          {/* Projects Section */}
          <section id="projects-section" className="scroll-mt-24 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-3"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-1 red-glow-intense">Portfolio</h2>
              <div className="w-20 h-0.5 bg-primary mx-auto rounded-full" />
            </motion.div>
            <div className="flex items-center justify-end mb-3">
              {isOwner && (
                <>
                  <ProjectCreateDialog
                    wallId={id!}
                    onSuccess={() => {
                      loadProjects();
                      setIsProjectDialogOpen(false);
                    }}
                    open={isProjectDialogOpen}
                    onOpenChange={setIsProjectDialogOpen}
                  />
                  {editingProject && (
                    <ProjectEditDialog
                      project={editingProject}
                      onSuccess={() => {
                        loadProjects();
                        setEditingProject(null);
                      }}
                      open={!!editingProject}
                      onOpenChange={(open) => !open && setEditingProject(null)}
                    />
                  )}
                </>
              )}
            </div>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project: {
                  _id: string;
                  title: string;
                  description?: string;
                  media_url?: string;
                  media_type?: string;
                  category?: string;
                  showreel_url?: string;
                  showreel_type?: string;
                  order_index?: number;
                }, index: number) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative group"
                  >
                    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/30 group">
                      {project.media_url && (
                        <div className="aspect-video overflow-hidden">
                          {project.media_type === "video" ? (
                            <video
                              src={project.media_url}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              muted
                              loop
                              playsInline
                            />
                          ) : (
                            <img
                              src={project.media_url}
                              alt={project.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          )}
                        </div>
                      )}
                      <div className="p-6 space-y-2">
                        {isOwner && (
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setEditingProject(project)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteProject(project._id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {project.category && (
                          <span className="text-xs text-primary uppercase tracking-wider">
                            {project.category}
                          </span>
                        )}
                        <h3 className="text-xl font-bold">{project.title}</h3>
                        {project.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {project.description}
                          </p>
                        )}
                        {project.showreel_url && project.showreel_type && (
                          <div className="pt-4">
                            <VideoPlayer
                              url={project.showreel_url}
                              type={project.showreel_type as "embed" | "upload"}
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card className="p-12 text-center border-dashed">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No projects yet</p>
                  {isOwner && (
                    <ProjectCreateDialog
                      wallId={id!}
                      onSuccess={() => {
                        loadProjects();
                        setIsProjectDialogOpen(false);
                      }}
                      open={isProjectDialogOpen}
                      onOpenChange={setIsProjectDialogOpen}
                    />
                  )}
                </Card>
              </motion.div>
            )}
          </section>

          {/* Team Section */}
          <section id="team-section" className="scroll-mt-24 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-3"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-1 red-glow-intense">Our Team</h2>
              <div className="w-20 h-0.5 bg-primary mx-auto rounded-full" />
            </motion.div>
            <div className="flex items-center justify-end mb-3">
              {isOwner && (
                <>
                  <Button onClick={() => setIsTeamDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team Member
                  </Button>
                  {editingTeamMember && (
                    <TeamMemberDialog
                      teamMember={editingTeamMember}
                      wallId={id!}
                      onSuccess={() => {
                        setEditingTeamMember(null);
                      }}
                      open={!!editingTeamMember}
                      onOpenChange={(open) => !open && setEditingTeamMember(null)}
                    />
                  )}
                </>
              )}
            </div>
            {teamLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : teamMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map((member: {
                  _id: string;
                  name: string;
                  role: string;
                  bio?: string;
                  email?: string;
                  experience_years?: number;
                  skills?: string[];
                  avatar_url?: string;
                  social_links?: {
                    linkedin?: string;
                    twitter?: string;
                    instagram?: string;
                    website?: string;
                    portfolio?: string;
                  };
                }, index: number) => (
                  <motion.div
                    key={member._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative group"
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/30">
                      <div className="p-6">
                        {isOwner && (
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setEditingTeamMember(member)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={async () => {
                                if (confirm("Are you sure you want to remove this team member?")) {
                                  try {
                                    await deleteTeamMemberMutation.mutateAsync(member._id);
                                    toast.success("Team member removed successfully!");
                                  } catch (error: unknown) {
                                    const errorMessage = error instanceof Error 
                                      ? error.message 
                                      : (error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to remove team member";
                                    toast.error(errorMessage);
                                  }
                                }
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div className="flex flex-col items-center text-center space-y-4">
                          {member.avatar_url ? (
                            <motion.img
                              src={member.avatar_url}
                              alt={member.name}
                              className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                              <User className="h-12 w-12 text-primary/50" />
                            </div>
                          )}
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold">{member.name}</h3>
                            <p className="text-sm text-primary font-semibold">{member.role}</p>
                            {member.experience_years && (
                              <p className="text-xs text-muted-foreground">
                                {member.experience_years} {member.experience_years === 1 ? 'year' : 'years'} of experience
                              </p>
                            )}
                          </div>
                          {member.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {member.bio}
                            </p>
                          )}
                          {member.skills && member.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-center">
                              {member.skills.map((skill: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20 hover:bg-primary/20 transition-colors"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                          {member.social_links && (
                            <div className="flex gap-2 pt-2">
                              {member.social_links.linkedin && (
                                <Button size="sm" variant="ghost" asChild>
                                  <a href={member.social_links.linkedin} target="_blank" rel="noopener noreferrer">
                                    <Linkedin className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              {member.social_links.twitter && (
                                <Button size="sm" variant="ghost" asChild>
                                  <a href={member.social_links.twitter} target="_blank" rel="noopener noreferrer">
                                    <Twitter className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              {member.social_links.instagram && (
                                <Button size="sm" variant="ghost" asChild>
                                  <a href={member.social_links.instagram} target="_blank" rel="noopener noreferrer">
                                    <Instagram className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              {member.social_links.website && (
                                <Button size="sm" variant="ghost" asChild>
                                  <a href={member.social_links.website} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              {member.social_links.portfolio && (
                                <Button size="sm" variant="ghost" asChild>
                                  <a href={member.social_links.portfolio} target="_blank" rel="noopener noreferrer">
                                    <Award className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          )}
                          {member.email && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={`mailto:${member.email}`}>
                                <Mail className="h-4 w-4 mr-2" />
                                Contact
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                </Card>
              </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card className="p-12 text-center border-dashed">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No team members yet</p>
                  {isOwner && (
                    <Button onClick={() => setIsTeamDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Team Member
                    </Button>
                  )}
                </Card>
              </motion.div>
            )}
            {isOwner && (
              <TeamMemberDialog
                teamMember={null}
                wallId={id!}
                onSuccess={() => {
                  setIsTeamDialogOpen(false);
                }}
                open={isTeamDialogOpen}
                onOpenChange={setIsTeamDialogOpen}
              />
            )}
          </section>

          {/* Journey Section */}
          <section id="journey-section" className="scroll-mt-24 space-y-4">
            {wall?.journey_content ? (
              <JourneyTimeline content={wall.journey_content} />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card className="p-12 text-center border-dashed">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No journey content available</p>
                </Card>
              </motion.div>
            )}
          </section>

          {/* Contact Form Section */}
          <section id="contact-section" className="scroll-mt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="max-w-8xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <Card className="p-6 md:p-8 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-xl relative overflow-hidden">
                  {/* Glowing background effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50" />
                  <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                  
                  <div className="relative z-10">
                   

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                      <div>
                      <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className="text-center gap-11"
                    >
                      <div className="inline-flex items-center justify-center w-[100px] h-[100px] rounded-full bg-primary/20 border-2 border-primary/40 mb-2">
                        <Mail className="h-[50px] w-[50px] text-primary" />
                      </div>
                      <h2 className="text-2xl md:text-4xl font-bold mb-1 red-glow-intense">Get in Touch</h2>
                      <p className="text-xs text-muted-foreground">Send us a message and we'll get back to you soon</p>
                    </motion.div>
                      {/* Connect With Us - Social Links */}
                      {wall?.social_links && Object.keys(wall.social_links).length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        >
                          <div className="bg-transparent rounded-lg p-4 my-6">
                            <h3 className="text-base font-semibold mb-3 text-center">Connect With Us</h3>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {(wall.social_links as { twitter?: string; linkedin?: string; instagram?: string; website?: string }).twitter && (
                                <motion.a
                                  href={(wall.social_links as { twitter?: string }).twitter}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="relative group"
                                >
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/50 hover:shadow-blue-500/80 transition-all duration-300">
                                    <Twitter className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />
                                </motion.a>
                              )}
                              {(wall.social_links as { linkedin?: string }).linkedin && (
                                <motion.a
                                  href={(wall.social_links as { linkedin?: string }).linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="relative group"
                                >
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/50 hover:shadow-blue-600/80 transition-all duration-300">
                                    <Linkedin className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="absolute inset-0 rounded-full bg-blue-500 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />
                                </motion.a>
                              )}
                              {(wall.social_links as { instagram?: string }).instagram && (
                                <motion.a
                                  href={(wall.social_links as { instagram?: string }).instagram}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="relative group"
                                >
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 flex items-center justify-center shadow-lg shadow-pink-500/50 hover:shadow-pink-500/80 transition-all duration-300">
                                    <Instagram className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="absolute inset-0 rounded-full bg-pink-500 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />
                                </motion.a>
                              )}
                              {(wall.social_links as { website?: string }).website && (
                                <motion.a
                                  href={(wall.social_links as { website?: string }).website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="relative group"
                                >
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/50 hover:shadow-primary/80 transition-all duration-300">
                                    <ExternalLink className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="absolute inset-0 rounded-full bg-primary opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />
                                </motion.a>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                      </div>

                      {/* Contact Form */}
                      <div className={wall?.social_links && Object.keys(wall.social_links).length > 0 ? "" : "lg:col-span-2"}>
                        <ContactForm wallOwnerEmail={wallOwner?.email} />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </section>

        </div>
      </div>
    </div>
  );
};

// Contact Form Component
const ContactForm = ({ wallOwnerEmail }: { wallOwnerEmail?: string }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Here you would typically send the form data to your backend
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success("Message sent successfully! We'll get back to you soon.");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Label htmlFor="contact-name" className="text-sm font-semibold mb-1.5 block">
          Name *
        </Label>
        <Input
          id="contact-name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Your name"
          className="bg-background/50 border-primary/20 focus:border-primary/60 focus:ring-primary/20 transition-all duration-300"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Label htmlFor="contact-email" className="text-sm font-semibold mb-1.5 block">
          Email *
        </Label>
        <Input
          id="contact-email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="your.email@example.com"
          className="bg-background/50 border-primary/20 focus:border-primary/60 focus:ring-primary/20 transition-all duration-300"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Label htmlFor="contact-subject" className="text-sm font-semibold mb-1.5 block">
          Subject *
        </Label>
        <Input
          id="contact-subject"
          type="text"
          required
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="What's this about?"
          className="bg-background/50 border-primary/20 focus:border-primary/60 focus:ring-primary/20 transition-all duration-300"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Label htmlFor="contact-message" className="text-sm font-semibold mb-1.5 block">
          Message *
        </Label>
        <Textarea
          id="contact-message"
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Tell us more about your project or inquiry..."
          className="bg-background/50 border-primary/20 focus:border-primary/60 focus:ring-primary/20 transition-all duration-300 resize-none"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="pt-2"
      >
        <Button
          type="submit"
          disabled={submitting}
          className="w-full py-5 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center justify-center">
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Send Message
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      </motion.div>
    </form>
  );
};

// Project Create Dialog Component
const ProjectCreateDialog = ({ 
  wallId, 
  onSuccess, 
  open, 
  onOpenChange 
}: { 
  wallId: string; 
  onSuccess: () => void; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    media_type: "image" as "image" | "video",
    order_index: 0,
    showreel_type: "embed" as "embed" | "upload",
    showreel_url: ""
  });
  const [mediaPreview, setMediaPreview] = useState("");
  const [showreelFile, setShowreelFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const createProjectMutation = useCreateProject();

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeMB = 50;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`Media file is too large. Maximum file size is ${maxSizeMB}MB.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.onerror = () => {
      toast.error('Failed to read media file');
    };
    reader.readAsDataURL(file);
  };

  const handleShowreelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setShowreelFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const mediaUrl = mediaPreview;
      let showreelUrl = formData.showreel_url;

      // Convert showreel video to base64 if it's a local upload
      if (showreelFile && formData.showreel_type === "upload") {
        const maxSizeMB = 50;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (showreelFile.size > maxSizeBytes) {
          toast.error(`Showreel video is too large. Maximum file size is ${maxSizeMB}MB.`);
          setSubmitting(false);
          return;
        }

        const reader = new FileReader();
        try {
          showreelUrl = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              if (reader.result) {
                resolve(reader.result as string);
              } else {
                reject(new Error('Failed to read video file'));
              }
            };
            reader.onerror = () => {
              reject(new Error('Failed to read video file'));
            };
            reader.readAsDataURL(showreelFile);
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Failed to convert video to base64';
          toast.error(errorMessage);
          setSubmitting(false);
          return;
        }
      }

      await createProjectMutation.mutateAsync({
        wall_id: wallId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        media_url: mediaUrl,
        media_type: formData.media_type,
        order_index: formData.order_index || 0,
        showreel_url: showreelUrl || undefined,
        showreel_type: showreelUrl ? formData.showreel_type : undefined
      });

      toast.success("Project created successfully!");
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        media_type: "image",
        order_index: 0,
        showreel_type: "embed",
        showreel_url: ""
      });
      setMediaPreview("");
      setShowreelFile(null);
      
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to create project";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={() => onOpenChange(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Project
      </Button>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter project title"
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your project..."
              rows={4}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Creature FX, Destruction FX, Character Animation"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="media_type">Media Type</Label>
            <Select
              value={formData.media_type}
              onValueChange={(value: "image" | "video") => setFormData({ ...formData, media_type: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="media">Media File</Label>
            <Input
              id="media"
              type="file"
              accept={formData.media_type === "video" ? "video/*" : "image/*"}
              onChange={handleMediaUpload}
              className="mt-2"
            />
            {mediaPreview && (
              <div className="mt-4">
                {formData.media_type === "video" ? (
                  <video src={mediaPreview} className="max-h-48 rounded-lg" controls />
                ) : (
                  <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-lg object-cover" />
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="order_index">Order Index</Label>
            <Input
              id="order_index"
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
              placeholder="Display order (0 = first)"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="showreel_type">Showreel Type (Optional)</Label>
            <Select
              value={formData.showreel_type}
              onValueChange={(value: "embed" | "upload") => setFormData({ ...formData, showreel_type: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="embed">Embed URL (YouTube/Vimeo)</SelectItem>
                <SelectItem value="upload">Upload Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.showreel_type === "embed" && (
            <div>
              <Label htmlFor="showreel_url">Showreel URL</Label>
              <Input
                id="showreel_url"
                type="url"
                value={formData.showreel_url}
                onChange={(e) => setFormData({ ...formData, showreel_url: e.target.value })}
                placeholder="https://youtube.com/embed/..."
                className="mt-2"
              />
            </div>
          )}

          {formData.showreel_type === "upload" && (
            <div>
              <Label htmlFor="showreel">Upload Showreel Video</Label>
              <Input
                id="showreel"
                type="file"
                accept="video/*"
                onChange={handleShowreelFileChange}
                className="mt-2"
              />
              {showreelFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {showreelFile.name}
              </p>
            )}
      </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !formData.title}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
    </div>
        </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Project Edit Dialog Component
const ProjectEditDialog = ({ 
  project, 
  onSuccess, 
  open, 
  onOpenChange 
}: { 
  project: {
    _id: string;
    title: string;
    description?: string;
    media_url?: string;
    media_type?: string;
    category?: string;
    showreel_url?: string;
    showreel_type?: string;
    order_index?: number;
  }; 
  onSuccess: () => void; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) => {
  const [formData, setFormData] = useState({
    title: project.title || "",
    description: project.description || "",
    category: project.category || "",
    media_type: (project.media_type || "image") as "image" | "video",
    order_index: project.order_index || 0,
    showreel_type: (project.showreel_type || "embed") as "embed" | "upload",
    showreel_url: project.showreel_url || ""
  });
  const [mediaPreview, setMediaPreview] = useState(project.media_url || "");
  const [showreelFile, setShowreelFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const updateProjectMutation = useUpdateProject();

  useEffect(() => {
    // Reset form when project changes
    setFormData({
      title: project.title || "",
      description: project.description || "",
      category: project.category || "",
      media_type: (project.media_type || "image") as "image" | "video",
      order_index: project.order_index || 0,
      showreel_type: (project.showreel_type || "embed") as "embed" | "upload",
      showreel_url: project.showreel_url || ""
    });
    setMediaPreview(project.media_url || "");
    setShowreelFile(null);
  }, [project]);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeMB = 50;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`Media file is too large. Maximum file size is ${maxSizeMB}MB.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.onerror = () => {
      toast.error('Failed to read media file');
    };
    reader.readAsDataURL(file);
  };

  const handleShowreelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setShowreelFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const mediaUrl = mediaPreview || project.media_url;
      let showreelUrl = formData.showreel_url;

      // Convert showreel video to base64 if it's a local upload
      if (showreelFile && formData.showreel_type === "upload") {
        const maxSizeMB = 50;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (showreelFile.size > maxSizeBytes) {
          toast.error(`Showreel video is too large. Maximum file size is ${maxSizeMB}MB.`);
          setSubmitting(false);
          return;
        }

        const reader = new FileReader();
        try {
          showreelUrl = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              if (reader.result) {
                resolve(reader.result as string);
              } else {
                reject(new Error('Failed to read video file'));
              }
            };
            reader.onerror = () => {
              reject(new Error('Failed to read video file'));
            };
            reader.readAsDataURL(showreelFile);
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Failed to convert video to base64';
          toast.error(errorMessage);
          setSubmitting(false);
          return;
        }
      }

      await updateProjectMutation.mutateAsync({
        id: project._id,
        data: {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          media_url: mediaUrl,
          media_type: formData.media_type,
          order_index: formData.order_index || 0,
          showreel_url: showreelUrl || undefined,
          showreel_type: showreelUrl ? formData.showreel_type : undefined
        }
      });

      toast.success("Project updated successfully!");
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to update project";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Project Title *</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter project title"
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your project..."
              rows={4}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="edit-category">Category</Label>
            <Input
              id="edit-category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Creature FX, Destruction FX, Character Animation"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="edit-media_type">Media Type</Label>
            <Select
              value={formData.media_type}
              onValueChange={(value: "image" | "video") => setFormData({ ...formData, media_type: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="edit-media">Media File (leave empty to keep current)</Label>
            <Input
              id="edit-media"
              type="file"
              accept={formData.media_type === "video" ? "video/*" : "image/*"}
              onChange={handleMediaUpload}
              className="mt-2"
            />
            {mediaPreview && (
              <div className="mt-4">
                {formData.media_type === "video" ? (
                  <video src={mediaPreview} className="max-h-48 rounded-lg" controls />
                ) : (
                  <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-lg object-cover" />
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="edit-order_index">Order Index</Label>
            <Input
              id="edit-order_index"
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
              placeholder="Display order (0 = first)"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="edit-showreel_type">Showreel Type (Optional)</Label>
            <Select
              value={formData.showreel_type}
              onValueChange={(value: "embed" | "upload") => setFormData({ ...formData, showreel_type: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="embed">Embed URL (YouTube/Vimeo)</SelectItem>
                <SelectItem value="upload">Upload Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.showreel_type === "embed" && (
            <div>
              <Label htmlFor="edit-showreel_url">Showreel URL</Label>
              <Input
                id="edit-showreel_url"
                type="url"
                value={formData.showreel_url}
                onChange={(e) => setFormData({ ...formData, showreel_url: e.target.value })}
                placeholder="https://youtube.com/embed/..."
                className="mt-2"
              />
            </div>
          )}

          {formData.showreel_type === "upload" && (
            <div>
              <Label htmlFor="edit-showreel">Upload Showreel Video (leave empty to keep current)</Label>
              <Input
                id="edit-showreel"
                type="file"
                accept="video/*"
                onChange={handleShowreelFileChange}
                className="mt-2"
              />
              {showreelFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {showreelFile.name}
                </p>
              )}
              {!showreelFile && project.showreel_url && (
                <p className="text-sm text-muted-foreground mt-2">
                  Current showreel will be kept
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !formData.title}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Project"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Team Member Dialog Component
const TeamMemberDialog = ({ 
  teamMember, 
  wallId, 
  onSuccess, 
  open, 
  onOpenChange 
}: { 
  teamMember: {
    _id: string;
    name: string;
    role: string;
    bio?: string;
    email?: string;
    experience_years?: number;
    skills?: string[];
    avatar_url?: string;
    social_links?: {
      linkedin?: string;
      twitter?: string;
      instagram?: string;
      website?: string;
      portfolio?: string;
    };
    order_index?: number;
  } | null; 
  wallId: string; 
  onSuccess: () => void; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) => {
  const isEdit = !!teamMember;
  const [formData, setFormData] = useState({
    name: teamMember?.name || "",
    role: teamMember?.role || "",
    bio: teamMember?.bio || "",
    email: teamMember?.email || "",
    experience_years: teamMember?.experience_years || 0,
    skills: teamMember?.skills?.join(", ") || "",
    order_index: teamMember?.order_index || 0,
    social_links: {
      linkedin: teamMember?.social_links?.linkedin || "",
      twitter: teamMember?.social_links?.twitter || "",
      instagram: teamMember?.social_links?.instagram || "",
      website: teamMember?.social_links?.website || "",
      portfolio: teamMember?.social_links?.portfolio || ""
    }
  });
  const [avatarPreview, setAvatarPreview] = useState(teamMember?.avatar_url || "");
  const [submitting, setSubmitting] = useState(false);
  const createTeamMemberMutation = useCreateTeamMember();
  const updateTeamMemberMutation = useUpdateTeamMember();

  useEffect(() => {
    if (open) {
      if (teamMember) {
        setFormData({
          name: teamMember.name || "",
          role: teamMember.role || "",
          bio: teamMember.bio || "",
          email: teamMember.email || "",
          experience_years: teamMember.experience_years || 0,
          skills: teamMember.skills?.join(", ") || "",
          order_index: teamMember.order_index || 0,
          social_links: {
            linkedin: teamMember.social_links?.linkedin || "",
            twitter: teamMember.social_links?.twitter || "",
            instagram: teamMember.social_links?.instagram || "",
            website: teamMember.social_links?.website || "",
            portfolio: teamMember.social_links?.portfolio || ""
          }
        });
        setAvatarPreview(teamMember.avatar_url || "");
      } else {
        // Reset form for new team member
        setFormData({
          name: "",
          role: "",
          bio: "",
          email: "",
          experience_years: 0,
          skills: "",
          order_index: 0,
          social_links: {
            linkedin: "",
            twitter: "",
            instagram: "",
            website: "",
            portfolio: ""
          }
        });
        setAvatarPreview("");
      }
    }
  }, [teamMember, open]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`Avatar image is too large. Maximum file size is ${maxSizeMB}MB.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.onerror = () => {
      toast.error('Failed to read avatar image');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.role.trim()) {
      toast.error("Role is required");
      return;
    }
    
    setSubmitting(true);

    try {
      const skillsArray = formData.skills
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const data: {
        wall_id: string;
        name: string;
        role: string;
        bio?: string;
        email?: string;
        experience_years?: number;
        skills?: string[];
        avatar_url?: string;
        social_links?: {
          linkedin?: string;
          twitter?: string;
          instagram?: string;
          website?: string;
          portfolio?: string;
        };
        order_index?: number;
      } = {
        wall_id: wallId,
        name: formData.name.trim(),
        role: formData.role.trim(),
        bio: formData.bio?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        experience_years: formData.experience_years || undefined,
        skills: skillsArray.length > 0 ? skillsArray : undefined,
        order_index: formData.order_index || 0,
        avatar_url: avatarPreview || undefined,
        social_links: Object.keys(formData.social_links).some(
          key => formData.social_links[key as keyof typeof formData.social_links]?.trim()
        ) ? {
          linkedin: formData.social_links.linkedin?.trim() || undefined,
          twitter: formData.social_links.twitter?.trim() || undefined,
          instagram: formData.social_links.instagram?.trim() || undefined,
          website: formData.social_links.website?.trim() || undefined,
          portfolio: formData.social_links.portfolio?.trim() || undefined,
        } : undefined
      };

      if (isEdit) {
        await updateTeamMemberMutation.mutateAsync({
          id: teamMember._id,
          data
        });
        toast.success("Team member updated successfully!");
      } else {
        await createTeamMemberMutation.mutateAsync(data);
        toast.success("Team member added successfully!");
      }

      // Reset form
      setFormData({
        name: "",
        role: "",
        bio: "",
        email: "",
        experience_years: 0,
        skills: "",
        order_index: 0,
        social_links: {
          linkedin: "",
          twitter: "",
          instagram: "",
          website: "",
          portfolio: ""
        }
      });
      setAvatarPreview("");
      
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Team member error:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { error?: string } } })?.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} team member`;
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="team-name">Name *</Label>
            <Input
              id="team-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Team member name"
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="team-role">Role *</Label>
            <Input
              id="team-role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g., VFX Supervisor, Compositor, 3D Artist"
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="team-bio">Bio</Label>
            <Textarea
              id="team-bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Brief description about the team member..."
              rows={3}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="team-email">Email</Label>
              <Input
                id="team-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="team@example.com"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="team-experience">Years of Experience</Label>
              <Input
                id="team-experience"
                type="number"
                min="0"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="team-skills">Skills (comma-separated)</Label>
            <Input
              id="team-skills"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="e.g., Compositing, 3D Modeling, Animation, VFX"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="team-avatar">Avatar Image</Label>
            <Input
              id="team-avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="mt-2"
            />
            {avatarPreview && (
              <div className="mt-4">
                <img src={avatarPreview} alt="Avatar preview" className="w-24 h-24 rounded-full object-cover border-2" />
              </div>
            )}
          </div>

          <div>
            <Label>Social Links</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label htmlFor="team-linkedin" className="text-xs">LinkedIn</Label>
                <Input
                  id="team-linkedin"
                  type="url"
                  value={formData.social_links.linkedin}
                  onChange={(e) => setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, linkedin: e.target.value }
                  })}
                  placeholder="https://linkedin.com/in/..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="team-twitter" className="text-xs">Twitter</Label>
                <Input
                  id="team-twitter"
                  type="url"
                  value={formData.social_links.twitter}
                  onChange={(e) => setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, twitter: e.target.value }
                  })}
                  placeholder="https://twitter.com/..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="team-instagram" className="text-xs">Instagram</Label>
                <Input
                  id="team-instagram"
                  type="url"
                  value={formData.social_links.instagram}
                  onChange={(e) => setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, instagram: e.target.value }
                  })}
                  placeholder="https://instagram.com/..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="team-website" className="text-xs">Website</Label>
                <Input
                  id="team-website"
                  type="url"
                  value={formData.social_links.website}
                  onChange={(e) => setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, website: e.target.value }
                  })}
                  placeholder="https://example.com"
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="team-portfolio" className="text-xs">Portfolio</Label>
                <Input
                  id="team-portfolio"
                  type="url"
                  value={formData.social_links.portfolio}
                  onChange={(e) => setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, portfolio: e.target.value }
                  })}
                  placeholder="https://portfolio.example.com"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="team-order">Display Order</Label>
            <Input
              id="team-order"
              type="number"
              min="0"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
              placeholder="0 (lower = first)"
              className="mt-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !formData.name || !formData.role}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? "Updating..." : "Adding..."}
                </>
              ) : (
                isEdit ? "Update Team Member" : "Add Team Member"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Awards Timeline Component
const AwardsTimeline = ({ awards }: { awards: string[] }) => {
  // Parse awards to extract year and award name
  // Support formats like:
  // - "Oscar for Best Visual Effects - 2023"
  // - "2023: VES Award for Outstanding Compositing"
  // - "VES Award (2022)"
  const parseAwards = (awardList: string[]): Array<{ year?: string; content: string }> => {
    const awardItems: Array<{ year?: string; content: string }> = [];
    
    // Regex patterns
    const yearAtEnd = /(.+?)\s*-\s*(\d{4})$/; // "Award Name - 2023"
    const yearAtStart = /^(\d{4})[:\-\s]+(.+)$/; // "2023: Award Name"
    const yearInParentheses = /(.+?)\s*\((\d{4})\)/; // "Award Name (2023)"
    
    awardList.forEach((award) => {
      let year: string | undefined;
      let content = award;
      
      // Try year at end first (most common format)
      const endMatch = award.match(yearAtEnd);
      if (endMatch) {
        content = endMatch[1].trim();
        year = endMatch[2];
      } else {
        // Try year at start
        const startMatch = award.match(yearAtStart);
        if (startMatch) {
          year = startMatch[1];
          content = startMatch[2].trim();
        } else {
          // Try year in parentheses
          const parenMatch = award.match(yearInParentheses);
          if (parenMatch) {
            content = parenMatch[1].trim();
            year = parenMatch[2];
          }
        }
      }
      
      awardItems.push({ year, content });
    });
    
    // Sort by year (newest first)
    return awardItems.sort((a, b) => {
      if (!a.year || !b.year) return 0;
      return parseInt(b.year) - parseInt(a.year);
    });
  };
  
  const timelineItems = parseAwards(awards);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto"
    >
      <div className="flex gap-0 items-start mt-12 mb-12">
        {/* Vertical Text Label */}
        <div className="flex-shrink-0 flex items-start justify-start" style={{ 
          width: '120px',
          position: 'relative',
          zIndex: 1,
          alignSelf: 'flex-start'
        }}>
          <div 
            className="text-vertical-outline-red text-4xl md:text-5xl lg:text-6xl"
            style={{ 
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              whiteSpace: 'nowrap',
              height: 'fit-content',
              width: 'fit-content',
              position: 'absolute',
              top: 130,
              left: '-100%',
              marginLeft: '-50px',
            }}
          >
            {'AWARDS'.split('').map((letter, index) => (
              <span key={index} className="letter inline-block">
                {letter === ' ' ? '\u00A0' : letter}
              </span>
            ))}
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 relative pl-0">
          {/* Vertical Timeline Line */}
          <div className="absolute left-0 md:left-32 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/70 to-primary/40 rounded-full" />
        
        {/* Timeline Items */}
        <div className="space-y-12">
          {timelineItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative flex items-start gap-8"
            >
              {/* Timeline Dot */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                className="absolute left-0 md:left-32 w-5 h-5 bg-primary rounded-full border-4 border-background shadow-lg transform -translate-x-1/2 z-10 flex items-center justify-center"
              >
                <Award className="w-3 h-3 text-background" />
              </motion.div>
              
              {/* Year (Left Side) */}
              {item.year ? (
                <div className="w-28 md:w-32 flex-shrink-0 pt-1">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                    className="text-right"
                  >
                    <div className="bg-primary/10 border-2 border-primary/40 rounded-lg px-4 py-3 shadow-md hover:bg-primary/20 transition-colors">
                      <span className="text-2xl md:text-3xl font-bold text-primary block">{item.year}</span>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="w-28 md:w-32 flex-shrink-0" />
              )}
              
              {/* Content (Right Side) */}
              <div className="flex-1 pt-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                >
                  <Card className="p-6 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-lg hover:shadow-xl group">
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-base md:text-lg leading-relaxed text-foreground font-medium">
                        {item.content}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
        </div>
      </div>
    </motion.div>
  );
};

// Journey Timeline Component
const JourneyTimeline = ({ content }: { content: string }) => {
  // Parse content to extract timeline items
  // Support formats like:
  // - "2020: Founded the studio..."
  // - "2020 - Founded the studio..."
  // - Plain text (fallback)
  const parseTimeline = (text: string): Array<{ year?: string; content: string }> => {
    const lines = text.split('\n').filter(line => line.trim());
    const timelineItems: Array<{ year?: string; content: string }> = [];
    
    // Regex to match year patterns: "2020:", "2020 -", "(2020)", etc.
    const yearPattern = /^(\d{4})[:\-\s]+(.+)$/;
    const yearInParentheses = /\((\d{4})\)/;
    
    let currentYear: string | undefined;
    let currentContent: string[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check if line starts with a year
      const yearMatch = trimmedLine.match(yearPattern);
      if (yearMatch) {
        // Save previous item if exists
        if (currentContent.length > 0) {
          timelineItems.push({
            year: currentYear,
            content: currentContent.join(' ').trim()
          });
          currentContent = [];
        }
        currentYear = yearMatch[1];
        currentContent.push(yearMatch[2]);
      } else {
        // Check if line contains year in parentheses
        const yearInParens = trimmedLine.match(yearInParentheses);
        if (yearInParens && !currentYear) {
          currentYear = yearInParens[1];
          currentContent.push(trimmedLine.replace(yearInParentheses, '').trim());
        } else {
          currentContent.push(trimmedLine);
        }
      }
    });
    
    // Add last item
    if (currentContent.length > 0) {
      timelineItems.push({
        year: currentYear,
        content: currentContent.join(' ').trim()
      });
    }
    
    // If no years found, treat as single paragraph
    if (timelineItems.length === 0 || timelineItems.every(item => !item.year)) {
      return [{ content: text }];
    }
    
    // Sort by year (newest first if years are found)
    return timelineItems.sort((a, b) => {
      if (!a.year || !b.year) return 0;
      return parseInt(b.year) - parseInt(a.year);
    });
  };
  
  const timelineItems = parseTimeline(content);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto"
    >
      <div className="flex gap-0 items-start mt-12 mb-12">
        {/* Vertical Text Label */}
        <div className="flex-shrink-0 flex items-start justify-start" style={{ 
          width: '120px',
          minHeight: '65vh',
          position: 'relative',
          zIndex: 1,
          alignSelf: 'flex-start'
        }}>
          <div 
            className="text-vertical-outline-red text-4xl md:text-5xl lg:text-6xl"
            style={{ 
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              whiteSpace: 'nowrap',
              height: 'fit-content',
              width: 'fit-content',
              position: 'absolute',
              top: 240,
              left: '-100%',
              marginLeft: '-160px',
            }}
          >
            {'OUR JOURNEY'.split('').map((letter, index) => (
              <span key={index} className="letter inline-block">
                {letter === ' ' ? '\u00A0' : letter}
              </span>
            ))}
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 relative pl-0">
          {/* Vertical Timeline Line */}
          <div className="absolute left-0 md:left-32 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/70 to-primary/40 rounded-full" />
        
        {/* Timeline Items */}
        <div className="space-y-12">
          {timelineItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative flex items-start gap-8"
            >
              {/* Timeline Dot */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                className="absolute left-0 md:left-32 w-5 h-5 bg-primary rounded-full border-4 border-background shadow-lg transform -translate-x-1/2 z-10 flex items-center justify-center"
              >
                <div className="w-2 h-2 bg-primary rounded-full" />
              </motion.div>
              
              {/* Year (Left Side) */}
              {item.year ? (
                <div className="w-28 md:w-32 flex-shrink-0 pt-1">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                    className="text-right"
                  >
                    <div className="bg-primary/10 border-2 border-primary/40 rounded-lg px-4 py-3 shadow-md hover:bg-primary/20 transition-colors">
                      <span className="text-2xl md:text-3xl font-bold text-primary block">{item.year}</span>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="w-28 md:w-32 flex-shrink-0" />
              )}
              
              {/* Content (Right Side) */}
              <div className="flex-1 pt-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                >
                  <Card className="p-6 md:p-8 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-lg hover:shadow-xl group">
                    <p className="text-base md:text-lg leading-relaxed text-foreground">
                      {item.content}
                    </p>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WallView;