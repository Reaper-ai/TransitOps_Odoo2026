"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/** Analytics reuses dashboard KPIs for now */
export default function AnalyticsPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/dashboard")
  }, [router])
  return (
    <div className="p-6 text-sm text-gray-500">Redirecting to Dashboard...</div>
  )
}
