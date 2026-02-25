import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Validate token and get user info
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Invalid token');
      })
      .then(userData => setUser(userData))
      .catch(() => logout())
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const signup = async (businessName, email, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_name: businessName, email, password }),
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
