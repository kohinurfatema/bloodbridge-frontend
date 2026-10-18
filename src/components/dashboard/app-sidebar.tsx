"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsUpDownIcon, DropletIcon, LogOutIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABELS } from "@/lib/constants";
import { initials } from "@/lib/format";
import { ACCOUNT_NAV, NAVIGATION, type NavItem } from "@/lib/navigation";
import type { SessionUser } from "@/types";

function NavLinks({ items, pathname }: { items: NavItem[]; pathname: string }) {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      {items.map((item) => {
        // Role home ("/dashboard/admin") should only be active on exact match.
        const isActive =
          pathname === item.href ||
          (item.href.split("/").length > 3 && pathname.startsWith(`${item.href}/`));
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
              <Link
                href={item.href}
                onClick={() => setOpenMobile(false)}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function AppSidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const sections = NAVIGATION[user.role];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <DropletIcon className="size-4 fill-current" aria-hidden />
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="font-bold">BloodBridge</span>
                  <span className="text-xs text-muted-foreground">
                    {ROLE_LABELS[user.role]} portal
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavLinks items={section.items} pathname={pathname} />
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavLinks items={ACCOUNT_NAV} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent"
                  aria-label="Account menu"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary/10 font-semibold text-primary">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </span>
                  <ChevronsUpDownIcon className="ml-auto size-4" aria-hidden />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <span className="block font-medium">{user.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    Signed in as {ROLE_LABELS[user.role]}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {ACCOUNT_NAV.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>
                      <item.icon /> {item.title}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  variant="destructive"
                  disabled={logout.isPending}
                  onSelect={() => logout.mutate()}
                >
                  <LogOutIcon /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
