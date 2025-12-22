import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axios';
import { Job, JobFilters, JobCreateData, Bid, BidCreateData, BidStatusUpdate, ContractSummary, CurrentUser, Profile, DiscoverProfile } from '@/types/jobs';

// Auth API hooks
export const useCurrentUser = () => {
  // Only enable query if token exists
  const hasToken = !!localStorage.getItem('token');
  
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/auth/me');
        return response.data;
      } catch (error) {
        localStorage.removeItem('token');
        throw error;
      }
    },
    enabled: hasToken, // Only run if token exists
    retry: false,
    refetchOnMount: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 0, // Don't cache (renamed from cacheTime in RQ v5)
  });
};

export const useSignUp = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ email, password, name, role }: {
      email: string;
      password: string;
      name: string;
      role: string;
    }) => {
      const response = await axiosInstance.post('/auth/signup', {
        email,
        password,
        name,
        role,
      });
      
      // Store token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

export const useSignIn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await axiosInstance.post('/auth/signin', {
        email,
        password,
      });
      
      // Store token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem('token');
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.clear();
      queryClient.removeQueries();
    },
  });
};

// Profile hooks
export const useMyProfile = () => {
  return useQuery({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const response = await axiosInstance.get('/profiles/me');
      return response.data;
    },
    enabled: !!localStorage.getItem('token'),
  });
};

export const useDiscoverProfiles = (limit: number = 6, excludeUserIds: string[] = []) => {
  return useQuery<DiscoverProfile[]>({
    queryKey: ['discoverProfiles', limit, excludeUserIds],
    queryFn: async () => {
      const res = await axiosInstance.get('/profiles/discover', { params: { limit, excludeUserIds: excludeUserIds.join(',') } });
      return res.data;
    },
    enabled: !!localStorage.getItem('token'), // Ensure user is authenticated to fetch discovered profiles
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.put('/profiles/me', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

// Wall hooks
export const useWalls = () => {
  return useQuery({
    queryKey: ['walls'],
    queryFn: async () => {
      const response = await axiosInstance.get('/walls');
      return response.data;
    },
  });
};

export const useMyWalls = () => {
  return useQuery({
    queryKey: ['myWalls'],
    queryFn: async () => {
      const response = await axiosInstance.get('/walls/my');
      return response.data;
    },
    enabled: !!localStorage.getItem('token'),
  });
};

export const useWall = (id: string) => {
  return useQuery({
    queryKey: ['wall', id],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/walls/${id}`);
        // Increment view count
        try {
          await axiosInstance.put(`/walls/${id}/view`);
        } catch (error) {
          // Silently fail
          console.error('Failed to increment view count:', error);
        }
        return response.data;
      } catch (error: any) {
        console.error('Error fetching wall:', error);
        throw error;
      }
    },
    enabled: !!id,
    retry: 1,
  });
};

export const useCreateWall = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/walls', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myWalls'] });
    },
  });
};

export const useUpdateWall = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await axiosInstance.put(`/walls/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myWalls'] });
    },
  });
};

// Admin hooks
export const usePendingProfiles = () => {
  return useQuery({
    queryKey: ['pendingProfiles'],
    queryFn: async () => {
      const response = await axiosInstance.get('/profiles/pending');
      return response.data;
    },
    enabled: !!localStorage.getItem('token'),
  });
};

export const useVerifyProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, verification_status, rating }: {
      id: string;
      verification_status: string;
      rating?: number;
    }) => {
      const response = await axiosInstance.put(`/profiles/${id}/verify`, {
        verification_status,
        rating,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['approvedProfiles'] });
    },
  });
};

export const useApprovedProfiles = () => {
  return useQuery({
    queryKey: ['approvedProfiles'],
    queryFn: async () => {
      const response = await axiosInstance.get('/profiles');
      return response.data.filter((p: any) => p.verification_status === 'approved');
    },
    enabled: !!localStorage.getItem('token'),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Project hooks
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/projects', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate projects query - will need to refetch manually
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await axiosInstance.put(`/projects/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Export getProjects for WallView
export const useWallsByUser = (userId: string) => {
  return useQuery({
    queryKey: ['wallsByUser', userId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/walls/user/${userId}`);
      return response.data;
    },
    enabled: !!userId, // Only fetch if userId is provided
  });
};

export const useProjectsByUser = (userId: string) => {
  return useQuery({
    queryKey: ['projectsByUser', userId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/projects/user/${userId}`);
      return response.data;
    },
    enabled: !!userId, // Only fetch if userId is provided
  });
};

// Export getProjects for WallView
export const getProjects = async (wallId: string) => {
  try {
    const response = await axiosInstance.get(`/projects/wall/${wallId}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

// Team Member Hooks
export const useTeamMembers = (wallId: string) => {
  return useQuery({
    queryKey: ['teamMembers', wallId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/team/wall/${wallId}`);
      return response.data;
    },
    enabled: !!wallId,
  });
};

export const useCreateTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
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
    }) => {
      const response = await axiosInstance.post('/team', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
  });
};

export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: {
      name?: string;
      role?: string;
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
    } }) => {
      const response = await axiosInstance.put(`/team/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
  });
};

export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/team/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
  });
};

export const useUserProfile = (userId: string) => {
  return useQuery<CurrentUser>({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/profiles/user/${userId}`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Jobs API hooks
export const useJobs = (filters: JobFilters = {}) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axiosInstance.get(`/jobs?${params}`);
      return response.data as Job[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/jobs/${id}`);
      return response.data as Job;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: JobCreateData) => {
      const response = await axiosInstance.post('/jobs', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<JobCreateData> }) => {
      const response = await axiosInstance.put(`/jobs/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', data.job._id] });
      // Also refetch the specific job to ensure it's updated
      queryClient.refetchQueries({ queryKey: ['job', data.job._id] });
    },
  });
};

export const usePublishJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.put(`/jobs/${id}/publish`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job'] });
    },
  });
};

export const useBidsForJob = (jobId: string) => {
  return useQuery({
    queryKey: ['bids', 'job', jobId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/bids/job/${jobId}`);
      return response.data as Bid[];
    },
    enabled: !!jobId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useMyBids = () => {
  return useQuery({
    queryKey: ['bids', 'my'],
    queryFn: async () => {
      const response = await axiosInstance.get('/bids/my');
      return response.data as Bid[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BidCreateData) => {
      const response = await axiosInstance.post('/bids', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bids', 'job', data.bid.job_id] });
      queryClient.invalidateQueries({ queryKey: ['bids', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['job', data.bid.job_id] });
    },
  });
};

export const useUpdateBidStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BidStatusUpdate }) => {
      const response = await axiosInstance.put(`/bids/${id}/status`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bids', 'job', data.bid.job_id] });
      queryClient.invalidateQueries({ queryKey: ['bids', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['job', data.bid.job_id] });
    },
  });
};

export const useContracts = () => {
  return useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const response = await axiosInstance.get('/contracts');
      return response.data as ContractSummary[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Association hooks
interface Association {
  _id: string;
  requester: {
    _id: string;
    name: string;
    email: string;
    roles: string[];
    profile_picture?: string; // Add profile_picture
    profile?: { // Add nested profile object
      location?: string;
      rating?: number;
      wall_id?: string;
      updatedAt?: string; // Add this
    };
    lastActivityTimestamp?: string; // Add this
    lastActivityType?: string;      // Add this

  };
  recipient: {
    _id: string;
    name: string;
    email: string;
    roles: string[];
    profile_picture?: string; // Add profile_picture
    profile?: { // Add nested profile object
      location?: string;
      rating?: number;
      wall_id?: string;
      updatedAt?: string; // Add this
    };
    lastActivityTimestamp?: string; // Add this
    lastActivityType?: string;      // Add this

  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export const useMyAssociations = () => {
  return useQuery<Association[]>({
    queryKey: ['myAssociations'],
    queryFn: async () => {
      const response = await axiosInstance.get('/associations/connected');
      return response.data;
    },
    enabled: !!localStorage.getItem('token'),
  });
};

export const usePendingAssociations = () => {
  return useQuery<Association[]>({
    queryKey: ['pendingAssociations'],
    queryFn: async () => {
      const response = await axiosInstance.get('/associations/pending');
      return response.data;
    },
    enabled: !!localStorage.getItem('token'),
  });
};

export const useSendAssociationRequest = (options?: any) => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string, unknown>({ // Explicitly define TData, TError, TVariables, TContext
    mutationFn: async (recipientProfileId: string) => {
      const response = await axiosInstance.post('/associations/request', { recipientProfileId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingAssociations'] }); // Invalidate for recipient
      queryClient.invalidateQueries({ queryKey: ['myAssociations'] }); // Also invalidate myAssociations
    },
    ...options,
  });
};

export const useRespondToAssociation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'accept' | 'reject' }) => {
      const response = await axiosInstance.put(`/associations/${action}/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingAssociations'] });
      queryClient.invalidateQueries({ queryKey: ['myAssociations'] });
    },
  });
};

export const useRemoveAssociation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/associations/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAssociations'] });
    },
  });
};
