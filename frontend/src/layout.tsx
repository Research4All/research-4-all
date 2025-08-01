import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import { Outlet } from "react-router";

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SidebarTrigger />
          <Outlet /> {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
