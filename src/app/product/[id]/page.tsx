"use client"

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import ProductGallery from "@/components/product/ProductGallery";
import ProductDetails from "@/components/product/ProductDetails";
import StickyCartBar from "@/components/product/StickyCartBar";
import RelatedUpsell from "@/components/product/RelatedUpsell";
import PurchaseBox from "@/components/product/PurchaseBox";
import ProductSpecs from "@/components/product/ProductSpecs";
import ProductCarousel from "@/components/product/ProductCarousel";
import FrequentlyBoughtTogether from "@/components/product/FrequentlyBoughtTogether";
import { MOCK_PRODUCTS, getRelatedProducts, getVendorUpsells } from "@/lib/mockData/products";

export default function ProductPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  // ── Shared variant state (lifted to parent for sync between Details & PurchaseBox) ──
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Find matching variation based on selected options
  const currentVariation = product?.variations?.find((v: any) => {
    if (!v.combination || !Object.keys(selectedOptions).length) return false;
    return Object.entries(v.combination).every(
      ([name, value]) => selectedOptions[name] === value
    );
  }) || null;

  const displayPrice =
    currentVariation?.price ||
    (product?.discountPrice && product.discountPrice < product?.price
      ? product.discountPrice
      : product?.price) || 0;

  const handleOptionChange = (name: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
        // Pre-select first value of each attribute
        if (data.productAttributes?.length) {
          const defaults: Record<string, string> = {};
          data.productAttributes.forEach((attr: any) => {
            if (attr.values?.[0]) defaults[attr.name] = attr.values[0];
          });
          setSelectedOptions(defaults);
        }
        // Fetch related products
        fetch(`/api/products?category=${data.categoryId}&sort=best`)
          .then((r) => r.json())
          .then((arr) => {
            if (Array.isArray(arr)) {
              setRelatedProducts(arr.filter((p: any) => p.id !== id).slice(0, 8));
            }
          })
          .catch(() => {});
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="animate-spin w-10 h-10 border-4 border-[#C5A021] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-20 text-center text-gray-500">
        المنتج غير موجود أو تم حذفه
      </div>
    );
  }

  const alsoViewed = MOCK_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 8);
  const vendorUpsells = getVendorUpsells(product.vendor, product.id);
  const images = typeof product.images === "string" && product.images.trim()
    ? product.images.split(",").map((s: string) => s.trim())
    : product.image
    ? [product.image]
    : [];

  return (
    <div className="min-h-screen bg-white pb-32" dir="rtl">
      {/* ── 3-Column PDP Layout ── */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 pt-40 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[42%_1fr_23%] gap-6 xl:gap-10 items-start">

          {/* Column 1: Image Gallery */}
          <div className="order-1">
            <ProductGallery images={images} activeVariationImage={currentVariation?.image} />
          </div>

          {/* Column 2: Product Info & Variants */}
          <div className="order-2">
            <ProductDetails
              product={product}
              selectedOptions={selectedOptions}
              onOptionChange={handleOptionChange}
              currentVariation={currentVariation}
              displayPrice={displayPrice}
            />
          </div>

          {/* Column 3: Sticky Purchase Box */}
          <div className="order-3">
            <PurchaseBox
              product={product}
              selectedOptions={selectedOptions}
              onOptionChange={handleOptionChange}
              currentVariation={currentVariation}
              displayPrice={displayPrice}
            />
          </div>
        </div>
      </div>

      {/* ── Below Fold ── */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 space-y-12 pb-12">

        {/* Technical Specs */}
        <ProductSpecs product={product} />

        {/* Frequently Bought Together */}
        {vendorUpsells.length > 0 && (
          <FrequentlyBoughtTogether mainProduct={product} upsellProducts={vendorUpsells} />
        )}

        {/* Related Products from DB */}
        {relatedProducts.length > 0 && (
          <ProductCarousel
            title="منتجات ذات صلة"
            products={relatedProducts.map((p: any) => ({
              id: p.id,
              title: p.title,
              price: p.price,
              vendor: p.vendor?.storeName || p.vendor,
              vendorLocation: p.vendor?.location || "السودان",
              image:
                typeof p.images === "string" && p.images.trim()
                  ? p.images.split(",")[0].trim()
                  : "",
              badge: "ذات صلة",
            })) as any}
            subtitle={`أفضل المختارات من فئة ${product.category}`}
          />
        )}

        {/* Also Viewed (Mock fallback) */}
        <ProductCarousel
          title="عملاء شاهدوا هذا أيضاً"
          products={alsoViewed}
          subtitle="بناءً على تفضيلات عملاء مرسال"
        />

        {/* Vendor Upsells */}
        <RelatedUpsell mainProduct={product} upsellProducts={vendorUpsells} />
      </div>

      {/* Sticky Mobile Bar */}
      <StickyCartBar product={{ ...product, price: displayPrice }} />
    </div>
  );
}
