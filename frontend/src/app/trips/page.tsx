"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/Table"
import { ApiError, apiRequest } from "@/lib/api"
import { useProfile } from "@/lib/ProfileContext"
import { canWrite } from "@/lib/rbacConfig"

type Destination = { name: string; region: string }
type Vehicle = {
  registration_number: string
  model: string
  max_load_capacity: number
  status: string
  odometer: number
}
type Driver = {
  license_number: string
  name: string
  status: string
  license_expiry_date: string
}
type Trip = {
  id: number
  source_name: string
  destination_name: string
  vehicle_reg: string
  driver_license: string
  cargo_weight: number
  planned_distance: number
  revenue: number
  status: string
}

export default function TripsPage() {
  const { currentProfile } = useProfile()
  const canManage = canWrite(currentProfile?.role || "", "trips")
  const [trips, setTrips] = useState<Trip[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [odometer, setOdometer] = useState("")
  const [completeId, setCompleteId] = useState<number | null>(null)
  const [form, setForm] = useState({
    source_name: "",
    destination_name: "",
    vehicle_reg: "",
    driver_license: "",
    cargo_weight: "",
    planned_distance: "",
    revenue: "0",
  })

  async function load() {
    try {
      setError(null)
      const [t, v, d, dest] = await Promise.all([
        apiRequest<Trip[]>("/trips/"),
        apiRequest<Vehicle[]>("/fleet/vehicles"),
        apiRequest<Driver[]>("/fleet/drivers"),
        apiRequest<Destination[]>("/destinations/"),
      ])
      setTrips(t)
      setVehicles(v)
      setDrivers(d)
      setDestinations(dest)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Failed to load trips")
    }
  }

  useEffect(() => {
    load()
  }, [])

  const availableVehicles = useMemo(
    () => vehicles.filter((v) => v.status === "Available"),
    [vehicles],
  )
  const availableDrivers = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return drivers.filter(
      (d) => d.status === "Available" && d.license_expiry_date > today,
    )
  }, [drivers])

  const selectedVehicle = vehicles.find(
    (v) => v.registration_number === form.vehicle_reg,
  )
  const overload =
    selectedVehicle && form.cargo_weight
      ? Number(form.cargo_weight) > selectedVehicle.max_load_capacity
      : false

  async function createTrip(e: React.FormEvent) {
    e.preventDefault()
    try {
      await apiRequest("/trips/", {
        method: "POST",
        body: {
          source_name: form.source_name,
          destination_name: form.destination_name,
          vehicle_reg: form.vehicle_reg,
          driver_license: form.driver_license,
          cargo_weight: Number(form.cargo_weight),
          planned_distance: Number(form.planned_distance),
          revenue: Number(form.revenue),
        },
      })
      setShowForm(false)
      setForm({
        source_name: "",
        destination_name: "",
        vehicle_reg: "",
        driver_license: "",
        cargo_weight: "",
        planned_distance: "",
        revenue: "0",
      })
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Failed to create trip")
    }
  }

  async function completeTrip() {
    if (completeId == null) return
    try {
      await apiRequest(
        `/trips/${completeId}/complete?final_odometer=${Number(odometer)}`,
        { method: "PUT" },
      )
      setCompleteId(null)
      setOdometer("")
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Failed to complete trip")
    }
  }

  async function cancelTrip(id: number) {
    if (!confirm("Cancel this trip?")) return
    try {
      await apiRequest(`/trips/${id}/cancel`, { method: "PUT" })
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Failed to cancel trip")
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "Dispatched":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trips</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Dispatch and trip lifecycle
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Create Trip"}
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {showForm && canManage && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <h2 className="mb-4 text-lg font-semibold">Create New Trip</h2>
          <form
            onSubmit={createTrip}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">Source *</label>
              <Select
                value={form.source_name}
                onValueChange={(v) => setForm({ ...form, source_name: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((d) => (
                    <SelectItem key={d.name} value={d.name}>
                      {d.name} ({d.region})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Destination *
              </label>
              <Select
                value={form.destination_name}
                onValueChange={(v) => setForm({ ...form, destination_name: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((d) => (
                    <SelectItem key={d.name} value={d.name}>
                      {d.name} ({d.region})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Available Vehicle *
              </label>
              <Select
                value={form.vehicle_reg}
                onValueChange={(v) => setForm({ ...form, vehicle_reg: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {availableVehicles.map((v) => (
                    <SelectItem
                      key={v.registration_number}
                      value={v.registration_number}
                    >
                      {v.registration_number} · {v.model} (
                      {v.max_load_capacity.toLocaleString()} kg)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Available Driver *
              </label>
              <Select
                value={form.driver_license}
                onValueChange={(v) => setForm({ ...form, driver_license: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {availableDrivers.map((d) => (
                    <SelectItem key={d.license_number} value={d.license_number}>
                      {d.name} ({d.license_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Cargo Weight (kg) *
              </label>
              <Input
                required
                type="number"
                min="0"
                placeholder="e.g., 450"
                value={form.cargo_weight}
                onChange={(e) =>
                  setForm({ ...form, cargo_weight: e.target.value })
                }
              />
              {selectedVehicle && (
                <p className="mt-1 text-xs text-gray-500">
                  Max capacity:{" "}
                  {selectedVehicle.max_load_capacity.toLocaleString()} kg
                </p>
              )}
              {overload && (
                <p className="mt-1 text-xs font-medium text-amber-600">
                  Cargo exceeds vehicle capacity
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Planned Distance (km) *
              </label>
              <Input
                required
                type="number"
                min="0"
                placeholder="e.g., 120"
                value={form.planned_distance}
                onChange={(e) =>
                  setForm({ ...form, planned_distance: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Revenue</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.revenue}
                onChange={(e) => setForm({ ...form, revenue: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-2 md:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={overload}>
                Dispatch Trip
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {completeId != null && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <h2 className="mb-4 text-lg font-semibold">
            Complete Trip #{completeId}
          </h2>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Final Odometer *
              </label>
              <Input
                type="number"
                placeholder="Must be higher than current"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
              />
            </div>
            <Button onClick={completeTrip}>Confirm Complete</Button>
            <Button variant="secondary" onClick={() => setCompleteId(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>ID</TableHeaderCell>
              <TableHeaderCell>Route</TableHeaderCell>
              <TableHeaderCell>Vehicle</TableHeaderCell>
              <TableHeaderCell>Driver</TableHeaderCell>
              <TableHeaderCell>Cargo</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No trips found
                </TableCell>
              </TableRow>
            ) : (
              trips.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">#{t.id}</TableCell>
                  <TableCell>
                    {t.source_name} → {t.destination_name}
                  </TableCell>
                  <TableCell>{t.vehicle_reg}</TableCell>
                  <TableCell>{t.driver_license}</TableCell>
                  <TableCell>{t.cargo_weight} kg</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(t.status)}`}
                    >
                      {t.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {t.status === "Dispatched" && (
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => setCompleteId(t.id)}
                        >
                          Complete
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => cancelTrip(t.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
