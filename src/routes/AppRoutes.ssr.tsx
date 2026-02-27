import { Route, Routes } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Shop from "@/pages/Shop";
import Migration from "@/pages/Migration";
import ShopifyAlternative from "@/pages/ShopifyAlternative";
import LightspeedAlternative from "@/pages/LightspeedAlternative";
import MagentoAlternative from "@/pages/MagentoAlternative";
import PrestashopAlternative from "@/pages/PrestashopAlternative";
import Product from "@/pages/Product";
import Success from "@/pages/Success";
import Admin from "@/pages/Admin";
import Cart from "@/pages/Cart";
import Cancel from "@/pages/Cancel";
import Webshop from "@/pages/Webshop";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import PreviewOffer from "@/pages/PreviewOffer";
import { getNonDefaultLocales } from "@/lib/i18n";

export const AppRoutesSSR = () => (
  <Routes>
    <Route path="/" element={<Webshop />} />
    <Route path="/zakelijke-websites" element={<Index />} />
    <Route path="/shop" element={<Shop />} />
    <Route path="/demo" element={<Shop />} />
    <Route path="/migratie" element={<Migration />} />
    <Route path="/shopify-alternatief" element={<ShopifyAlternative />} />
    <Route path="/lightspeed-alternatief" element={<LightspeedAlternative />} />
    <Route path="/magento-alternatief" element={<MagentoAlternative />} />
    <Route path="/prestashop-alternatief" element={<PrestashopAlternative />} />
    <Route path="/preview/:clientSlug" element={<PreviewOffer />} />
    <Route path="/preview/:clientSlug/shop" element={<Shop />} />
    <Route path="/preview/:clientSlug/product/:id" element={<Product />} />
    <Route path="/webshop" element={<Webshop />} />
    <Route path="/product/:id" element={<Product />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/blog" element={<Blog />} />
    <Route path="/blog/:slug" element={<BlogPost />} />
    <Route path="/success" element={<Success />} />
    <Route path="/cancel" element={<Cancel />} />
    <Route path="/admin/*" element={<Admin />} />
    {getNonDefaultLocales().map((locale) => (
      <Route key={locale} path={`/${locale}`}>
        <Route index element={<Webshop />} />
        <Route path="zakelijke-websites" element={<Index />} />
        <Route path="shop" element={<Shop />} />
        <Route path="demo" element={<Shop />} />
        <Route path="migratie" element={<Migration />} />
        <Route path="shopify-alternatief" element={<ShopifyAlternative />} />
        <Route path="lightspeed-alternatief" element={<LightspeedAlternative />} />
        <Route path="magento-alternatief" element={<MagentoAlternative />} />
        <Route path="prestashop-alternatief" element={<PrestashopAlternative />} />
        <Route path="preview/:clientSlug" element={<PreviewOffer />} />
        <Route path="preview/:clientSlug/shop" element={<Shop />} />
        <Route path="preview/:clientSlug/product/:id" element={<Product />} />
        <Route path="webshop" element={<Webshop />} />
        <Route path="product/:id" element={<Product />} />
        <Route path="cart" element={<Cart />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="success" element={<Success />} />
        <Route path="cancel" element={<Cancel />} />
        <Route path="admin/*" element={<Admin />} />
      </Route>
    ))}
    <Route path="*" element={<NotFound />} />
  </Routes>
);
