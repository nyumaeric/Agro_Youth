'use client'
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "./globals.css";
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";
import { AppSidebar } from "../components/dashboard/App-sidebar";
import { TopSide } from "../components/dashboard/TopSide";
import { Provider } from "@/utils/Provider";

const queryClient = new QueryClient();



const DashboardContent = ({ children }: { children: React.ReactNode }) => {
  // const { data: userInfo } = useGetUserInfo();
  
  // const hasPendingDecision = userInfo?.data?.some((val: { decision: string; }) => val.decision === "pending");

  return (
    <div className="relative">
      <div className={`transition-all duration-500 
         filter  select-none' : ''}`}>
          <Provider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <TopSide />
                <div className="flex flex-1 flex-col gap-4 px-4 pt-0">
                  {children}
                </div>
              </SidebarInset>
            </SidebarProvider>
          </Provider>
      </div>
      
      {/* {hasPendingDecision && <PendingApprovalOverlay />} */}
    </div>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <DashboardContent>
            {children}
          </DashboardContent>
        </QueryClientProvider>
      </body>
    </html>
  );
}