export type DriverStatus = "Available" | "On trip" | "On leave" | "Suspended"

export type LicenseCategory = "Light Motor Vehicle" | "Heavy Motor Vehicle" | "Commercial" | "Hazardous Materials"

export interface Driver {
  license_number: string
  name: string
  license_category: LicenseCategory
  license_expiry_date: string
  contact_number: string
  safety_score: number
  status: DriverStatus
}

export interface DriverCreate {
  license_number: string
  name: string
  license_category: LicenseCategory
  license_expiry_date: string
  contact_number: string
  safety_score: number
  status: DriverStatus
}

export interface DriverUpdate {
  name?: string
  license_category?: LicenseCategory
  license_expiry_date?: string
  contact_number?: string
  safety_score?: number
  status?: DriverStatus
}
