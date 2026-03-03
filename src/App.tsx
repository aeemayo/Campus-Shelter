import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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
            <Route path="/" element={<Index />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/register" element={<SignUp />}></Route>
            <Route path="/login" element={<SignIn />}></Route>
            <Route path="/forgot-password" element={<ForgotPassword />}></Route>
            <Route path="/reset-password" element={<ResetPassword />}></Route>
            <Route path="/my-bookings" element={<MyBookings />}></Route>
            <Route path="/properties/:id" element={<PropertyDetails />}></Route>
            <Route path="/profile" element={<Profile />}></Route>
            <Route path="/landlord" element={<LandlordDashboard />}></Route>
            <Route path="/admin" element={<AdminDashboard />}></Route>
            <Route path="/admin/properties/new" element={<AdminPropertyForm />}></Route>
            <Route path="/admin/properties/edit/:id" element={<AdminPropertyForm />}></Route>
            <Route path="/admin/documents/upload" element={<AdminDocumentUpload />}></Route>
            <Route path="/messages" element={<Messages />}></Route>
            <Route path="/messages/:partnerId" element={<Messages />}></Route>
            <Route path="/faq" element={<FAQ />}></Route>
            <Route path="/contact" element={<Contact />}></Route>
            <Route path="/terms" element={<Terms />}></Route>
            <Route path="/privacy" element={<Privacy />}></Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
