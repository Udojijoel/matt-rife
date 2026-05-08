import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Shows from "./pages/Shows";
import Store from "./pages/Store";
import MeetGreet from "./pages/MeetGreet";
import VideoCalls from "./pages/VideoCalls";
import About from "./pages/About";
import PrivateShows from "./pages/PrivateShows";
import Auth from "./pages/Auth";
import Orders from "./pages/Orders";
import OrderLookup from "./pages/OrderLookup";
import { RequireAuth } from "./components/auth/RequireAuth";
import Receipt from "./pages/Receipt";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ShowsManager from "./pages/admin/ShowsManager";
import ProductsManager from "./pages/admin/ProductsManager";
import OrdersManager from "./pages/admin/OrdersManager";
import InquiriesManager from "./pages/admin/InquiriesManager";
import SettingsManager from "./pages/admin/SettingsManager";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/shows" element={<Shows />} />
            <Route path="/store" element={<Store />} />
            <Route path="/meet-greet" element={<MeetGreet />} />
            <Route path="/video-calls" element={<VideoCalls />} />
            <Route path="/about" element={<About />} />
            <Route path="/private-shows" element={<PrivateShows />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/orders"
              element={
                <RequireAuth fallback="/orders/lookup">
                  <Orders />
                </RequireAuth>
              }
            />
            <Route path="/orders/lookup" element={<OrderLookup />} />
            <Route path="/receipt/:id" element={<Receipt />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="shows" element={<ShowsManager />} />
              <Route path="products" element={<ProductsManager />} />
              <Route path="orders" element={<OrdersManager />} />
              <Route path="inquiries" element={<InquiriesManager />} />
              <Route path="settings" element={<SettingsManager />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
