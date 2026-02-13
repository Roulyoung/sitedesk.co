import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Success from "./pages/Success";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import Cancel from "./pages/Cancel";
import Webshop from "./pages/Webshop";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

export const createQueryClient = () => new QueryClient();

export const AppProviders = ({ children, client }: { children: React.ReactNode; client?: QueryClient }) => (
  <HelmetProvider>
    <QueryClientProvider client={client ?? createQueryClient()}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Webshop />} />
    <Route path="/zakelijke-websites" element={<Index />} />
    <Route path="/shop" element={<Shop />} />
    <Route path="/webshop" element={<Webshop />} />
    <Route path="/product/:id" element={<Product />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/blog" element={<Blog />} />
    <Route path="/blog/:slug" element={<BlogPost />} />
    <Route path="/success" element={<Success />} />
    <Route path="/cancel" element={<Cancel />} />
    <Route path="/admin/*" element={<Admin />} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <AppProviders>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AppProviders>
);

export default App;
