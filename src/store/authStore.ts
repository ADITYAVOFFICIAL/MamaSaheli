import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getCurrentUser, login as appwriteLogin, logout, createAccount } from '@/lib/appwrite';
import { Models } from 'appwrite';

type User = Models.User<Models.Preferences>;

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, name: string, hospitalId?: string, hospitalName?: string) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      login: async (email: string, password: string): Promise<User> => {
        try {
          set({ isLoading: true, error: null });
          await appwriteLogin(email, password);
          const currentUser = await getCurrentUser();
          if (!currentUser) {
            throw new Error("Login succeeded but failed to fetch user data.");
          }
          set({
            user: currentUser,
            isAuthenticated: !!currentUser,
            isLoading: false
          });
          return currentUser;
        } catch (error: any) {
          const errorMessage = error.message || 'Login failed. Please check your credentials.';
          set({
            isLoading: false,
            error: errorMessage
          });
          throw error;
        }
      },

      signup: async (email: string, password: string, name: string, hospitalId?: string, hospitalName?: string): Promise<User> => {
        try {
          set({ isLoading: true, error: null });
          await createAccount(email, password, name, hospitalId, hospitalName);
          const currentUser = await getCurrentUser();
          if (!currentUser) {
            throw new Error("Signup succeeded but failed to fetch user data.");
          }
          set({
            user: currentUser,
            isAuthenticated: !!currentUser,
            isLoading: false
          });
          return currentUser;
        } catch (error: any) {
          const errorMessage = error.message || 'Signup failed. Please try again.';
          set({
            isLoading: false,
            error: errorMessage
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await logout();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Logout failed. Please try again.'
          });
        }
      },

      checkAuth: async () => {
        if (get().isLoading || get().user === null) {
             try {
                const currentUser = await getCurrentUser();
                set({
                   user: currentUser,
                   isAuthenticated: !!currentUser,
                   isLoading: false,
                   error: null
                });
             } catch (error) {
                set({
                   user: null,
                   isAuthenticated: false,
                   isLoading: false,
                });
             }
        } else {
             if (get().isLoading) {
                 set({ isLoading: false });
             }
        }
      },

      setError: (error: string | null) => {
        set({ error });
      }
    }),
    {
      name: 'mamasaheli-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);