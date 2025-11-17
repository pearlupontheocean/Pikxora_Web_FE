const API_URL = import.meta.env.VITE_API_URL || 'http://195.35.7.60:5001/api';

let token: string | null = null;

// Set token for authenticated requests
export const setAuthToken = (authToken: string | null) => {
  token = authToken;
  if (authToken) {
    localStorage.setItem('token', authToken);
  } else {
    localStorage.removeItem('token');
  }
};

// Get token from localStorage
const getToken = () => {
  if (!token) {
    token = localStorage.getItem('token');
  }
  return token;
};

// Fetch wrapper with auth
const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = getToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  if (response.status === 401) {
    setAuthToken(null);
    window.location.href = '/auth';
    throw new Error('Unauthorized');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
};

// Auth API
export const signUp = async (email: string, password: string, name: string, role: string) => {
  const response = await fetchApi('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role }),
  });
  
  setAuthToken(response.token);
  return { user: response.user, token: response.token };
};

export const signIn = async (email: string, password: string) => {
  const response = await fetchApi('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  setAuthToken(response.token);
  return { user: response.user, token: response.token };
};

export const signOut = async () => {
  setAuthToken(null);
};

export const getCurrentUser = async () => {
  try {
    const response = await fetchApi('/auth/me');
    return {
      session: {
        user: {
          id: response.user.id,
          email: response.user.email,
        },
      },
      profile: response.profile,
    };
  } catch (error) {
    return { session: null, error };
  }
};

// Profile API
export const getProfile = async (userId: string) => {
  return fetchApi(`/profiles/${userId}`);
};

export const getMyProfile = async () => {
  return fetchApi('/profiles/me');
};

export const updateProfile = async (data: any) => {
  return fetchApi('/profiles/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const getPendingProfiles = async () => {
  return fetchApi('/profiles/pending');
};

export const verifyProfile = async (profileId: string, status: string, rating?: number) => {
  return fetchApi(`/profiles/${profileId}/verify`, {
    method: 'PUT',
    body: JSON.stringify({ verification_status: status, rating }),
  });
};

// Wall API
export const getWalls = async () => {
  return fetchApi('/walls');
};

export const getMyWalls = async () => {
  return fetchApi('/walls/my');
};

export const getWall = async (id: string) => {
  const wall = await fetchApi(`/walls/${id}`);
  // Increment view count
  try {
    await fetchApi(`/walls/${id}/view`, { method: 'PUT' });
  } catch (error) {
    // Silently fail view increment
  }
  return wall;
};

export const createWall = async (data: any) => {
  return fetchApi('/walls', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateWall = async (id: string, data: any) => {
  return fetchApi(`/walls/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteWall = async (id: string) => {
  return fetchApi(`/walls/${id}`, { method: 'DELETE' });
};

// Project API
export const getProjects = async (wallId: string) => {
  try {
    return fetchApi(`/projects/wall/${wallId}`);
  } catch (error) {
    return [];
  }
};

export const createProject = async (data: any) => {
  return fetchApi('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateProject = async (id: string, data: any) => {
  return fetchApi(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Upload API
export const uploadFile = async (file: File, folder: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  
  const token = getToken();
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Upload failed');
  }
  
  const result = await response.json();
  return result;
};
