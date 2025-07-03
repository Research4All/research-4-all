import { Routes, Route } from "react-router";

import { Signup1 } from "./components/signup1";
import { Login1 } from "./components/login1";
import { PaperGrid } from "./components/paper-grid";
import { PrivateRoutes } from "./components/private-route";
import { EditProfile } from "./components/edit-profile";
import Layout from "./layout";
import { HomeFeed } from "./components/home-feed";
import { UserPapers } from "./components/user-papers";

export default function App() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup1 />} />
      <Route path="/login" element={<Login1 />} />
      <Route element={<PrivateRoutes />}>
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route element={<Layout />}>
          <Route path="/" element={<HomeFeed />} />
          <Route path="/papers" element={<UserPapers />} />
        </Route>
      </Route>
    </Routes>
  );
}
