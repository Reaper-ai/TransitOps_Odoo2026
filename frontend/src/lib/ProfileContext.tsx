"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  clearAuthSession,
  getStoredEmail,
  getStoredRole,
  getToken,
  loginRequest,
  setAuthSession,
} from "@/lib/api"

export interface Profile {
  id: string
  name: string
  email: string
  initials: string
  role: string
}

interface ProfileContextType {
  currentProfile: Profile | null
  token: string | null
  isAuthenticated: boolean
  isLoaded: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

function profileFromSession(email: string, role: string): Profile {
  const local = email.split("@")[0] || "User"
  return {
    id: email,
    name: local,
    email,
    initials: local.slice(0, 2).toUpperCase(),
    role,
  }
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const t = getToken()
    const email = getStoredEmail()
    const role = getStoredRole()
    if (t && email && role) {
      setToken(t)
      setCurrentProfile(profileFromSession(email, role))
    }
    setIsLoaded(true)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginRequest(email.trim(), password)
    setAuthSession(data.access_token, data.role, email.trim())
    setToken(data.access_token)
    setCurrentProfile(profileFromSession(email.trim(), data.role))
  }, [])

  const logout = useCallback(() => {
    clearAuthSession()
    setToken(null)
    setCurrentProfile(null)
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }, [])

  const value = useMemo(
    () => ({
      currentProfile,
      token,
      isAuthenticated: Boolean(token && currentProfile),
      isLoaded,
      login,
      logout,
    }),
    [currentProfile, token, isLoaded, login, logout],
  )

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}
