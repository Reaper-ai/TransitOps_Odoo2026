"use client"

import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select"
import { ApiError, registerRequest } from "@/lib/api"
import { Logo } from "../../../public/Logo"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

const REGISTER_ROLES = [
  "Fleet Manager",
  "Driver",
  "Safety Officer",
  "Financial Analyst",
] as const

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<string>(REGISTER_ROLES[0])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await registerRequest(email, password, role)
      router.push("/login")
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Registration failed")
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
              Create account
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Register a new TransitOps user
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
              placeholder="you@example.com"
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
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">
              Role
            </label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {REGISTER_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
