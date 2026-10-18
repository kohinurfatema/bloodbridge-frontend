import {
  ActivityIcon,
  BellRingIcon,
  ClipboardListIcon,
  CreditCardIcon,
  GitPullRequestArrowIcon,
  HandHeartIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  PlusCircleIcon,
  SearchIcon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react";

import type { Role } from "@/types";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

// Each role sees only its own sections — the proxy enforces the same rules.
export const NAVIGATION: Record<Role, NavSection[]> = {
  ADMIN: [
    {
      label: "Overview",
      items: [{ title: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboardIcon }],
    },
    {
      label: "Manage",
      items: [
        { title: "Users", href: "/dashboard/admin/users", icon: UsersIcon },
        { title: "Blood requests", href: "/dashboard/admin/requests", icon: ClipboardListIcon },
        { title: "Emergency alerts", href: "/dashboard/admin/alerts", icon: BellRingIcon },
        { title: "Audit logs", href: "/dashboard/admin/audit", icon: ActivityIcon },
      ],
    },
  ],
  DONOR: [
    {
      label: "Overview",
      items: [{ title: "Dashboard", href: "/dashboard/donor", icon: LayoutDashboardIcon }],
    },
    {
      label: "Donate",
      items: [
        { title: "My matches", href: "/dashboard/donor/matches", icon: GitPullRequestArrowIcon },
        { title: "Open requests", href: "/dashboard/donor/requests", icon: BellRingIcon },
        { title: "Donor profile", href: "/dashboard/donor/profile", icon: HandHeartIcon },
      ],
    },
  ],
  REQUESTER: [
    {
      label: "Overview",
      items: [{ title: "Dashboard", href: "/dashboard/requester", icon: LayoutDashboardIcon }],
    },
    {
      label: "Requests",
      items: [
        { title: "New request", href: "/dashboard/requester/requests/new", icon: PlusCircleIcon },
        { title: "Find donors", href: "/dashboard/requester/donors", icon: SearchIcon },
        { title: "Payments", href: "/dashboard/requester/payments", icon: CreditCardIcon },
      ],
    },
  ],
};

export const ACCOUNT_NAV: NavItem[] = [
  { title: "Profile settings", href: "/dashboard/profile", icon: UserCogIcon },
];
