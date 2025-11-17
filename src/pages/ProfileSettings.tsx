import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCurrentUser, useMyProfile, useUpdateProfile } from "@/lib/api-hooks";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, X, Upload } from "lucide-react";
import { toast } from "sonner";
import RatingStars from "@/components/RatingStars";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { data: currentUserData, isLoading: userLoading } = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    location: "",
    bio: "",
    associations: [] as string[],
    social_links: {
      twitter: "",
      linkedin: "",
      instagram: "",
      website: ""
    },
    brand_colors: {
      primary: "#ef4444",
      secondary: "#1a1a1a"
    },
    avatar_url: ""
  });

  const [currentAssociation, setCurrentAssociation] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const user = (currentUserData as { user?: unknown } | undefined)?.user;
  const loading = userLoading || profileLoading;

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

  useEffect(() => {
    if (profile) {
      setFormData({
        location: profile.location || "",
        bio: profile.bio || "",
        associations: profile.associations || [],
        social_links: profile.social_links || {
          twitter: "",
          linkedin: "",
          instagram: "",
          website: ""
        },
        brand_colors: profile.brand_colors || {
          primary: "#ef4444",
          secondary: "#1a1a1a"
        },
        avatar_url: profile.avatar_url || ""
      });
      setAvatarPreview(profile.avatar_url || "");
    }
  }, [profile]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB max)
    const maxSizeMB = 50;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`Avatar image is too large. Maximum file size is ${maxSizeMB}MB.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAvatarPreview(base64);
      setFormData({ ...formData, avatar_url: base64 });
    };
    reader.onerror = () => {
      toast.error('Failed to read avatar image file');
    };
    reader.readAsDataURL(file);
  };

  const addAssociation = () => {
    if (currentAssociation.trim()) {
      setFormData({
        ...formData,
        associations: [...formData.associations, currentAssociation.trim()]
      });
      setCurrentAssociation("");
    }
  };

  const removeAssociation = (index: number) => {
    setFormData({
      ...formData,
      associations: formData.associations.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateProfileMutation.mutateAsync({
        location: formData.location,
        bio: formData.bio,
        associations: formData.associations,
        social_links: formData.social_links,
        brand_colors: formData.brand_colors,
        avatar_url: formData.avatar_url
      });

      toast.success("Profile updated successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error?.message || "Failed to update profile");
    } finally {
      setSaving(false);
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
    <div className="min-h-screen bg-background">
      <Navbar user={user} profile={profile} />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div>
            <h1 className="text-4xl font-bold red-glow-intense mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">Update your profile information</p>
          </div>

          {/* Profile Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input value={profile?.name || ""} disabled className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">Name cannot be changed</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={profile?.email || ""} disabled className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
                {profile?.rating && (
                  <div>
                    <Label>Rating</Label>
                    <div className="mt-2">
                      <RatingStars rating={profile.rating} showBadge />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Rating is assigned by admin</p>
                  </div>
                )}
                {profile?.verification_status && (
                  <div>
                    <Label>Verification Status</Label>
                    <div className="mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        profile.verification_status === "approved"
                          ? "bg-green-500/20 text-green-400"
                          : profile.verification_status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {profile.verification_status.charAt(0).toUpperCase() + profile.verification_status.slice(1)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Los Angeles, CA"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about your studio..."
                    rows={6}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="avatar">Avatar</Label>
                  <div className="mt-2 space-y-2">
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                    {avatarPreview && (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="h-24 w-24 rounded-full object-cover border-2 border-primary/50"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Associations */}
            <Card>
              <CardHeader>
                <CardTitle>Associations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add an association (e.g., VES, MPC, Framestore)"
                    value={currentAssociation}
                    onChange={(e) => setCurrentAssociation(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAssociation())}
                  />
                  <Button type="button" onClick={addAssociation} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.associations.map((assoc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded">
                      <span className="text-sm">{assoc}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAssociation(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="twitter">Twitter URL</Label>
                  <Input
                    id="twitter"
                    type="url"
                    value={formData.social_links.twitter}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, twitter: e.target.value }
                    })}
                    placeholder="https://twitter.com/yourhandle"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.social_links.linkedin}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, linkedin: e.target.value }
                    })}
                    placeholder="https://linkedin.com/company/yourcompany"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram URL</Label>
                  <Input
                    id="instagram"
                    type="url"
                    value={formData.social_links.instagram}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, instagram: e.target.value }
                    })}
                    placeholder="https://instagram.com/yourhandle"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.social_links.website}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, website: e.target.value }
                    })}
                    placeholder="https://yourwebsite.com"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Brand Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <Input
                      id="primary-color"
                      type="color"
                      value={formData.brand_colors.primary}
                      onChange={(e) => setFormData({
                        ...formData,
                        brand_colors: { ...formData.brand_colors, primary: e.target.value }
                      })}
                      className="h-10 mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <Input
                      id="secondary-color"
                      type="color"
                      value={formData.brand_colors.secondary}
                      onChange={(e) => setFormData({
                        ...formData,
                        brand_colors: { ...formData.brand_colors, secondary: e.target.value }
                      })}
                      className="h-10 mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSettings;

