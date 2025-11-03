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
import { Toaster } from "react-hot-toast";

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
          <Toaster 
            position="top-center"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#363636',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 3000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </QueryClientProvider>
      </body>
    </html>
  );
}