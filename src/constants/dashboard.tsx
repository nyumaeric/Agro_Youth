import {
  BookOpen,
  GraduationCap,
  ShoppingBag,
  Award,
  User,
  Home,
  LucideIcon,
  ChevronRight
} from "lucide-react";
import { JSX } from "react";

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const createIcon = (LucideIcon: LucideIcon) => {
  const IconComponent = (props: IconProps) => <LucideIcon {...props} />;
  IconComponent.displayName = `Icon(${LucideIcon.displayName || LucideIcon.name || 'Unknown'})`;
  return IconComponent;
};

interface SubNavItem {
  title: string;
  href: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: (props: IconProps) => JSX.Element;
  items?: SubNavItem[];
}

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface MenuItems {
  user: User;
  navMain: NavItem[];
}

export const menuItems: MenuItems = {
  user: {
    name: "Ruth Uwamahoro",
    email: "ruthuwamahoro250@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Overview",
      href: "/dashboard",
      icon: createIcon(Home)
    },
    {
      title: "Courses",
      href: "/dashboard/courses",
      icon: createIcon(BookOpen),
      items: [
        {
          title: "All Courses",
          href: "/dashboard/courses"
        },
        {
          title: "Enrolled Courses",
          href: "/dashboard/courses/enrolled"
        }
      ]
    },
    {
      title: "Products",
      href: "/dashboard/products",
      icon: createIcon(ShoppingBag)
    },
    {
      title: "Certificates",
      href: "/dashboard/certificates",
      icon: createIcon(Award)
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: createIcon(User)
    }
  ],
};