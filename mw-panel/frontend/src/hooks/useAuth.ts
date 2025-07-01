import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated } = useAuthStore();
  return { user, isAuthenticated };
};