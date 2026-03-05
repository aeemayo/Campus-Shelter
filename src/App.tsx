import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "./pages/ScrollToTop";

// Lazy-loaded pages — each becomes its own chunk
const Index = lazy(() => import("./pages/Index"));
const Properties = lazy(() => import("./pages/Properties"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SignUp = lazy(() => import("./pages/SignUp"));
const SignIn = lazy(() => import("./pages/SignIn"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const LandlordDashboard = lazy(() => import("./pages/LandlordDashboard"));
const AdminPropertyForm = lazy(() => import("./components/admin/AdminPropertyForm"));
const AdminDocumentUpload = lazy(() => import("./components/admin/AdminDocumentUpload"));
const Messages = lazy(() => import("./pages/Messages"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));

const PageLoader = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <div style={{
      width: 40, height: 40,
      border: "4px solid #e5e7eb",
      borderTop: "4px solid #6366f1",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
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
                <ProtectedRoute allowedRoles={["LANDLORD"]} allowUnverifiedLandlord>
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
                <ProtectedRoute allowUnverifiedLandlord>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute allowedRoles={["STUDENT", "LANDLORD"]}>
                  <Messages />
                </ProtectedRoute>
              } />
              <Route path="/messages/:partnerId" element={
                <ProtectedRoute allowedRoles={["STUDENT", "LANDLORD"]}>
                  <Messages />
                </ProtectedRoute>
              } />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
