export type MaintenanceStatus = "active" | "closed"

export interface Maintenance {
  id: string
  vehicle_reg: string
  description: string
  cost: number
  start_date: string
  end_date?: string
}

export interface MaintenanceCreate {
  vehicle_reg: string
  description: string
  cost: number
  start_date: string
}

export interface MaintenanceClose {
  end_date: string
}
