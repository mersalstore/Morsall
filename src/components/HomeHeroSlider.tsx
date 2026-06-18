"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

const HERO_SLIDES = [
  {
    title: "خدمات شحن بري وطني وتجارة إلكترونية موثوقة",
    subtitle: "ربط الولايات السودانية بأعلى معايير الأمان والسرعة",
    desc: "تقدم منصة مرسال حلول لوجستية متكاملة تضمن نقل بضائعكم بأمان، وتوفير سوق إلكتروني يجمع بين كبار التجار والمشترين مع نظام تتبع دقيق للحالة خطوة بخطوة.",
    tag: "منصة مرسال الرسمية",
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200",
    badge: "تغطية شاملة لكافة الولايات الآمنة",
    cta: "ابدأ الشحن الآن",
    ctaLink: "#tracking"
  },
  {
    title: "تتبع شحنتك لحظة بلحظة وبكل شفافية",
    subtitle: "إدارة متطورة لسلسلة التوريد والتوصيل المنزلي",
    desc: "سواء كنت صاحب متجر أو ترغب في إرسال طرد شخصي، توفر لك مرسال تفاصيل دقيقة عن مسار القافلة اللوجستية ومواعيد الاستلام والتسليم المتوقعة.",
    tag: "خدمات التتبع واللوجستيات",
    img: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200",
    badge: "تحديثات فورية لحركة الشاحنات",
    cta: "تتبع طردك الآن",
    ctaLink: "#tracking"
  }
];

export default function HomeHeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [heroImagePosition, setHeroImagePosition] = useState("center");
  // Slides come from the admin banner manager (HOME_HERO). Fall back to the
  // built-in slides only when no banners are configured.
  const [slides, setSlides] = useState<any[]>(HERO_SLIDES);

  useEffect(() => {
    fetch("/api/site-config?key=heroImagePosition")
      .then(r => r.json())
      .then(val => { if (val) setHeroImagePosition(val); })
      .catch(() => {});

    // Load admin-managed banners and link them to the homepage hero
    fetch("/api/admin/settings/appearance")
      .then(r => r.json())
      .then(data => {
        const banners = Array.isArray(data?.banners) ? data.banners : [];
        const heroBanners = banners
          .filter((b: any) => (!b.type || b.type === "HOME_HERO") && b.isActive !== false && b.imageUrl)
          .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
          .map((b: any) => ({
            title: b.title || "",
            subtitle: b.subtitle || "",
            desc: b.subtitle || "",
            tag: "مرسال",
            img: b.imageUrl,
            badge: b.title || "عرض مميز",
            cta: "تسوق الآن",
            ctaLink: b.link || "/shop",
          }));
        if (heroBanners.length > 0) {
          setSlides(heroBanners);
          setActiveSlide(0);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide(p => (p + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
    // Re-arm the timer whenever the slide changes (incl. manual swipe) so the
    // user always gets the full interval after interacting.
  }, [slides, activeSlide]);

  const goToSlide = (i: number) => {
    const len = slides.length;
    if (len === 0) return;
    setActiveSlide(((i % len) + len) % len);
  };

  // ── Touch swipe (mobile): drag left/right to change images ──
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || slides.length <= 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - (touchStartY.current ?? 0);
    // Only treat as a horizontal swipe (ignore vertical scrolling / taps).
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      goToSlide(dx < 0 ? activeSlide + 1 : activeSlide - 1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <section className="pt-28 md:pt-36 pb-6 px-4 lg:px-8 max-w-[1600px] mx-auto w-full">
      <div
        className="bg-[#0F172A] rounded-2xl overflow-hidden shadow-sm h-[300px] md:h-[430px] lg:h-[480px] relative touch-pan-y select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {slides.map((slide, idx) => {
          const isActive = idx === activeSlide;
          return (
            <div 
              key={idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
            >
              <Link href={slide.ctaLink || "#"} className="block w-full h-full relative">
                <Image 
                  src={slide.img} 
                  alt={slide.title || "عرض"}
                  fill 
                  className="object-cover" 
                  style={{ objectPosition: heroImagePosition }}
                  priority
                />
              </Link>
            </div>
          );
        })}

        {/* Slider Dots */}
        <div className="absolute bottom-5 left-5 z-20 flex gap-1.5">
          {slides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setActiveSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === activeSlide ? "w-6 bg-[#F29124]" : "w-1.5 bg-white/40"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
