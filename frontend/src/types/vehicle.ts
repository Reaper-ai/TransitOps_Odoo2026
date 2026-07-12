export type VehicleStatus = "Available" | "On trip" | "In shop" | "Retired"

export type VehicleType = "Truck" | "Van" | "Pickup"

export interface Vehicle {
  registration_number: string
  name: string
  type: VehicleType
  capacity: number
  odometer: number
  acquisition_cost: number
  status: VehicleStatus
}

export interface VehicleCreate {
  registration_number: string
  name: string
  type: VehicleType
  capacity: number
  odometer: number
  acquisition_cost: number
  status: VehicleStatus
}

export interface VehicleUpdate {
  name?: string
  type?: VehicleType
  capacity?: number
  odometer?: number
  acquisition_cost?: number
  status?: VehicleStatus
}
