"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { Home, Package, ShoppingCartIcon, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import Logo from "~/assets/icon.svg";
import Image from "next/image";
import clsx from "clsx";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "dashboard",
    icon: Home,
  },
  {
    title: "Users",
    url: "user",
    icon: User,
  },
  {
    title: "Products",
    url: "products",
    icon: Package,
  },
  {
    title: "sales",
    url: "sales",
    icon: ShoppingCartIcon,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const path = usePathname();

  console.log(path);

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        {/* <SidebarMenuItem key={"home"}> */}
        {/* <SidebarMenuButton asChild> */}
        {/* <a onClick={() => router.push("dashboard")}> */}
        {/* <Home size={64}/> */}
        <div className="flex items-center justify-start gap-2 px-2 py-4">
          <Image src={Logo as string} alt="404" className="h-10 w-10" />
          <span>HuaChang GrowMax</span>
        </div>
        {/* </a> */}
        {/* </SidebarMenuButton> */}
        {/* </SidebarMenuItem> */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={clsx(
                      path.replace("/", "") === item.url &&
                        "bg-white/30 hover:bg-white/30",
                    )}
                  >
                    <a onClick={() => router.push("/" + item.url)}>
                      <item.icon size={64} />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
