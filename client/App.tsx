import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ComplaintProvider, useComplaints } from "./context/ComplaintContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./firebase";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CivilianDashboard from "./pages/CivilianDashboard";
import OfficerDashboard from "./pages/OfficerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TrackComplaint from "./pages/TrackComplaint";
import ComplaintDetails from "./pages/ComplaintDetails";
import EmailLinkVerify from "./pages/EmailLinkVerify";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole: string }) => {
  const { user, isLoggedIn } = useComplaints();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

import MyComplaints from "./pages/MyComplaints";
import Profile from "./pages/Profile";
import CompleteSignup from "./pages/CompleteSignup";
import DashboardContent from "./pages/DashboardContent";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/complete-signup" element={<CompleteSignup />} />
    <Route
      path="/civilian/dashboard"
      element={
        <ProtectedRoute requiredRole="civilian">
          <CivilianDashboard />
        </ProtectedRoute>
      }
    >
      <Route index element={<DashboardContent />} />
      <Route path="my-complaints" element={<MyComplaints />} />
      <Route path="profile" element={<Profile />} />
    </Route>
    <Route
      path="/officer/dashboard"
      element={
        <ProtectedRoute requiredRole="officer">
          <OfficerDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/dashboard"
      element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/my-complaints"
      element={
        <ProtectedRoute requiredRole="civilian">
          <MyComplaints />
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute requiredRole="civilian">
          <Profile />
        </ProtectedRoute>
      }
    />
    <Route path="/track" element={<TrackComplaint />} />
    <Route path="/complaint/:complaintId" element={<ComplaintDetails />} />
    <Route path="/auth/verify" element={<EmailLinkVerify />} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="civic-issue-theme">
      <TooltipProvider>
        <ComplaintProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ComplaintProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
