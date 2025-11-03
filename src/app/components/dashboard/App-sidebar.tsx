"use client"
import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "./Nav-main"
import { menuItems } from "@/constants/dashboard"
import Link from "next/link"
// import { useGetUserInfo } from "@/hooks/useAuth"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // const { data: userInfo } = useGetUserInfo();
  
  // const info: UserData[] | undefined = userInfo?.data?.map((user: { id: string; _id: string; userId: string; email: string; role: string }) => ({
  //   id: user.id || user._id || user.userId || `user-${user.email}`, 
  //   email: user.email,
  //   role: user.role,
  // }))

  

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={menuItems.navMain} />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser userinfo={info} />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  )
}
