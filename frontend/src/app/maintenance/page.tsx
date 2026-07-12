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
import { Maintenance, MaintenanceCreate, MaintenanceClose, MaintenanceStatus } from "@/types/maintenance"
import { Vehicle } from "@/types/vehicle"
import { BACKEND_URL } from "@/data/data"
import { useProfile } from "@/lib/ProfileContext"
import { getRoutePermission } from "@/lib/rbacConfig"

export default function MaintenancePage() {
  const { currentProfile } = useProfile()
  const [maintenanceRecords, setMaintenanceRecords] = useState<Maintenance[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showCloseForm, setShowCloseForm] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<Maintenance | null>(null)
  
  // Add maintenance form
  const [formData, setFormData] = useState<MaintenanceCreate>({
    vehicle_reg: "",
    description: "",
    cost: 0,
    start_date: "",
  })
  
  // Close maintenance form
  const [closeFormData, setCloseFormData] = useState<MaintenanceClose>({
    end_date: "",
  })
  
  // Vehicle search
  const [vehicleSearch, setVehicleSearch] = useState("")

  const canAddMaintenance = getRoutePermission(currentProfile?.role || "", "maintenance") === "read_write" || getRoutePermission(currentProfile?.role || "", "maintenance") === "admin"

  useEffect(() => {
    fetchMaintenanceRecords()
    fetchVehicles()
  }, [])

  const fetchMaintenanceRecords = async () => {
    try {
      setError(null)
      const response = await fetch(`${BACKEND_URL}/maintenance`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to fetch maintenance records (${response.status})`)
      }
      const data = await response.json()
      setMaintenanceRecords(data)
    } catch (error) {
      console.error("Failed to fetch maintenance records:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch maintenance records")
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/fleet/vehicles`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to fetch vehicles (${response.status})`)
      }
      const data = await response.json()
      setVehicles(data)
    } catch (error) {
      console.error("Failed to fetch vehicles:", error)
    }
  }

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canAddMaintenance) return

    try {
      setError(null)
      const response = await fetch(`${BACKEND_URL}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to add maintenance record (${response.status})`)
      }
      await fetchMaintenanceRecords()
      setShowAddForm(false)
      setFormData({
        vehicle_reg: "",
        description: "",
        cost: 0,
        start_date: "",
      })
      setVehicleSearch("")
    } catch (error) {
      console.error("Failed to add maintenance record:", error)
      setError(error instanceof Error ? error.message : "Failed to add maintenance record")
    }
  }

  const handleCloseMaintenance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRecord || !canAddMaintenance) return

    try {
      setError(null)
      const response = await fetch(`${BACKEND_URL}/maintenance/${selectedRecord.id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(closeFormData),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to close maintenance record (${response.status})`)
      }
      await fetchMaintenanceRecords()
      setShowCloseForm(false)
      setSelectedRecord(null)
      setCloseFormData({ end_date: "" })
    } catch (error) {
      console.error("Failed to close maintenance record:", error)
      setError(error instanceof Error ? error.message : "Failed to close maintenance record")
    }
  }

  const filteredVehicles = vehicles.filter((vehicle) =>
    vehicle.registration_number.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
    vehicle.name.toLowerCase().includes(vehicleSearch.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "closed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getMaintenanceStatus = (record: Maintenance): MaintenanceStatus => {
    if (!record.end_date) return "active"
    
    const endDate = new Date(record.end_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return endDate <= today ? "closed" : "active"
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Maintenance Management</h1>
          <p className="mt-2 text-gray-600">View and manage vehicle maintenance records here.</p>
        </div>
        {canAddMaintenance && (
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Add Record"}
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

      {/* Add Maintenance Form */}
      {showAddForm && canAddMaintenance && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <h2 className="mb-4 text-lg font-semibold">Add Maintenance Record</h2>
          <form onSubmit={handleAddMaintenance} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Vehicle Registration *
              </label>
              <div className="relative">
                <Input
                  required
                  value={vehicleSearch}
                  onChange={(e) => {
                    setVehicleSearch(e.target.value)
                    if (filteredVehicles.length === 1 && filteredVehicles[0].registration_number.toLowerCase() === e.target.value.toLowerCase()) {
                      setFormData({ ...formData, vehicle_reg: filteredVehicles[0].registration_number })
                    }
                  }}
                  placeholder="Search vehicle..."
                  className="mb-2"
                />
                {vehicleSearch && filteredVehicles.length > 0 && (
                  <div className="absolute z-10 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-950 max-h-60 overflow-y-auto">
                    {filteredVehicles.map((vehicle) => (
                      <div
                        key={vehicle.registration_number}
                        onClick={() => {
                          setFormData({ ...formData, vehicle_reg: vehicle.registration_number })
                          setVehicleSearch(vehicle.registration_number)
                        }}
                        className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <div className="font-medium">{vehicle.registration_number}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{vehicle.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {formData.vehicle_reg && (
                <p className="text-sm text-gray-600 dark:text-gray-400">Selected: {formData.vehicle_reg}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Description *
              </label>
              <Input
                required
                minLength={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Oil change, brake replacement"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Cost *
              </label>
              <Input
                required
                type="number"
                min="0"
                step="0.01"
                value={formData.cost || ""}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Start Date *
              </label>
              <Input
                required
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="flex items-end md:col-span-2 lg:col-span-3">
              <div className="flex gap-2">
                <Button type="submit">Add Record</Button>
                <Button variant="secondary" type="button" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Close Maintenance Form */}
      {showCloseForm && selectedRecord && canAddMaintenance && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <h2 className="mb-4 text-lg font-semibold">Close Maintenance Record</h2>
          <form onSubmit={handleCloseMaintenance} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-50">Vehicle</label>
              <p className="text-gray-700 dark:text-gray-300">{selectedRecord.vehicle_reg}</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-50">Description</label>
              <p className="text-gray-700 dark:text-gray-300">{selectedRecord.description}</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-50">Cost</label>
              <p className="text-gray-700 dark:text-gray-300">${selectedRecord.cost.toFixed(2)}</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-50">Start Date</label>
              <p className="text-gray-700 dark:text-gray-300">{formatDate(selectedRecord.start_date)}</p>
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
                End Date *
              </label>
              <Input
                required
                type="date"
                value={closeFormData.end_date}
                onChange={(e) => setCloseFormData({ ...closeFormData, end_date: e.target.value })}
              />
            </div>
            <div className="flex items-end md:col-span-2">
              <div className="flex gap-2">
                <Button type="submit">Close Record</Button>
                <Button variant="secondary" type="button" onClick={() => {
                  setShowCloseForm(false)
                  setSelectedRecord(null)
                  setCloseFormData({ end_date: "" })
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Service Log Table */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Vehicle Registration</TableHeaderCell>
              <TableHeaderCell>Description</TableHeaderCell>
              <TableHeaderCell>Cost</TableHeaderCell>
              <TableHeaderCell>Start Date</TableHeaderCell>
              <TableHeaderCell>End Date</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              {canAddMaintenance && <TableHeaderCell>Actions</TableHeaderCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading maintenance records...
                </TableCell>
              </TableRow>
            ) : maintenanceRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No maintenance records found
                </TableCell>
              </TableRow>
            ) : (
              maintenanceRecords.map((record) => {
                const status = getMaintenanceStatus(record)
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.vehicle_reg}</TableCell>
                    <TableCell>{record.description}</TableCell>
                    <TableCell>${record.cost.toFixed(2)}</TableCell>
                    <TableCell>{formatDate(record.start_date)}</TableCell>
                    <TableCell>{record.end_date ? formatDate(record.end_date) : "-"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </TableCell>
                    {canAddMaintenance && (
                      <TableCell>
                        {status === "active" && (
                          <Button
                            onClick={() => {
                              setSelectedRecord(record)
                              setShowCloseForm(true)
                            }}
                          >
                            Close
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
