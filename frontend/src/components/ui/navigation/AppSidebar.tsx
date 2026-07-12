"use client"
import { Divider } from "@/components/Divider"
import { Input } from "@/components/Input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarLink,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarSubLink,
} from "@/components/Sidebar"
import { cx, focusRing } from "@/lib/utils"
import { RiArrowDownSFill } from "@remixicon/react"
import { Gauge, Truck, PersonStanding, Route, Wrench, Fuel, ChartColumn, Settings } from "lucide-react"
import * as React from "react"
import { Logo } from "../../../../public/Logo"
import { UserProfile } from "./UserProfile"
import { useProfile } from "@/lib/ProfileContext"

const navigation2 = [
  {
    name: "Dashboard",
    href: "#",
    icon: Gauge,
    active: false
  },
  {
    name: "Fleet",
    href: "#",
    icon: Truck,
    active: false
  },
  {
    name: "Drivers",
    href: "#",
    icon: PersonStanding,
    active: false
  },
  {
    name: "Trips",
    href: "#",
    icon: Route,
    active: false
  },
  {
    name: "Maintenance",
    href: "#",
    icon: Wrench,
    active: false
  },
  {
    name: "Fuel and Expenses",
    href: "#",
    icon: Fuel,
    active: false
  },
  {
    name: "Analytics",
    href: "#",
    icon: ChartColumn,
    active: false
  },
  {
    name: "Settings",
    href: "#",
    icon: Settings,
    active: false
  },
] as const

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { currentProfile } = useProfile()

  const filteredNavigation = React.useMemo(() => {
    switch (currentProfile.role) {
      case "Admin":
        return navigation2
      case "Manager":
        return navigation2.filter((item) => item.name !== "Settings")
      case "Auditor":
        return navigation2.filter((item) =>
          ["Dashboard", "Analytics", "Settings"].includes(item.name)
        )
      case "Viewer":
        return navigation2.filter((item) =>
          ["Dashboard", "Trips"].includes(item.name)
        )
      default:
        return navigation2
    }
  }, [currentProfile.role])

  return (
    <Sidebar {...props} className="bg-gray-50 dark:bg-gray-925">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-white p-1.5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
            <Logo className="size-6 text-blue-500 dark:text-blue-500" />
          </span>
          <div>
            <span className="block text-sm font-semibold text-gray-900 dark:text-gray-50">
              TransitOps
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-3">
          <Divider className="my-0 py-0" />
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {filteredNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarLink
                    href="#"
                    isActive={item.active}
                    icon={item.icon}
                  >
                    {item.name}
                  </SidebarLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="border-t border-gray-200 dark:border-gray-800" />
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  )
}
