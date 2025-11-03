'use client'
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const isLikelyId = (segment: string): boolean => {
  if (/^[a-f0-9]{24}$/i.test(segment)) return true;
  
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) return true;
  
  if (/^\d+$/.test(segment)) return true;
  
  if (/^[a-z0-9_-]{8,}$/i.test(segment) && !/[a-z]{3,}/i.test(segment)) return true;
  
  return false;
};

const generateBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(segment => segment !== '');
  
  if (segments.length === 1 && segments[0] === 'dashboard') {
    return [
      { label: 'Dashboard', href: '/dashboard', isCurrentPage: true }
    ];
  }

  const breadcrumbs: { label: string; href: string; isCurrentPage: boolean; }[] = [];
  let currentPath = '';

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    if (isLikelyId(segment)) {
      return;
    }
    
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    const isCurrentPage = index === segments.length - 1;
    
    breadcrumbs.push({
      label,
      href: currentPath,
      isCurrentPage
    });
  });

  return breadcrumbs;
};

export function TopSide() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);


  const getNotificationIcon = (type: string) => {
    const baseClasses = "w-3 h-3 rounded-full flex-shrink-0";
    switch (type) {
      case 'donation':
        return <div className={`${baseClasses} bg-green-500`} />;
      case 'milestone':
        return <div className={`${baseClasses} bg-blue-500`} />;
      case 'volunteer':
        return <div className={`${baseClasses} bg-purple-500`} />;
      case 'report':
        return <div className={`${baseClasses} bg-orange-500`} />;
      default:
        return <div className={`${baseClasses} bg-gray-500`} />;
    }
  };

  return (
    <div className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-40">
      <header className="flex h-16 shrink-0 items-center justify-between transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 flex-1">
          <SidebarTrigger className="-ml-1 hover:bg-gray-100 rounded-md p-2 transition-colors" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4 bg-gray-300"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.href} className="flex items-center">
                  <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                    {breadcrumb.isCurrentPage ? (
                      <BreadcrumbPage className="font-semibold text-gray-900">
                        {breadcrumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink 
                        href={breadcrumb.href}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {breadcrumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator className="hidden md:block text-gray-400" />
                  )}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* <div className="flex items-center gap-2 px-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors group relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs text-blue-600 font-medium">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors ${
                          !notification.isRead 
                            ? 'border-l-blue-500 bg-blue-50/30' 
                            : 'border-l-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div> */}
      </header>

      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </div>
  );
}