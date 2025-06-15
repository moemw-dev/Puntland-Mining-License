
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "./header";
import { Session } from "next-auth";



const LayoutClient = ({ children, session }: { children: React.ReactNode, session: Session }) => {
  return (
    
    <SidebarProvider>
      <AppSidebar/>
      <SidebarInset>
        <DashboardHeader session={session} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default LayoutClient;
