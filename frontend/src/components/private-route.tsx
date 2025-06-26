import { Navigate, Outlet } from "react-router";

const PrivateRoutes = () => {
  let auth = { token: true }; // TODO: Replace with actual authentication logic
  return auth.token ? <Outlet /> : <Navigate to="/login" />;
};

export { PrivateRoutes };