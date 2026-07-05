import { Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { MarketplacePage } from "./pages/marketplace/MarketplacePage";
import { ApplicationDetailPage } from "./pages/marketplace/ApplicationDetailPage";
import { GeneratedAppPage } from "./pages/marketplace/GeneratedAppPage";
import { DashboardLayout } from "./pages/dashboard/DashboardLayout";
import { ApplicationsTab } from "./pages/dashboard/ApplicationsTab";
import { ApplicationEditor } from "./pages/dashboard/ApplicationEditor";
import { ApiKeysTab } from "./pages/dashboard/ApiKeysTab";
import { SubscriptionTab } from "./pages/dashboard/SubscriptionTab";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage initialMode="login" />} />
      <Route path="/register" element={<AuthPage initialMode="register" />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/marketplace/:appId" element={<ApplicationDetailPage />} />
      <Route path="/marketplace/:appId/view/:buildId" element={<GeneratedAppPage />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<ApplicationsTab />} />
        <Route path="applications" element={<ApplicationsTab />} />
        <Route path="applications/:appId" element={<ApplicationEditor />} />
        <Route path="api-keys" element={<ApiKeysTab />} />
        <Route path="subscription" element={<SubscriptionTab />} />
      </Route>
    </Routes>
  );
}
