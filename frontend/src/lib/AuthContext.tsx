'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { isAuthenticated } from './api';

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  checkAuth: () => void;
  successMessage: string;
  setSuccess: (msg: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [successMessage, setSuccess] = useState(""); // stores temp success message to show user

  const checkAuth = () => {
    setIsLoggedIn(isAuthenticated());
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, checkAuth, successMessage, setSuccess}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 