export type DriverStatus = "Available" | "On Trip" | "Off Duty" | "Suspended"

export interface Driver {
  license_number: string
  name: string
  license_category: string
  license_expiry_date: string
  contact_number: string
  safety_score: number
  status: DriverStatus | string
}

export interface DriverCreate {
  license_number: string
  name: string
  license_category: string
  license_expiry_date: string
  contact_number: string
  safety_score?: number
  status?: string
}
