"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const UserContext = createContext();

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export const UserProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
  
      if (!token || !storedUser) {
        setUser(null);
        setIsLoggedIn(false);
        return;
      }
  
      let userData;
      try {
        userData = JSON.parse(storedUser);
      } catch (e) {
        console.error("Failed to parse stored user data:", e);
        handleLogout();
        return;
      }
  
      if (isTokenExpired(token)) {
        handleLogout();
        return;
      }
  
      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const login = (userData, token) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  const handleLogout = async () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    sessionStorage.clear();

    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });

    // Only redirect to auth if we're on a protected route
    const protectedRoutes = ['/dashboard', '/profile', '/settings'];
    if (protectedRoutes.some(route => window.location.pathname.startsWith(route))) {
      router.push("/auth");
    }
  };

  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  if (isLoading) {
    return null;
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn,
        isLoading,
        login,
        logout: handleLogout,
        updateUser,
        checkAuth,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
