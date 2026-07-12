"use client"

import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { ApiError } from "@/lib/api"
import { useProfile } from "@/lib/ProfileContext"
import { Logo } from "../../../public/Logo"
import { FormEvent, useState } from "react"

export default function LoginPage() {
  const { login } = useProfile()
  const [email, setEmail] = useState("manager@transitops.com")
  const [password, setPassword] = useState("password123")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      window.location.href = "/dashboard"
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Login failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-925">
        <div className="mb-8 flex flex-col items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <Logo className="size-7" />
          </span>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
              TransitOps
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Sign in with your backend account
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  )
}
