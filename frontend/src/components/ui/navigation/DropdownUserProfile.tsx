"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSubMenu,
  DropdownMenuSubMenuContent,
  DropdownMenuSubMenuTrigger,
  DropdownMenuTrigger,
} from "@/components/DropdownMenu"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"
import { useProfile } from "@/lib/ProfileContext"

export type DropdownUserProfileProps = {
  children: React.ReactNode
  align?: "center" | "start" | "end"
}

export function DropdownUserProfile({
  children,
  align = "start",
}: DropdownUserProfileProps) {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const { currentProfile, logout } = useProfile()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !currentProfile) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="sm:!min-w-[calc(var(--radix-dropdown-menu-trigger-width))]"
      >
        <DropdownMenuLabel>{currentProfile.email}</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuSubMenu>
            <DropdownMenuSubMenuTrigger>Theme</DropdownMenuSubMenuTrigger>
            <DropdownMenuSubMenuContent>
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(value) => setTheme(value)}
              >
                <DropdownMenuRadioItem value="light" iconType="check">
                  <Sun className="size-4 shrink-0" aria-hidden="true" />
                  Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark" iconType="check">
                  <Moon className="size-4 shrink-0" aria-hidden="true" />
                  Dark
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system" iconType="check">
                  <Monitor className="size-4 shrink-0" aria-hidden="true" />
                  System
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubMenuContent>
          </DropdownMenuSubMenu>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              logout()
            }}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
