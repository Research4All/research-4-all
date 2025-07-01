import { Routes, Route } from "react-router";

import { Signup1 } from "./components/signup1";
import { Login1 } from "./components/login1";
import { PaperGrid } from "./components/paper-grid";
import { PrivateRoutes } from "./components/private-route";
import Layout from "./layout";

export default function App() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup1 />} />
      <Route path="/login" element={<Login1 />} />
      <Route element={<PrivateRoutes />}>
        <Route
          path="/"
          element={
            <Layout>
              <PaperGrid />
            </Layout>
          }
        />
      </Route>
    </Routes>
  );
}
