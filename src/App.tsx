import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react"; // Import lazy and Suspense
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/api-hooks";
import Layout from "./components/Layout";
import { Loader2 } from "lucide-react"; // Import Loader2 for fallback

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Browse = lazy(() => import("./pages/Browse"));
const WallView = lazy(() => import("./pages/WallView"));
const WallCreate = lazy(() => import("./pages/WallCreate"));
const WallEdit = lazy(() => import("./pages/WallEdit"));
const AdminVerifications = lazy(() => import("./pages/AdminVerifications"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));
const JobCreatePage = lazy(() => import("./pages/JobCreatePage"));
const JobsBrowsePage = lazy(() => import("./pages/JobsBrowsePage"));
const JobDetailPage = lazy(() => import("./pages/JobDetailPage"));
const JobEditPage = lazy(() => import("./pages/JobEditPage"));
const StudioJobsDashboard = lazy(() => import("./pages/StudioJobsDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AssociationsPage = lazy(() => import("./pages/AssociationsPage"));
const CreatorDetailsPage = lazy(() => import("./pages/CreatorDetailsPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Initialize Socket.IO client
const socket: Socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5001", {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

const AppContent = () => {
  const { data: currentUserData } = useCurrentUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentUserData?.user?.id) {
      socket.emit("register", currentUserData.user.id); // Register user with socket
    }

    // Association request received
    socket.on("newAssociationRequest", (association: any) => {
      const requesterName = association.requester?.profile?.name || association.requester?.name || "Someone";
      toast.info(`New association request from ${requesterName}!`);
      queryClient.invalidateQueries({ queryKey: ['pendingAssociations'] });
      queryClient.invalidateQueries({ queryKey: ['myAssociations'] });
    });

    // Association accepted
    socket.on("associationAccepted", (association: any) => {
      const recipientName = association.recipient?.profile?.name || association.recipient?.name || "Someone";
      toast.success(`${recipientName} accepted your association request!`);
      queryClient.invalidateQueries({ queryKey: ['pendingAssociations'] });
      queryClient.invalidateQueries({ queryKey: ['myAssociations'] });
    });

    // Association rejected
    socket.on("associationRejected", (data: { associationId: string; recipientId: string; recipientName?: string }) => {
      const recipientName = data.recipientName || "the recipient";
      toast.error(`Your association request to ${recipientName} was rejected.`);
      queryClient.invalidateQueries({ queryKey: ['pendingAssociations'] });
      queryClient.invalidateQueries({ queryKey: ['myAssociations'] });
    });

    return () => {
      socket.off("newAssociationRequest");
      socket.off("associationAccepted");
      socket.off("associationRejected");
    };
  }, [currentUserData, queryClient]);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center ">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
             
            </div>
          }
        >
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/wall/create" element={<WallCreate />} />
              <Route path="/wall/:id" element={<WallView />} />
              <Route path="/wall/:id/edit" element={<WallEdit />} />
              <Route path="/admin/verifications" element={<AdminVerifications />} />
              <Route path="/profile/settings" element={<ProfileSettings />} />
              <Route path="/jobs" element={<JobsBrowsePage />} />
              <Route path="/jobs/create" element={<JobCreatePage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />
              <Route path="/jobs/:id/edit" element={<JobEditPage />} />
              <Route path="/studio/jobs" element={<StudioJobsDashboard />} />
              <Route path="/associations" element={<AssociationsPage />} />
              <Route path="/creators/:id" element={<CreatorDetailsPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppContent />
  </QueryClientProvider>
);

export default App;