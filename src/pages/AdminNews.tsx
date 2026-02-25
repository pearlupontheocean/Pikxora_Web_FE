import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  Newspaper,
  Plus,
  Trash2,
  Pencil,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import {
  useAdminNews,
  useCreateNews,
  useCurrentUser,
  useDeleteNews,
  useIndustryNews,
  useMyProfile,
  useUpdateNews,
  type IndustryNews,
} from "@/lib/api-hooks";
import { uploadFile } from "@/lib/upload";

const AdminNews = () => {
  const navigate = useNavigate();

  const { data: currentUserData, isLoading: userLoading } = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: news = [], isLoading: newsLoading, refetch } = useAdminNews();
  const { refetch: refetchPublicNews } = useIndustryNews(4);

  const createMutation = useCreateNews();
  const updateMutation = useUpdateNews();
  const deleteMutation = useDeleteNews();

  const [editingItem, setEditingItem] = useState<IndustryNews | null>(null);
  const [title, setTitle] = useState("");
  const [teaser, setTeaser] = useState("");
  const [category, setCategory] = useState("");
  const [link, setLink] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const user = currentUserData?.user;
  const loading = userLoading || profileLoading || newsLoading;

  useEffect(() => {
    const hasToken = !!localStorage.getItem("token");
    if (!hasToken && !userLoading) {
      navigate("/auth");
    } else if (hasToken && !userLoading && !currentUserData) {
      navigate("/auth");
    } else if (currentUserData && user && !user.roles?.includes("admin")) {
      navigate("/dashboard");
    }
  }, [currentUserData, user, userLoading, navigate]);

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setTeaser(editingItem.teaser);
      setCategory(editingItem.category || "");
      setLink(editingItem.link || "");
      setIsPublished(editingItem.is_published);
      setImageUrl(editingItem.image_url || "");
      setImageFile(null);
    } else {
      setTitle("");
      setTeaser("");
      setCategory("");
      setLink("");
      setIsPublished(true);
      setImageUrl("");
      setImageFile(null);
    }
  }, [editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !teaser.trim()) {
      toast.error("Title and teaser are required");
      return;
    }

    try {
      let finalImageUrl = imageUrl;

      if (imageFile && !finalImageUrl) {
        setIsUploadingImage(true);
        const { url, error } = await uploadFile(imageFile, "default", "news");
        setIsUploadingImage(false);

        if (error || !url) {
          toast.error(error?.message || "Failed to upload image");
          return;
        }

        finalImageUrl = url;
        setImageUrl(url);
        setImageFile(null);
      }

      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem._id,
          data: {
            title: title.trim(),
            teaser: teaser.trim(),
            category: category.trim() || undefined,
            link: link.trim() || undefined,
            image_url: finalImageUrl || undefined,
            is_published: isPublished,
          },
        });
        toast.success("News item updated");
      } else {
        await createMutation.mutateAsync({
          title: title.trim(),
          teaser: teaser.trim(),
          category: category.trim() || undefined,
          link: link.trim() || undefined,
          image_url: finalImageUrl || undefined,
          is_published: isPublished,
        });
        toast.success("News item created");
      }

      setEditingItem(null);
      await refetch();
      await refetchPublicNews();
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to save news item";
      toast.error(message);
      console.error("Error saving news:", error);
      setIsUploadingImage(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this news item? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("News item deleted");
      if (editingItem?._id === id) {
        setEditingItem(null);
      }
      await refetch();
      await refetchPublicNews();
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to delete news item";
      toast.error(message);
      console.error("Error deleting news:", error);
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
    <div className="min-h-screen">
      <Navbar user={user} profile={profile} />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold red-glow-intense mb-2">
                Industry News
              </h1>
              <p className="text-muted-foreground">
                Manage the Latest Industry Pulse content shown on the main page.
              </p>
            </div>
            <Button
              variant={editingItem ? "outline" : "default"}
              onClick={() => setEditingItem(null)}
              className="w-full md:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              {editingItem ? "Create New Item" : "New News Item"}
            </Button>
          </div>

          {/* Create / Edit form */}
          <Card className="p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">
                    {editingItem ? "Edit News Item" : "Create News Item"}
                  </h2>
                </div>
                <Badge
                  variant={isPublished ? "default" : "secondary"}
                  className="cursor-pointer select-none"
                  onClick={() => setIsPublished((prev) => !prev)}
                >
                  {isPublished ? "Published" : "Draft"}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Headline</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter news headline"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Technology, Awards, Community..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Teaser</label>
                <Textarea
                  value={teaser}
                  onChange={(e) => setTeaser(e.target.value)}
                  rows={3}
                  placeholder="Short teaser that appears on the landing section"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <ImageIcon className="h-4 w-4" />
                  Image (optional)
                </label>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setImageFile(file);
                      }}
                    />
                    {imageUrl && (
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-md overflow-hidden border border-border bg-muted">
                          <img
                            src={imageUrl}
                            alt="News"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setImageUrl("");
                            setImageFile(null);
                          }}
                        >
                          Remove image
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" />
                  Optional Link
                </label>
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                {editingItem && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingItem(null)}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending ||
                    updateMutation.isPending ||
                    isUploadingImage
                  }
                >
                  {(createMutation.isPending ||
                    updateMutation.isPending ||
                    isUploadingImage) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingItem ? "Save Changes" : "Create News"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Existing items */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Existing News Items</h2>

            {news.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <p className="text-muted-foreground">
                  No news items yet. Create one above to power the Latest Industry
                  Pulse section.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {news.map((item) => (
                  <Card
                    key={item._id}
                    className="p-4 flex flex-col justify-between border border-primary/20"
                  >
                    <div className="space-y-2">
                      {item.image_url && (
                        <div className="w-full mb-3">
                          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-md border border-border bg-muted">
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-lg line-clamp-2">
                          {item.title}
                        </h3>
                        <Badge
                          variant={item.is_published ? "default" : "secondary"}
                        >
                          {item.is_published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      {item.category && (
                        <p className="text-xs text-primary uppercase tracking-wide">
                          {item.category}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {item.teaser}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Updated:{" "}
                        {new Date(item.updatedAt || item.createdAt).toLocaleString()}
                      </p>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                        >
                          <LinkIcon className="h-3 w-3" />
                          Open link
                        </a>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingItem(item)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item._id)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3 mr-1" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminNews;

