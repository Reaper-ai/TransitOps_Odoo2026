"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/Table"
import { Vehicle, VehicleStatus, VehicleType, VehicleCreate } from "@/types/vehicle"
import { BACKEND_URL } from "@/data/data"
import { useProfile } from "@/lib/ProfileContext"
import { getRoutePermission } from "@/lib/rbacConfig"

export default function FleetPage() {
  const { currentProfile } = useProfile()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "All">("All")
  const [typeFilter, setTypeFilter] = useState<VehicleType | "All">("All")
  const [capacityMin, setCapacityMin] = useState<number>(0)
  const [capacityMax, setCapacityMax] = useState<number>(10000)
  
  // Add vehicle form
  const [formData, setFormData] = useState<VehicleCreate>({
    registration_number: "",
    name: "",
    type: "Truck",
    capacity: 0,
    odometer: 0,
    acquisition_cost: 0,
    status: "Available",
  })

  const canAddVehicle = getRoutePermission(currentProfile?.role || "", "fleet") === "read_write" || getRoutePermission(currentProfile?.role || "", "fleet") === "admin"

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      setError(null)
      const response = await fetch(`${BACKEND_URL}/fleet/vehicles`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to fetch vehicles (${response.status})`)
      }
      const data = await response.json()
      setVehicles(data)
    } catch (error) {
      console.error("Failed to fetch vehicles:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch vehicles")
    } finally {
      setLoading(false)
    }
  }

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canAddVehicle) return

    try {
      setError(null)
      const response = await fetch(`${BACKEND_URL}/fleet/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to add vehicle (${response.status})`)
      }
      await fetchVehicles()
      setShowAddForm(false)
      setFormData({
        registration_number: "",
        name: "",
        type: "Truck",
        capacity: 0,
        odometer: 0,
        acquisition_cost: 0,
        status: "Available",
      })
    } catch (error) {
      console.error("Failed to add vehicle:", error)
      setError(error instanceof Error ? error.message : "Failed to add vehicle")
    }
  }

  const handleDeleteVehicle = async (regNum: string) => {
    if (!canAddVehicle) return
    
    if (!confirm("Are you sure you want to delete this vehicle?")) return

    try {
      setError(null)
      const response = await fetch(`${BACKEND_URL}/fleet/vehicles/${regNum}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to delete vehicle (${response.status})`)
      }
      await fetchVehicles()
    } catch (error) {
      console.error("Failed to delete vehicle:", error)
      setError(error instanceof Error ? error.message : "Failed to delete vehicle")
    }
  }

  const filteredVehicles = vehicles.filter((vehicle) => {
    if (statusFilter !== "All" && vehicle.status !== statusFilter) return false
    if (typeFilter !== "All" && vehicle.type !== typeFilter) return false
    if (vehicle.capacity < capacityMin || vehicle.capacity > capacityMax) return false
    return true
  })

  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "On trip":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "In shop":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Retired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fleet Management</h1>
          <p className="mt-2 text-gray-600">Manage vehicle fleet here.</p>
        </div>
        {canAddVehicle && (
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Add Vehicle"}
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

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
            Status
          </label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as VehicleStatus | "All")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="On trip">On trip</SelectItem>
              <SelectItem value="In shop">In shop</SelectItem>
              <SelectItem value="Retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
            Vehicle Type
          </label>
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as VehicleType | "All")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Truck">Truck</SelectItem>
              <SelectItem value="Van">Van</SelectItem>
              <SelectItem value="Pickup">Pickup</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[300px]">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
            Capacity (kg): {capacityMin.toLocaleString()} - {capacityMax.toLocaleString()}
          </label>
          <div className="relative h-8 flex items-center">
            <div className="absolute w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div 
              className="absolute h-2 bg-blue-500 rounded-lg"
              style={{
                left: `${(capacityMin / 10000) * 100}%`,
                width: `${((capacityMax - capacityMin) / 10000) * 100}%`
              }}
            ></div>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={capacityMin}
              onChange={(e) => {
                const newVal = parseInt(e.target.value)
                setCapacityMin(Math.min(newVal, capacityMax - 100))
              }}
              className="absolute w-full h-2 appearance-none cursor-pointer bg-transparent z-10"
              style={{ pointerEvents: 'auto' }}
            />
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={capacityMax}
              onChange={(e) => {
                const newVal = parseInt(e.target.value)
                setCapacityMax(Math.max(newVal, capacityMin + 100))
              }}
              className="absolute w-full h-2 appearance-none cursor-pointer bg-transparent z-10"
              style={{ pointerEvents: 'auto' }}
            />
          </div>
        </div>
      </div>

      {/* Add Vehicle Form */}
      {showAddForm && canAddVehicle && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <h2 className="mb-4 text-lg font-semibold">Add New Vehicle</h2>
          <form onSubmit={handleAddVehicle} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Registration Number *
              </label>
              <Input
                required
                value={formData.registration_number}
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                placeholder="e.g., AB00CD0000"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Vehicle Name *
              </label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Container Truck"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Vehicle Type *
              </label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as VehicleType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Truck">Truck</SelectItem>
                  <SelectItem value="Van">Van</SelectItem>
                  <SelectItem value="Pickup">Pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Capacity (KG) *
              </label>
              <Input
                required
                type="number"
                min="0"
                value={formData.capacity || ""}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                placeholder="Capacity in kg"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Odometer (km) *
              </label>
              <Input
                required
                type="number"
                min="0"
                value={formData.odometer || ""}
                onChange={(e) => setFormData({ ...formData, odometer: parseInt(e.target.value) || 0 })}
                placeholder="Current odometer reading"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Acquisition Cost *
              </label>
              <Input
                required
                type="number"
                min="0"
                step="0.01"
                value={formData.acquisition_cost || ""}
                onChange={(e) => setFormData({ ...formData, acquisition_cost: parseFloat(e.target.value) || 0 })}
                placeholder="Purchase cost"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Status *
              </label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as VehicleStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="On trip">On trip</SelectItem>
                  <SelectItem value="In shop">In shop</SelectItem>
                  <SelectItem value="Retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end md:col-span-2 lg:col-span-3">
              <div className="flex gap-2">
                <Button type="submit">Add Vehicle</Button>
                <Button variant="secondary" type="button" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Vehicles Table */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Registration Number</TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Capacity (KG)</TableHeaderCell>
              <TableHeaderCell>Odometer (km)</TableHeaderCell>
              <TableHeaderCell>Acquisition Cost</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              {canAddVehicle && <TableHeaderCell>Actions</TableHeaderCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading vehicles...
                </TableCell>
              </TableRow>
            ) : filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No vehicles found
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.registration_number}>
                  <TableCell className="font-medium">{vehicle.registration_number}</TableCell>
                  <TableCell>{vehicle.name}</TableCell>
                  <TableCell>{vehicle.type}</TableCell>
                  <TableCell>{vehicle.capacity}</TableCell>
                  <TableCell>{vehicle.odometer.toLocaleString()}</TableCell>
                  <TableCell>${vehicle.acquisition_cost.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </TableCell>
                  {canAddVehicle && (
                    <TableCell>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteVehicle(vehicle.registration_number)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
