// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Doctor {
  id: string;
  doctorId: string;
  name: string;
  // Add any other doctor fields here
}

interface AuthContextType {
  isAuthenticated: boolean;
  doctor: Doctor | null;
  loading: boolean;
  login: (token: string, doctorData: Doctor) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('doctorToken');
    const storedDoctor = localStorage.getItem('doctorData');

    if (token && storedDoctor) {
      try {
        const doctorData: Doctor = JSON.parse(storedDoctor);
        setIsAuthenticated(true);
        setDoctor(doctorData);
      } catch (error) {
        console.error('Error parsing stored doctor data:', error);
        localStorage.removeItem('doctorToken');
        localStorage.removeItem('doctorData');
      }
    }

    setLoading(false);
  }, []);

  const login = (token: string, doctorData: Doctor) => {
    localStorage.setItem('doctorToken', token);
    localStorage.setItem('doctorData', JSON.stringify(doctorData));
    setIsAuthenticated(true);
    setDoctor(doctorData);
  };

  const logout = () => {
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorData');
    setIsAuthenticated(false);
    setDoctor(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    doctor,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
