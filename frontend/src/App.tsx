import { Routes, Route } from "react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Signup1 } from "./components/signup1";
import { Login1 } from "./components/login1";
import { PaperGrid } from "./components/paper-grid";
import { PrivateRoutes } from "./components/private-route";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Routes>
      
      <Route path="/signup" element={<Signup1 />} />
      <Route path="/login" element={<Login1 />} />
      <Route path="/papers" element={<PaperGrid />} />
      <Route element={<PrivateRoutes />}>
        <Route
          path="/"
          element={
            <SidebarProvider>
              <AppSidebar />
              <main>
                <SidebarTrigger />
                {<PaperGrid />}
              </main>
            </SidebarProvider>
          }
        />
      </Route>
    </Routes>
  );
}
