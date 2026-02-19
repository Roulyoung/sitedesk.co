import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

const Index = lazy(() => import("@/pages/Index"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Shop = lazy(() => import("@/pages/Shop"));
const Product = lazy(() => import("@/pages/Product"));
const Success = lazy(() => import("@/pages/Success"));
const Admin = lazy(() => import("@/pages/Admin"));
const Cart = lazy(() => import("@/pages/Cart"));
const Cancel = lazy(() => import("@/pages/Cancel"));
const Webshop = lazy(() => import("@/pages/Webshop"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));

export const AppRoutesClient = () => (
  <Suspense fallback={null}>
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);
