"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export type Role = "Admin" | "Manager" | "Auditor" | "Viewer"

export interface Profile {
  id: string
  name: string
  email: string
  initials: string
  role: Role
}

export const PROFILES: Profile[] = [
  {
    id: "1",
    name: "Emma Stone",
    email: "emma.stone@transitops.com",
    initials: "ES",
    role: "Admin",
  },
  {
    id: "2",
    name: "Harry Granger",
    email: "harry.granger@transitops.com",
    initials: "HG",
    role: "Manager",
  },
  {
    id: "3",
    name: "Hermione Weasley",
    email: "hermione.weasley@transitops.com",
    initials: "HW",
    role: "Auditor",
  },
  {
    id: "4",
    name: "Charlie Anuk",
    email: "charlie.anuk@transitops.com",
    initials: "CA",
    role: "Viewer",
  },
]

interface ProfileContextType {
  currentProfile: Profile
  profiles: Profile[]
  setCurrentProfile: (profile: Profile) => void
  isLoaded: boolean
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [currentProfile, setCurrentProfileState] = useState<Profile>(PROFILES[0])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedProfileId = localStorage.getItem("active_profile_id")
    if (savedProfileId) {
      const found = PROFILES.find((p) => p.id === savedProfileId)
      if (found) {
        setCurrentProfileState(found)
      }
    }
    setIsLoaded(true)
  }, [])

  const setCurrentProfile = (profile: Profile) => {
    setCurrentProfileState(profile)
    localStorage.setItem("active_profile_id", profile.id)
  }

  return (
    <ProfileContext.Provider value={{ currentProfile, profiles: PROFILES, setCurrentProfile, isLoaded }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}
