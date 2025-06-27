import { Navigate, Outlet } from "react-router";
import { useEffect, useState } from "react";

const PrivateRoutes = () => {
  const [auth, setAuth] = useState<null | boolean>(null);

  useEffect(() => {
    try {
      fetch("http://localhost:3000/api/auth/status", {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => setAuth(data.authenticated));
    } catch (error) {
      console.error("Error checking authentication status:", error);
      setAuth(false);
    }
  }, []);

  if (auth === null) return <div>Loading...</div>; // or a spinner/loading component

  return auth ? <Outlet /> : <Navigate to="/login" />;
};

export { PrivateRoutes };
