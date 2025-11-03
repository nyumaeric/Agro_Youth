"use client"
import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "./Nav-main"
import { NavUser } from "./Nav-user"
import { useGetUserInfo } from "@/hooks/useAuth"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: userInfo } = useGetUserInfo();

  const datas = userInfo?.data || []
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser userinfo={datas} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}