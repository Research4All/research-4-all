import { Routes, Route } from "react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Signup1 } from "./components/signup1";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Routes>
      <Route path="/" element={<Signup1 />} />
      <Route
        path="/home"
        element={
          <SidebarProvider>
            <AppSidebar />
            <main>
              <SidebarTrigger />
              {children}
            </main>
          </SidebarProvider>
        }
      />
    </Routes>
  );
}
