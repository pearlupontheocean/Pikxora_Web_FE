import { getMyProfile } from "./api";

export type AppRole = 'admin' | 'artist' | 'investor' | 'studio';

export const getUserRoles = async (userId: string): Promise<AppRole[]> => {
  try {
    // Get current user profile to get roles
    const response = await getMyProfile();
    // For now, we'll get roles from the user object
    // This needs to be implemented based on your auth system
    return [];
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
};

export const getUserPrimaryRole = async (userId: string): Promise<AppRole | null> => {
  const roles = await getUserRoles(userId);
  return roles[0] || null;
};

export const hasRole = async (userId: string, role: AppRole): Promise<boolean> => {
  const roles = await getUserRoles(userId);
  return roles.includes(role);
};

export const addUserRole = async (userId: string, role: AppRole) => {
  // This will be implemented in the backend
  return { error: null };
};