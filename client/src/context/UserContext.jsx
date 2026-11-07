import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('clickstar_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('clickstar_token') || null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [allUsers, setAllUsers] = useState([]);

  // Verify stored token or fetch users list
  useEffect(() => {
    // Check if we have token and user
    const storedToken = localStorage.getItem('clickstar_token');
    const storedUser = localStorage.getItem('clickstar_user');

    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        setToken(storedToken);
      } catch (e) {
        localStorage.removeItem('clickstar_user');
        localStorage.removeItem('clickstar_token');
        setCurrentUser(null);
        setToken(null);
      }
    } else {
      setCurrentUser(null);
      setToken(null);
    }

    // Load directory for demo or switcher
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setAllUsers(data.data);
        }
      })
      .catch(err => console.warn('Could not fetch directory:', err))
      .finally(() => {
        setLoadingAuth(false);
      });
  }, []);

  const saveAuth = (user, authToken) => {
    setCurrentUser(user);
    setToken(authToken);
    localStorage.setItem('clickstar_user', JSON.stringify(user));
    if (authToken) {
      localStorage.setItem('clickstar_token', authToken);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('clickstar_user');
    localStorage.removeItem('clickstar_token');
  };

  const switchUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem('clickstar_user', JSON.stringify(user));
  };

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      setCurrentUser, 
      token, 
      loadingAuth, 
      saveAuth, 
      logout, 
      switchUser, 
      allUsers 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
