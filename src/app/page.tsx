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

      {/* ── 1. HERO CAROUSEL ── */}
      <HomeHeroSlider />

      {/* ── 2. CATEGORIES WALL ── */}
      <CategoryWall />

      {/* ── 3. PRODUCT TAB HUB (best) ── */}
      <ProductTabHub filter="best" />

      {/* ── 4. ADS SLIDER A ── */}
      <AdsSlider set="A" />

      {/* ── 5. PRODUCT TAB HUB (new) ── */}
      <ProductTabHub filter="new" />

      {/* ── 6. ADS SLIDER B ── */}
      <AdsSlider set="B" />

      {/* ── 7. STORES SHOWCASE ── */}
      <StoreShowcase />

      {/* ── 8. DYNAMIC SECTIONS (admin-managed) ── */}
      <DynamicSectionsRenderer />

      {/* ── 8. TRUST SIGNALS ── */}
      <TrustSignals />

    </div>
  );
}
