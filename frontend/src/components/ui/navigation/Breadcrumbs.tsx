"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const labels: Record<string, string> = {
  dashboard: "Dashboard",
  fleet: "Fleet",
  drivers: "Drivers",
  trips: "Trips",
  maintenance: "Maintenance",
  "fuel-and-expenses": "Fuel & Expenses",
  analytics: "Analytics",
  settings: "Settings",
  login: "Login",
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segment = pathname.split("/").filter(Boolean)[0] || "dashboard"
  const label = labels[segment] || segment

  return (
    <nav aria-label="Breadcrumb" className="ml-2">
      <ol role="list" className="flex items-center space-x-3 text-sm">
        <li className="flex">
          <Link
            href="/dashboard"
            className="text-gray-500 transition hover:text-gray-700 dark:text-gray-400 hover:dark:text-gray-300"
          >
            Home
          </Link>
        </li>
        <ChevronRight
          className="size-4 shrink-0 text-gray-600 dark:text-gray-400"
          aria-hidden="true"
        />
        <li className="flex">
          <span className="text-gray-900 dark:text-gray-50">{label}</span>
        </li>
      </ol>
    </nav>
  )
}
