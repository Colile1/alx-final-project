
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('c_gardens_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('c_gardens_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('c_gardens_users') || '[]');
      const user = users.find(u => u.email === email);

      if (!user) {
        throw new Error('User not found');
      }

      // Simple password check (in production, use proper hashing)
      if (user.password !== password) {
        throw new Error('Invalid password');
      }

      const userSession = {
        id: user.id,
        email: user.email,
        name: user.name,
        lastLogin: new Date().toISOString()
      };

      setUser(userSession);
      localStorage.setItem('c_gardens_user', JSON.stringify(userSession));
      
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${user.name}`,
      });

      return userSession;
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      // Get existing users
      const users = JSON.parse(localStorage.getItem('c_gardens_users') || '[]');
      
      // Check if user already exists
      if (users.find(u => u.email === email)) {
        throw new Error('User already exists with this email');
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // In production, hash this
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('c_gardens_users', JSON.stringify(users));

      const userSession = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        lastLogin: new Date().toISOString()
      };

      setUser(userSession);
      localStorage.setItem('c_gardens_user', JSON.stringify(userSession));

      toast({
        title: "Account created!",
        description: `Welcome to C_Gardens, ${name}!`,
      });

      return userSession;
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('c_gardens_user');
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
