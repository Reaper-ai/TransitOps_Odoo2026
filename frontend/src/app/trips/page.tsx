"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select"
import { Trip, TripStatus, TripCreate } from "@/types/trip"
import { BACKEND_URL } from "@/data/data"
import { useProfile } from "@/lib/ProfileContext"
import { getRoutePermission } from "@/lib/rbacConfig"

export default function TripsPage() {
  const { currentProfile } = useProfile()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  
  // Add trip form
  const [formData, setFormData] = useState<TripCreate>({
    source_name: "",
    destination_name: "",
    vehicle_reg: "",
    driver_license: "",
    cargo_weight: 0,
    planned_distance: 0,
    revenue: 0,
  })

  const canAddTrip = getRoutePermission(currentProfile?.role || "", "trips") === "read_write" || getRoutePermission(currentProfile?.role || "", "trips") === "admin"

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      setError(null)
      const response = await fetch(`${BACKEND_URL}/trips`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to fetch trips (${response.status})`)
      }
      const data = await response.json()
      setTrips(data)
    } catch (error) {
      console.error("Failed to fetch trips:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch trips")
    } finally {
      setLoading(false)
    }
  }

  const handleAddTrip = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canAddTrip) return

    try {
      setError(null)
      const response = await fetch(`${BACKEND_URL}/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to add trip (${response.status})`)
      }
      await fetchTrips()
      setShowAddForm(false)
      setFormData({
        source_name: "",
        destination_name: "",
        vehicle_reg: "",
        driver_license: "",
        cargo_weight: 0,
        planned_distance: 0,
        revenue: 0,
      })
    } catch (error) {
      console.error("Failed to add trip:", error)
      setError(error instanceof Error ? error.message : "Failed to add trip")
    }
  }

  const handleUpdateTripStatus = async (tripId: string, newStatus: TripStatus) => {
    if (!canAddTrip) return

    try {
      setError(null)
      const response = await fetch(`${BACKEND_URL}/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to update trip status (${response.status})`)
      }
      await fetchTrips()
      if (selectedTrip) {
        setSelectedTrip({ ...selectedTrip, status: newStatus })
      }
    } catch (error) {
      console.error("Failed to update trip status:", error)
      setError(error instanceof Error ? error.message : "Failed to update trip status")
    }
  }

  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      case "dispatched":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusBorderColor = (status: TripStatus) => {
    switch (status) {
      case "draft":
        return "border-gray-300 dark:border-gray-600"
      case "dispatched":
        return "border-blue-300 dark:border-blue-600"
      case "completed":
        return "border-green-300 dark:border-green-600"
      case "cancelled":
        return "border-red-300 dark:border-red-600"
      default:
        return "border-gray-300 dark:border-gray-600"
    }
  }

  const lifecycleSteps = [
    { status: "draft", label: "Draft" },
    { status: "dispatched", label: "Dispatched" },
    { status: "completed", label: "Completed" },
    { status: "cancelled", label: "Cancelled" },
  ] as const

  const getLifecycleIndex = (status: TripStatus) => {
    return lifecycleSteps.findIndex(step => step.status === status)
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trips Management</h1>
          <p className="mt-2 text-gray-600">View and manage trips here.</p>
        </div>
        {canAddTrip && (
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Add Trip"}
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2 text-red-600 dark:text-red-400">⚠</span>
              <p className="text-sm font-medium text-red-900 dark:text-red-100">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-sm font-medium text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Add Trip Form */}
      {showAddForm && canAddTrip && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <h2 className="mb-4 text-lg font-semibold">Add New Trip</h2>
          <form onSubmit={handleAddTrip} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Source *
              </label>
              <Input
                required
                value={formData.source_name}
                onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                placeholder="e.g., Warehouse A"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Destination *
              </label>
              <Input
                required
                value={formData.destination_name}
                onChange={(e) => setFormData({ ...formData, destination_name: e.target.value })}
                placeholder="e.g., Distribution Center B"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Vehicle Registration *
              </label>
              <Input
                required
                value={formData.vehicle_reg}
                onChange={(e) => setFormData({ ...formData, vehicle_reg: e.target.value })}
                placeholder="e.g., AB00CD0000"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Driver License *
              </label>
              <Input
                required
                value={formData.driver_license}
                onChange={(e) => setFormData({ ...formData, driver_license: e.target.value })}
                placeholder="e.g., DL123456789"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Cargo Weight (kg) *
              </label>
              <Input
                required
                type="number"
                min="0"
                step="0.1"
                value={formData.cargo_weight || ""}
                onChange={(e) => setFormData({ ...formData, cargo_weight: parseFloat(e.target.value) || 0 })}
                placeholder="Cargo weight in kg"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Planned Distance (km) *
              </label>
              <Input
                required
                type="number"
                min="0"
                step="0.1"
                value={formData.planned_distance || ""}
                onChange={(e) => setFormData({ ...formData, planned_distance: parseFloat(e.target.value) || 0 })}
                placeholder="Planned distance in km"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Revenue ($) *
              </label>
              <Input
                required
                type="number"
                min="0"
                step="0.01"
                value={formData.revenue || ""}
                onChange={(e) => setFormData({ ...formData, revenue: parseFloat(e.target.value) || 0 })}
                placeholder="Expected revenue"
              />
            </div>

            <div className="flex items-end md:col-span-2 lg:col-span-3">
              <div className="flex gap-2">
                <Button type="submit">Add Trip</Button>
                <Button variant="secondary" type="button" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Trips Board */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {["draft", "dispatched", "completed", "cancelled"].map((status) => (
          <div key={status} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
            <h3 className="mb-4 text-lg font-semibold capitalize">{status} ({trips.filter(t => t.status === status).length})</h3>
            <div className="space-y-3">
              {trips.filter(t => t.status === status).map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className={`cursor-pointer rounded-lg border-2 p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 ${selectedTrip?.id === trip.id ? getStatusBorderColor(trip.status) : "border-gray-200 dark:border-gray-800"}`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">{trip.source_name} → {trip.destination_name}</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(trip.status)}`}>
                      {trip.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Vehicle: {trip.vehicle_reg}</p>
                    <p>Driver: {trip.driver_license}</p>
                  </div>
                </div>
              ))}
              {trips.filter(t => t.status === status).length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No trips</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Trip Details with Lifecycle */}
      {selectedTrip && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Trip Details</h2>
            <Button variant="secondary" onClick={() => setSelectedTrip(null)}>
              Close
            </Button>
          </div>

          {/* Trip Lifecycle */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-sm font-medium text-gray-900 dark:text-gray-50">Trip Lifecycle</h3>
            <div className="flex items-center justify-between">
              {lifecycleSteps.map((step, index) => {
                const currentIndex = getLifecycleIndex(selectedTrip.status)
                const isCompleted = index <= currentIndex
                const isCurrent = step.status === selectedTrip.status
                
                return (
                  <React.Fragment key={step.status}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                          isCompleted
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500"
                        }`}
                      >
                        {isCompleted && (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`mt-2 text-sm ${isCurrent ? "font-medium text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>
                        {step.label}
                      </span>
                    </div>
                    {index < lifecycleSteps.length - 1 && (
                      <div
                        className={`mx-2 h-0.5 w-16 transition-colors ${
                          index < currentIndex ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>

          {/* Trip Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-50">Source</label>
              <p className="text-gray-700 dark:text-gray-300">{selectedTrip.source_name}</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-50">Destination</label>
              <p className="text-gray-700 dark:text-gray-300">{selectedTrip.destination_name}</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-50">Vehicle Registration</label>
              <p className="text-gray-700 dark:text-gray-300">{selectedTrip.vehicle_reg}</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-50">Driver License</label>
              <p className="text-gray-700 dark:text-gray-300">{selectedTrip.driver_license}</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-50">Cargo Weight</label>
              <p className="text-gray-700 dark:text-gray-300">{selectedTrip.cargo_weight} kg</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-50">Planned Distance</label>
              <p className="text-gray-700 dark:text-gray-300">{selectedTrip.planned_distance} km</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-50">Revenue</label>
              <p className="text-gray-700 dark:text-gray-300">${selectedTrip.revenue.toLocaleString()}</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-50">Status</label>
              <div className="flex items-center gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(selectedTrip.status)}`}>
                  {selectedTrip.status}
                </span>
                {canAddTrip && (
                  <Select
                    value={selectedTrip.status}
                    onValueChange={(value) => handleUpdateTripStatus(selectedTrip.id, value as TripStatus)}
                  >
                    <SelectTrigger className="h-7 w-7 p-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="dispatched">Dispatched</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center text-gray-600 dark:text-gray-400">
          Loading trips...
        </div>
      )}

      {/* Empty State */}
      {!loading && trips.length === 0 && (
        <div className="text-center text-gray-600 dark:text-gray-400">
          No trips found
        </div>
      )}
    </div>
  )
}
