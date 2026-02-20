import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

type RouteComponents = {
  Index?: React.ComponentType;
  NotFound?: React.ComponentType;
  Shop?: React.ComponentType;
  Product?: React.ComponentType;
  Success?: React.ComponentType;
  Admin?: React.ComponentType;
  Cart?: React.ComponentType;
  Cancel?: React.ComponentType;
  Webshop?: React.ComponentType;
  Blog?: React.ComponentType;
  BlogPost?: React.ComponentType;
};

const LazyIndex = lazy(() => import("@/pages/Index"));
const LazyNotFound = lazy(() => import("@/pages/NotFound"));
const LazyShop = lazy(() => import("@/pages/Shop"));
const LazyProduct = lazy(() => import("@/pages/Product"));
const LazySuccess = lazy(() => import("@/pages/Success"));
const LazyAdmin = lazy(() => import("@/pages/Admin"));
const LazyCart = lazy(() => import("@/pages/Cart"));
const LazyCancel = lazy(() => import("@/pages/Cancel"));
const LazyWebshop = lazy(() => import("@/pages/Webshop"));
const LazyBlog = lazy(() => import("@/pages/Blog"));
const LazyBlogPost = lazy(() => import("@/pages/BlogPost"));

export const loadInitialRouteComponents = async (pathname: string): Promise<RouteComponents> => {
  if (pathname === "/" || pathname === "/webshop") {
    const mod = await import("@/pages/Webshop");
    return { Webshop: mod.default };
  }
  if (pathname === "/zakelijke-websites") {
    const mod = await import("@/pages/Index");
    return { Index: mod.default };
  }
  if (pathname === "/shop") {
    const mod = await import("@/pages/Shop");
    return { Shop: mod.default };
  }
  if (pathname.startsWith("/product/")) {
    const mod = await import("@/pages/Product");
    return { Product: mod.default };
  }
  if (pathname === "/cart") {
    const mod = await import("@/pages/Cart");
    return { Cart: mod.default };
  }
  if (pathname === "/blog") {
    const mod = await import("@/pages/Blog");
    return { Blog: mod.default };
  }
  if (pathname.startsWith("/blog/")) {
    const mod = await import("@/pages/BlogPost");
    return { BlogPost: mod.default };
  }
  if (pathname === "/success") {
    const mod = await import("@/pages/Success");
    return { Success: mod.default };
  }
  if (pathname === "/cancel") {
    const mod = await import("@/pages/Cancel");
    return { Cancel: mod.default };
  }
  if (pathname.startsWith("/admin")) {
    const mod = await import("@/pages/Admin");
    return { Admin: mod.default };
  }
  const mod = await import("@/pages/NotFound");
  return { NotFound: mod.default };
};

export const AppRoutesClient = ({ initialComponents }: { initialComponents?: RouteComponents }) => {
  const Index = initialComponents?.Index ?? LazyIndex;
  const NotFound = initialComponents?.NotFound ?? LazyNotFound;
  const Shop = initialComponents?.Shop ?? LazyShop;
  const Product = initialComponents?.Product ?? LazyProduct;
  const Success = initialComponents?.Success ?? LazySuccess;
  const Admin = initialComponents?.Admin ?? LazyAdmin;
  const Cart = initialComponents?.Cart ?? LazyCart;
  const Cancel = initialComponents?.Cancel ?? LazyCancel;
  const Webshop = initialComponents?.Webshop ?? LazyWebshop;
  const Blog = initialComponents?.Blog ?? LazyBlog;
  const BlogPost = initialComponents?.BlogPost ?? LazyBlogPost;

  return (
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
};
