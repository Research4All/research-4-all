import { Navigate, Outlet } from "react-router";
import { useEffect, useState } from "react";

const BACKEND_URL = import.meta.env.BACKEND_URL || "http://localhost:3000";

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

  if (auth == null) return <div>Loading...</div>; // or a spinner/loading component

  return auth ? <Outlet /> : <Navigate to="/login" />;
};

export { PrivateRoutes };
