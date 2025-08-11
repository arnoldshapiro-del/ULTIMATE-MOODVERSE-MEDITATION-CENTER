import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      if (sessionToken) {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/user`, {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Session expired or invalid
          localStorage.removeItem('session_token');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = () => {
    // Create a demo user for testing purposes
    const demoUser = {
      id: 'demo-user-123',
      email: 'demo@moodverse.com',
      full_name: 'Demo User',
      preferences: {
        theme: 'dark',
        notifications: true
      }
    };
    
    // Set demo session token
    localStorage.setItem('session_token', 'demo-token-123');
    setUser(demoUser);
    setIsAuthenticated(true);
    console.log('Demo login successful');
  };

  const login = () => {
    // Redirect to Emergent Auth with current URL as redirect
    const currentUrl = window.location.origin;
    const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(currentUrl)}`;
    window.location.href = authUrl;
  };

  const logout = async () => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      if (sessionToken) {
        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ session_token: sessionToken })
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('session_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Handle auth callback from Emergent
  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check both URL hash and search params for session_id
      const hash = window.location.hash;
      const search = window.location.search;
      
      console.log('Auth callback check:', { hash, search, fullUrl: window.location.href });
      
      let sessionIdMatch = hash.match(/session_id=([^&]*)/);
      
      // If not in hash, check search params
      if (!sessionIdMatch) {
        sessionIdMatch = search.match(/session_id=([^&]*)/);
      }
      
      // Also try URLSearchParams for more reliable parsing
      if (!sessionIdMatch) {
        const urlParams = new URLSearchParams(search);
        const sessionId = urlParams.get('session_id');
        if (sessionId) {
          sessionIdMatch = [null, sessionId]; // Format to match regex result
        }
      }
      
      if (sessionIdMatch) {
        const sessionId = sessionIdMatch[1];
        console.log('Found session ID:', sessionId);
        
        try {
          console.log('Calling auth session endpoint...');
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/session`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ session_id: sessionId })
          });

          console.log('Auth response status:', response.status);
          
          if (response.ok) {
            const authData = await response.json();
            console.log('Auth data received:', authData);
            
            if (authData.success) {
              localStorage.setItem('session_token', authData.session_token);
              setUser(authData.user);
              setIsAuthenticated(true);
              
              // Clear the hash and search params from URL
              window.history.replaceState({}, document.title, window.location.pathname);
              
              console.log('Authentication successful!');
            } else {
              console.error('Auth failed:', authData.message);
            }
          } else {
            console.error('Auth request failed:', response.status, await response.text());
          }
        } catch (error) {
          console.error('Auth callback error:', error);
        }
        
        setLoading(false);
      } else {
        console.log('No session_id found in URL');
        setLoading(false);
      }
    };

    // Add a small delay to ensure the page has fully loaded
    setTimeout(handleAuthCallback, 100);
  }, []);

  const value = {
    user,
    login,
    loginDemo,
    logout,
    isAuthenticated,
    loading,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };