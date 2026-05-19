import HeroSection from "@/components/HeroSection";
import TrustSignals from "@/components/TrustSignals";
import CategoryWall from "@/components/CategoryWall";
import ProductTabHub from "@/components/ProductTabHub";
import StoreShowcase from "@/components/StoreShowcase";
import AdsSlider from "@/components/AdsSlider";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <CategoryWall />
      <ProductTabHub filter="best" />
      <AdsSlider set="A" />
      <ProductTabHub filter="new" />
      <AdsSlider set="B" />
      <StoreShowcase />
      <TrustSignals />
    </div>
  );
}
