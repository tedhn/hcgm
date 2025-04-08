"use client";
import type { ReactNode } from "react";
import { AppSidebar } from "~/app/_components/sidebar";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { useIsMobile } from "~/hooks/useMobile";

const Layout: React.FC<Readonly<{ children: ReactNode }>> = ({ children }) => {
  const isMobile = useIsMobile();

  console.log(isMobile);

  return (
    <SidebarProvider>
      <AppSidebar />

      <div className="flex flex-col w-full">
        {isMobile && <SidebarTrigger className="ml-4 mt-4" />}
        <div className="flex h-screen w-screen flex-col items-start p-4 lg:w-full">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
