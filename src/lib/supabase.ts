// Legacy export for backward compatibility
// This file now re-exports from the new API client
import * as api from "./api";

export const signUp = api.signUp;
export const signIn = api.signIn;
export const signOut = api.signOut;
export const getCurrentUser = api.getCurrentUser;

// Mock supabase export for components that still use it
export const supabase = {
  auth: {
    getSession: async () => {
      const result = await getCurrentUser();
      return { data: { session: result.session }, error: result.error };
    },
    signOut: async () => {
      await signOut();
      return { error: null };
    },
    onAuthStateChange: (callback: any) => {
      // Simple listener stub
      return { subscription: { unsubscribe: () => {} } };
    }
  },
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          // Mock implementation
          return { data: null, error: null };
        }
      })
    }),
    insert: (data: any) => ({
      then: async (callback: any) => {
        // Mock implementation
        return callback({ data: null, error: null });
      }
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        select: () => ({
          then: async (callback: any) => {
            // Mock implementation
            return callback({ data: [], error: null });
          }
        })
      })
    })
  }),
  channel: (name: string) => ({
    on: () => ({ subscribe: () => {} })
  }),
  removeChannel: () => {}
};
