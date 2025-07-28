import { Navigate, Outlet } from "react-router";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const PrivateRoutes = () => {
  const [auth, setAuth] = useState<null | boolean>(null);

  useEffect(() => {
    try {
      fetch(`${BACKEND_URL}/api/auth/status`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => setAuth(data.authenticated));
    } catch (error) {
      console.error("Error checking authentication status:", error);
      setAuth(false);
    }
  }, []);

  if (auth == null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" text="Checking authentication..." showText />
      </div>
    );
  }

  return auth ? <Outlet /> : <Navigate to="/login" />;
};

export { PrivateRoutes };
