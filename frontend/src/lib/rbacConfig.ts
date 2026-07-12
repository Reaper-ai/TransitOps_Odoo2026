export type PermissionLevel = "no_access" | "read_only" | "read_write" | "admin"

export interface RoutePermissions {
  dashboard: PermissionLevel
  fleet: PermissionLevel
  drivers: PermissionLevel
  trips: PermissionLevel
  maintenance: PermissionLevel
  fuelAndExpenses: PermissionLevel
  analytics: PermissionLevel
  settings: PermissionLevel
}

export interface RoleConfig {
  name: string
  permissions: RoutePermissions
}

// Configurable RBAC - modify these permissions to control access for each role
export const RBAC_CONFIG: Record<string, RoleConfig> = {
  Admin: {
    name: "Admin",
    permissions: {
      dashboard: "admin",
      fleet: "admin",
      drivers: "admin",
      trips: "admin",
      maintenance: "admin",
      fuelAndExpenses: "admin",
      analytics: "admin",
      settings: "admin",
    },
  },
  FleetManager: {
    name: "Fleet Manager",
    permissions: {
      dashboard: "read_write",
      fleet: "read_write",
      drivers: "read_write",
      trips: "no_access",
      maintenance: "no_access",
      fuelAndExpenses: "no_access",
      analytics: "no_access",
      settings: "no_access",
    },
  },
  Dispatcher: {
    name: "Dispatcher",
    permissions: {
      dashboard: "read_write",
      fleet: "read_only",
      drivers: "no_access",
      trips: "read_write",
      maintenance: "no_access",
      fuelAndExpenses: "no_access",
      analytics: "no_access",
      settings: "no_access",
    },
  },
  SafetyOfficer: {
    name: "SafetyOfficer",
    permissions: {
      dashboard: "read_only",
      fleet: "no_access",
      drivers: "read_write",
      trips: "read_only",
      maintenance: "no_access",
      fuelAndExpenses: "no_access",
      analytics: "no_access",
      settings: "no_access",
    },
  },
  FinancialAnalyst: {
    name: "FinancialAnalyst",
    permissions: {
      dashboard: "read_only",
      fleet: "read_only",
      drivers: "no_access",
      trips: "no_access",
      maintenance: "no_access",
      fuelAndExpenses: "read_write",
      analytics: "read_write",
      settings: "no_access",
    },
  },
}

// Helper function to check if a role has access to a specific route
export function hasRouteAccess(role: string, route: keyof RoutePermissions): boolean {
  const roleConfig = RBAC_CONFIG[role]
  if (!roleConfig) return false
  const permission = roleConfig.permissions[route]
  return permission !== "no_access"
}

// Helper function to get permission level for a specific route
export function getRoutePermission(role: string, route: keyof RoutePermissions): PermissionLevel {
  const roleConfig = RBAC_CONFIG[role]
  if (!roleConfig) return "no_access"
  return roleConfig.permissions[route]
}

// Helper function to get all accessible routes for a role
export function getAccessibleRoutes(role: string): (keyof RoutePermissions)[] {
  const roleConfig = RBAC_CONFIG[role]
  if (!roleConfig) return []
  return Object.entries(roleConfig.permissions)
    .filter(([_, permission]) => permission !== "no_access")
    .map(([route]) => route as keyof RoutePermissions)
}
