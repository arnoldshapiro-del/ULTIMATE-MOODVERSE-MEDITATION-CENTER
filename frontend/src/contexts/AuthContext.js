import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('moodverse_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // In demo mode, create a mock user
      const demoUser = {
        id: 'demo_user_123',
        name: 'Demo User',
        email: 'demo@moodverse.app',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=demo`,
        joinDate: new Date().toISOString(),
        preferences: {
          theme: 'cosmic',
          notifications: true,
          privacy: 'friends',
          dataSharing: false
        },
        stats: {
          totalEntries: 0,
          currentStreak: 0,
          longestStreak: 0,
          level: 1,
          experience: 0,
          achievementsUnlocked: 0
        }
      };

      setUser(demoUser);
      setIsAuthenticated(true);
      localStorage.setItem('moodverse_user', JSON.stringify(demoUser));
      
      return { success: true, user: demoUser };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      // In a real app, this would call your registration API
      const newUser = {
        id: `user_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
        joinDate: new Date().toISOString(),
        preferences: {
          theme: 'cosmic',
          notifications: true,
          privacy: 'friends',
          dataSharing: false
        },
        stats: {
          totalEntries: 0,
          currentStreak: 0,
          longestStreak: 0,
          level: 1,
          experience: 0,
          achievementsUnlocked: 0
        }
      };

      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('moodverse_user', JSON.stringify(newUser));
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('moodverse_user');
    localStorage.removeItem('moodverse_data');
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('moodverse_user', JSON.stringify(updatedUser));
  };

  const updatePreferences = (preferences) => {
    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, ...preferences }
    };
    setUser(updatedUser);
    localStorage.setItem('moodverse_user', JSON.stringify(updatedUser));
  };

  const updateStats = (stats) => {
    const updatedUser = {
      ...user,
      stats: { ...user.stats, ...stats }
    };
    setUser(updatedUser);
    localStorage.setItem('moodverse_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    updatePreferences,
    updateStats
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };