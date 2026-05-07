"use client"

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getProductById, getRelatedProducts, getVendorUpsells } from "@/lib/mockData/products";
import ProductGallery from "@/components/product/ProductGallery";
import ProductDetails from "@/components/product/ProductDetails";
import StickyCartBar from "@/components/product/StickyCartBar";
import RelatedUpsell from "@/components/product/RelatedUpsell";
import ProductCard from "@/components/ProductCard";
import PurchaseBox from "@/components/product/PurchaseBox";
import ProductSpecs from "@/components/product/ProductSpecs";

import ProductCarousel from "@/components/product/ProductCarousel";
import { MOCK_PRODUCTS } from "@/lib/mockData/products";

export default function ProductPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "iphone-15-pm";
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch from API first
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to Mock Data if API fails or ID is a mock ID
        const mockProduct = getProductById(id);
        setProduct(mockProduct);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-32">
       <div className="animate-spin w-10 h-10 border-4 border-[#1089A4] border-t-transparent rounded-full" />
    </div>
  );

  if (!product) return <div className="p-20 text-center">المنتج غير موجود</div>;

  const related = getRelatedProducts(product.categoryId, product.id);
  const alsoViewed = MOCK_PRODUCTS.filter(p => p.id !== product.id).slice(0, 8);
  const vendorUpsells = getVendorUpsells(product.vendor, product.id);

  return (
    <div className="min-h-screen bg-white pb-44" dir="rtl">
      {/* Breadcrumbs - Dynamic */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-10 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-[#021D24]/20 pt-44">
         <Link href="/" className="hover:text-[#1089A4] transition-colors cursor-pointer">الرئيسية</Link>
         <span className="material-symbols-rounded text-sm">chevron_left</span>
         <Link href={`/category/${product.categoryId}`} className="hover:text-[#1089A4] transition-colors cursor-pointer">{product.category}</Link>
         <span className="material-symbols-rounded text-sm">chevron_left</span>
         <span className="text-[#021D24]">{product.title}</span>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Pillar 1: Purchase Box (Left/Sticky) */}
        <div className="lg:col-span-3 order-3 lg:order-1">
           <PurchaseBox product={product} />
        </div>

        {/* Pillar 2: Info Deep-Dive (Middle) */}
        <div className="lg:col-span-5 lg:order-2 order-2">
           <ProductDetails product={product} />
        </div>

        {/* Pillar 3: Gallery (Right) */}
        <div className="lg:col-span-4 lg:order-3 order-1">
           <ProductGallery images={
             typeof product.images === "string" && product.images.trim()
               ? product.images.split(",").map((s: any) => s.trim())
               : (product.image ? [product.image] : [])
           } />
        </div>
      </div>

      {/* Synthesis Section: Specs, Related & Upsell */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 mt-32 space-y-32">
         {/* Technical Specifications Section */}
         <ProductSpecs product={product} />

         {/* Discovery Tier: Also Viewed */}
         <ProductCarousel 
            title="المستكشفون شاهدوا أيضاً هذا" 
            products={alsoViewed} 
            subtitle="بناءً على تفضيلات عملاء مرسال الموثوقين"
         />

         {/* Motta Deep-Dive: Frequently Bought Together (Same Store Bundle) */}
         <RelatedUpsell mainProduct={product} upsellProducts={vendorUpsells} />

         {/* Discovery Tier: Related Products */}
         <ProductCarousel 
            title="منتجات ذات صلة بهذه السلعة" 
            products={related} 
            subtitle={`أفضل المختارات من فئة ${product.category}`}
         />
      </div>

      <StickyCartBar product={product} />
    </div>
  );
}

