import React from "react";

import CategoryWall from "@/components/CategoryWall";
import ProductTabHub from "@/components/ProductTabHub";
import StoreShowcase from "@/components/StoreShowcase";
import TrustSignals from "@/components/TrustSignals";
import AdsSlider from "@/components/AdsSlider";
import HomeHeroSlider from "@/components/HomeHeroSlider";
import DynamicSectionsRenderer from "@/components/DynamicSectionsRenderer";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">

      {/* ── 1. HERO CAROUSEL (البانر العلوي) ── */}
      <HomeHeroSlider />

      {/* ── 2. CATEGORIES WALL (الأقسام) ── */}
      <CategoryWall />

      {/* ── 3. BEST SELLERS (الأكثر مبيعاً) ── */}
      <ProductTabHub filter="best" />

      {/* ── 4. SMALL AD BANNER (بانر إعلاني صغير) ── */}
      <AdsSlider set="A" />

      {/* ── 5. NEW ARRIVALS (منتجات جديدة) ── */}
      <ProductTabHub filter="new" />

      {/* ── 6. AD BANNER (بانر إعلاني) ── */}
      <AdsSlider set="B" />

      {/* ── 7. REGULAR PRODUCTS (منتجات عادية فقط — تحت البانر الثالث) ── */}
      <ProductTabHub filter="regular" />

      {/* ── 8. REST AS-IS (الباقي زي ما هو) ── */}
      <StoreShowcase />
      <DynamicSectionsRenderer />
      <TrustSignals />

    </div>
  );
}
