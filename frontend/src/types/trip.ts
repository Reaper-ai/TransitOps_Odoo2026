export type TripStatus = "draft" | "dispatched" | "completed" | "cancelled"

export interface Trip {
  id: string
  source_name: string
  destination_name: string
  vehicle_reg: string
  driver_license: string
  cargo_weight: number
  planned_distance: number
  revenue: number
  status: TripStatus
}

export interface TripCreate {
  source_name: string
  destination_name: string
  vehicle_reg: string
  driver_license: string
  cargo_weight: number
  planned_distance: number
  revenue: number
}

export interface TripUpdate {
  source_name?: string
  destination_name?: string
  vehicle_reg?: string
  driver_license?: string
  cargo_weight?: number
  planned_distance?: number
  revenue?: number
  status?: TripStatus
}
