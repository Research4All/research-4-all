import { Routes, Route } from "react-router";

import { Signup1 } from "./components/signup1";
import { Login1 } from "./components/login1";
import { PrivateRoutes } from "./components/private-route";
import { ProfileDisplay } from "./components/profile-display";
import { EditProfile } from "./components/edit-profile";
import Layout from "./layout";
import { HomeFeed } from "./components/home-feed";
import { UserPapers } from "./components/user-papers";
import { Onboarding } from "./components/onboarding";

export default function App() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup1 heading="Create an account" />} />
      <Route path="/login" element={<Login1 heading="Welcome back" />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<PrivateRoutes />}>
        <Route element={<Layout />}>
          <Route path="/" element={<HomeFeed />} />
          <Route path="/papers" element={<UserPapers />} />
          <Route path="/profile" element={<ProfileDisplay />} />
          <Route path="/edit-profile" element={<EditProfile />} />
        </Route>
      </Route>
    </Routes>
  );
}
