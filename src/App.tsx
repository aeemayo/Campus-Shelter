import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MyBookings from "./pages/MyBookings";
import ScrollToTop from "./pages/ScrollToTop";
import PropertyDetails from "./pages/PropertyDetails";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import LandlordDashboard from "./pages/LandlordDashboard";
import AdminPropertyForm from "./components/admin/AdminPropertyForm";
import AdminDocumentUpload from "./components/admin/AdminDocumentUpload";
import Messages from "./pages/Messages";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<SignUp />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Student routes */}
            <Route path="/properties" element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <Properties />
              </ProtectedRoute>
            } />
            <Route path="/properties/:id" element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <PropertyDetails />
              </ProtectedRoute>
            } />
            <Route path="/my-bookings" element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <MyBookings />
              </ProtectedRoute>
            } />

            {/* Landlord routes */}
            <Route path="/landlord" element={
              <ProtectedRoute allowedRoles={["LANDLORD"]}>
                <LandlordDashboard />
              </ProtectedRoute>
            } />
            <Route path="/properties/add" element={
              <ProtectedRoute allowedRoles={["LANDLORD"]}>
                <AdminPropertyForm />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/properties/new" element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminPropertyForm />
              </ProtectedRoute>
            } />
            <Route path="/admin/properties/edit/:id" element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminPropertyForm />
              </ProtectedRoute>
            } />
            <Route path="/admin/documents/upload" element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDocumentUpload />
              </ProtectedRoute>
            } />

            {/* Shared authenticated routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/messages/:partnerId" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
