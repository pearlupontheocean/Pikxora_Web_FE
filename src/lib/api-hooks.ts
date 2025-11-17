import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axios';

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
    cacheTime: 0, // Don't cache
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