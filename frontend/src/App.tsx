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
import { PDFRenderer } from "./components/PDFRenderer";
import PDFViewerPage from "./components/pdf-viewer-page";

const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL || "http://localhost:8000";

export default function App() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup1 heading="Create an account" />} />
      <Route path="/login" element={<Login1 heading="Welcome back" />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/pdf" element={<PDFRenderer pdfUrl={`${FASTAPI_URL}/proxy-pdf?url=https://arxiv.org/pdf/2106.14834.pdf`} />} />
      <Route path="/pdf-viewer/:paperId" element={<PDFViewerPage />} />
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
