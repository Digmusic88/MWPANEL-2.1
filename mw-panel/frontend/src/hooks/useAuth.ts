// Temporary useAuth hook for calendar implementation
export const useAuth = () => {
  // Mock user data for now
  return {
    user: {
      id: '1',
      email: 'user@example.com',
      role: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User'
      }
    },
    isAuthenticated: true
  };
};