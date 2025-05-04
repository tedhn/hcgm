"use client";
import { Suspense, type ReactNode } from "react";
import { AppSidebar } from "~/app/_components/sidebar";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { useIsMobile } from "~/hooks/useMobile";
import { Toaster } from "react-hot-toast";

const Layout: React.FC<Readonly<{ children: ReactNode }>> = ({ children }) => {
  const isMobile = useIsMobile();

  console.log(isMobile);

  return (
    <SidebarProvider>
      <AppSidebar />
      <Toaster position="top-center" reverseOrder={false} />

      <div className="flex w-full flex-col">
        {isMobile && <SidebarTrigger className="ml-4 mt-4" />}
        <div className="flex h-screen w-screen flex-col items-start p-4 lg:w-full">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
