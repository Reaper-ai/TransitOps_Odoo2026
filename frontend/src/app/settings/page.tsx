"use client"

import { useProfile } from "@/lib/ProfileContext"
import { Button } from "@/components/Button"

export default function SettingsPage() {
  const { currentProfile, logout } = useProfile()

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="rounded-lg border p-4 dark:border-gray-800">
        <p className="text-sm text-gray-500">Signed in as</p>
        <p className="mt-1 font-medium">{currentProfile?.email}</p>
        <p className="text-sm text-gray-500">Role: {currentProfile?.role}</p>
        <Button className="mt-4" variant="secondary" onClick={logout}>
          Sign out
        </Button>
      </div>
    </div>
  )
}
