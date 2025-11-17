import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCurrentUser, useCreateWall } from "@/lib/api-hooks";
import { uploadFile } from "@/lib/upload";
import { toast } from "sonner";
import { Loader2, Upload, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const wallSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  tagline: z.string().optional(),
  showreel_type: z.enum(["embed", "upload"]).optional(),
  showreel_url: z.string().optional(),
  journey_content: z.string().optional(),
});

type WallFormData = z.infer<typeof wallSchema>;

const WallCreate = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [logoPreview, setLogoPreview] = useState("");
  const [heroPreview, setHeroPreview] = useState("");
  const [showreelFile, setShowreelFile] = useState<File | null>(null);
  const [awards, setAwards] = useState<string[]>([]);
  const [currentAward, setCurrentAward] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    twitter: "",
    linkedin: "",
    instagram: "",
    website: ""
  });
  const [brandColors, setBrandColors] = useState({
    primary: "#ef4444",
    secondary: "#1a1a1a"
  });

  const form = useForm<WallFormData>({
    resolver: zodResolver(wallSchema),
    defaultValues: {
      title: "",
      description: "",
      tagline: "",
      showreel_type: "embed",
      showreel_url: "",
      journey_content: ""
    }
  });

  // React Query hooks
  const { data: currentUserData, isLoading: userLoading } = useCurrentUser();
  const createWallMutation = useCreateWall();

  const user = (currentUserData as { user?: unknown } | undefined)?.user;

  useEffect(() => {
    const hasToken = !!localStorage.getItem('token');
    if (!userLoading && !currentUserData && hasToken) {
      // Token exists but user data not loaded - might be invalid
      navigate("/auth");
    } else if (!hasToken && !userLoading) {
      // No token and not loading - not logged in
      navigate("/auth");
    }
  }, [userLoading, currentUserData, navigate]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max for images)
    const maxSizeMB = 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`Logo image is too large. Maximum file size is ${maxSizeMB}MB. Current file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      e.target.value = ''; // Clear the input
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.onerror = () => {
      toast.error('Failed to read logo image file');
    };
    reader.readAsDataURL(file);
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max for images)
    const maxSizeMB = 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`Hero image is too large. Maximum file size is ${maxSizeMB}MB. Current file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      e.target.value = ''; // Clear the input
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setHeroPreview(reader.result as string);
    };
    reader.onerror = () => {
      toast.error('Failed to read hero image file');
    };
    reader.readAsDataURL(file);
  };

  const handleShowreelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setShowreelFile(file);
    }
  };

  const addAward = () => {
    if (currentAward.trim()) {
      setAwards([...awards, currentAward.trim()]);
      setCurrentAward("");
    }
  };

  const removeAward = (index: number) => {
    setAwards(awards.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: WallFormData, published: boolean) => {
    if (!user) return;

    setSubmitting(true);
    try {
      // Use base64 directly from preview - no file upload needed
      // Backend will store base64 URLs directly in the database
      const logoUrl = logoPreview || "";
      const heroUrl = heroPreview || "";
      let showreelUrl = data.showreel_url;

      // Convert showreel video to base64 if it's a local upload
      if (showreelFile && data.showreel_type === "upload") {
        // Validate file size (50MB max)
        const maxSizeMB = 50;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (showreelFile.size > maxSizeBytes) {
          toast.error(`Showreel video is too large. Maximum file size is ${maxSizeMB}MB. Current file: ${(showreelFile.size / (1024 * 1024)).toFixed(2)}MB`);
          setSubmitting(false);
          return;
        }

        // Convert video file to base64
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
          const errorMessage = error instanceof Error ? error.message : 'Failed to convert video to base64';
          toast.error(errorMessage);
          setSubmitting(false);
          return;
        }
      }

      // Prepare payload - only include fields with values
      const payload: Record<string, unknown> = {
        title: data.title,
        published
      };

      // Only add optional fields if they have values
      if (data.description?.trim()) payload.description = data.description.trim();
      if (data.tagline?.trim()) payload.tagline = data.tagline.trim();
      if (logoUrl && logoUrl.trim()) payload.logo_url = logoUrl;
      if (heroUrl && heroUrl.trim()) {
        payload.hero_media_url = heroUrl;
        payload.hero_media_type = "image";
      }
      if (showreelUrl?.trim()) {
        payload.showreel_url = showreelUrl.trim();
        payload.showreel_type = data.showreel_type || "embed";
      }
      if (data.journey_content?.trim()) payload.journey_content = data.journey_content.trim();
      if (Object.keys(brandColors).length > 0) payload.brand_colors = brandColors;
      if (Object.values(socialLinks).some(link => link && link.trim())) payload.social_links = socialLinks;
      if (awards.length > 0) payload.awards = awards;

      console.log('Creating wall with payload:', {
        ...payload,
        logo_url: payload.logo_url && typeof payload.logo_url === 'string' ? `${payload.logo_url.substring(0, 50)}...` : 'empty',
        hero_media_url: payload.hero_media_url && typeof payload.hero_media_url === 'string' ? `${payload.hero_media_url.substring(0, 50)}...` : 'empty',
        showreel_url: payload.showreel_url && typeof payload.showreel_url === 'string' ? `${payload.showreel_url.substring(0, 50)}...` : 'empty'
      });

      await createWallMutation.mutateAsync(payload);

      toast.success(published ? "Wall published successfully!" : "Wall saved as draft!");
      navigate("/dashboard");
    } catch (error: unknown) {
      console.error('Error creating wall:', error);
      
      // Extract error message from response
      let errorMessage = "Failed to create wall";
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string; message?: string } } };
        if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div>
            <h1 className="text-4xl font-bold red-glow-intense mb-2">Create Your Wall</h1>
            <p className="text-muted-foreground">Build your digital presence and showcase your work</p>
          </div>

          <Form {...form}>
            <form className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wall Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter wall title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your wall..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <Label htmlFor="hero">Hero Image</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Maximum file size: 10MB. Supported formats: JPG, PNG, GIF, WebP
                    </p>
                    <Input
                      id="hero"
                      name="hero"
                      type="file"
                      accept="image/*"
                      onChange={handleHeroUpload}
                      className="mt-2"
                    />
                    {heroPreview && (
                      <img src={heroPreview} alt="Hero preview" className="mt-4 rounded-lg max-h-48 object-cover" />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Studio Identity */}
              <Card>
                <CardHeader>
                  <CardTitle>Studio Identity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="logo">Logo</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Maximum file size: 10MB. Supported formats: JPG, PNG, GIF, WebP, SVG
                    </p>
                    <Input
                      id="logo"
                      name="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="mt-2"
                    />
                    {logoPreview && (
                      <img src={logoPreview} alt="Logo preview" className="mt-4 h-24 w-auto object-contain" />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tagline</FormLabel>
                        <FormControl>
                          <Input placeholder="Your studio's tagline" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <Input
                        id="primary-color"
                        type="color"
                        value={brandColors.primary}
                        onChange={(e) => setBrandColors({ ...brandColors, primary: e.target.value })}
                        className="h-10 mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondary-color">Secondary Color</Label>
                      <Input
                        id="secondary-color"
                        type="color"
                        value={brandColors.secondary}
                        onChange={(e) => setBrandColors({ ...brandColors, secondary: e.target.value })}
                        className="h-10 mt-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Social Links</Label>
                    <Input
                      placeholder="Twitter URL"
                      value={socialLinks.twitter}
                      onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    />
                    <Input
                      placeholder="LinkedIn URL"
                      value={socialLinks.linkedin}
                      onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    />
                    <Input
                      placeholder="Instagram URL"
                      value={socialLinks.instagram}
                      onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                    />
                    <Input
                      placeholder="Website URL"
                      value={socialLinks.website}
                      onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Awards & Certifications</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add an award..."
                        value={currentAward}
                        onChange={(e) => setCurrentAward(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAward())}
                      />
                      <Button type="button" onClick={addAward} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {awards.map((award, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded">
                          <span className="text-sm">{award}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAward(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Main Showreel */}
              <Card>
                <CardHeader>
                  <CardTitle>Main Showreel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="showreel_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Showreel Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="embed">Embed URL (YouTube/Vimeo)</SelectItem>
                            <SelectItem value="upload">Upload Video</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("showreel_type") === "embed" && (
                    <FormField
                      control={form.control}
                      name="showreel_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://youtube.com/..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("showreel_type") === "upload" && (
                    <div>
                      <Label htmlFor="showreel">Upload Video</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Maximum file size: 50MB. Supported formats: MP4, WebM, MOV, AVI
                      </p>
                      <Input
                        id="showreel"
                        type="file"
                        accept="video/*"
                        onChange={handleShowreelFileChange}
                        className="mt-2"
                      />
                      {showreelFile && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Selected: {showreelFile.name} ({(showreelFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                      )}
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <Progress value={uploadProgress} className="mt-2" />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Studio Journey */}
              <Card>
                <CardHeader>
                  <CardTitle>Studio Journey</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="journey_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Story</FormLabel>
                        <FormDescription>Example (2020: Founded VFX Studios with a vision to revolutionize visual effects)</FormDescription>

                        <FormControl>
                          <Textarea
                            placeholder="Tell your studio's story, milestones, and journey..."
                            rows={6}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.handleSubmit((data) => onSubmit(data, false))()}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save as Draft"
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => form.handleSubmit((data) => onSubmit(data, true))()}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Publish Wall"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
};

export default WallCreate;
