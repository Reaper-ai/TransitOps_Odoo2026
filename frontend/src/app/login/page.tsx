"use client"

import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { ApiError } from "@/lib/api"
import { useProfile } from "@/lib/ProfileContext"
import { Logo } from "../../../public/Logo"
import Link from "next/link"
import { FormEvent, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"

export default function LoginPage() {
  const { login } = useProfile()
  const { theme, setTheme } = useTheme()
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
          <div className="flex w-full justify-end">
            <button
              onClick={() => {
                if (theme === "light") setTheme("dark")
                else if (theme === "dark") setTheme("system")
                else setTheme("light")
              }}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              title="Toggle theme"
            >
              {theme === "light" && <Moon className="size-5" />}
              {theme === "dark" && <Sun className="size-5" />}
              {theme === "system" && <Monitor className="size-5" />}
            </button>
          </div>
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

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
