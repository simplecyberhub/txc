import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "./queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  // Get current user
  const { isLoading, data } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    }
  }, [data]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => {
      const res = await apiRequest("POST", "/api/auth/login", {
        username,
        password,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setUser(data.user);
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        toast({
          title: "Login Successful",
          description: "Welcome back to TradeXCapital",
        });

        // Redirect based on user role
        if (data.user.isAdmin) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/auth/register", userData);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Registration Successful",
          description: "Please check your email to verify your account.",
        });
        navigate("/login");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description:
          error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("GET", "/api/auth/logout", undefined);
      return res.json();
    },
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      navigate("/login");
      toast({
        title: "Logout Successful",
        description: "You have been logged out of your account.",
      });
    },
    onError: () => {
      toast({
        title: "Logout Failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Email verification mutation
  const verifyEmailMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await apiRequest("POST", "/api/auth/verify-email", { token });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Email Verified",
          description:
            "Your email has been verified successfully. You can now login.",
        });
        navigate("/login");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description:
          error.message || "Failed to verify email. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Login function
  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  // Register function
  const register = async (userData: RegisterData) => {
    await registerMutation.mutateAsync(userData);
  };

  // Logout function
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Verify email function
  const verifyEmail = async (token: string) => {
    await verifyEmailMutation.mutateAsync(token);
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAdmin: user?.isAdmin || false,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    verifyEmail,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper function for auth queries
function getQueryFn<T>({ on401 }: { on401: "returnNull" | "throw" }) {
  return async ({ queryKey }: { queryKey: string[] }): Promise<T | null> => {
    try {
      const res = await fetch(queryKey[0], {
        credentials: "include",
      });

      if (on401 === "returnNull" && res.status === 401) {
        return null;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || res.statusText);
      }

      return await res.json();
    } catch (error) {
      if (on401 === "returnNull") {
        return null;
      }
      throw error;
    }
  };
}
