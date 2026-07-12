export type VehicleStatus = "Available" | "On Trip" | "In Shop" | "Retired"

export type VehicleType = string

export interface Vehicle {
  registration_number: string
  model: string
  type: string
  max_load_capacity: number
  odometer: number
  acquisition_cost: number
  status: VehicleStatus | string
}

export interface VehicleCreate {
  registration_number: string
  model: string
  type: string
  max_load_capacity: number
  odometer: number
  acquisition_cost: number
  status?: string
}
