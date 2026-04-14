"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "./api";

interface User {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role: string;
}

interface OtpRequestResult {
  phone: string;
  purpose: "register" | "login" | "reset";
  sms_sent: boolean;
  needs_verification?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  register: (name: string, phone: string, password: string, email?: string) => Promise<OtpRequestResult>;
  login: (phone: string, password: string) => Promise<OtpRequestResult>;
  verifyOtp: (phone: string, code: string, purpose: string) => Promise<User>;
  resendOtp: (phone: string, purpose: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      api.get("auth?action=me")
        .then((data) => setUser(data))
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const register = async (name: string, phone: string, password: string, email?: string) => {
    return await api.post("auth?action=register", { name, phone, password, email });
  };

  const login = async (phone: string, password: string) => {
    return await api.post("auth?action=login", { phone, password });
  };

  const verifyOtp = async (phone: string, code: string, purpose: string) => {
    const data = await api.post("auth?action=verify-otp", { phone, code, purpose });
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const resendOtp = async (phone: string, purpose: string) => {
    await api.post("auth?action=resend-otp", { phone, purpose });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, register, login, verifyOtp, resendOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
