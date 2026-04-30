"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    bg: "from-[#C5A021]/90 to-[#A6881A]",
    tag: "📢 مساحة إعلانية",
    title: "أعـلـن هـنـا",
    subtitle: "احجز مساحتك",
    desc: "عزز مبيعاتك واعرض منتجاتك لآلاف الزوار يومياً على منصة مرسال.",
    cta: "تواصل معنا للإعلان",
    ctaHref: "/contact",
    sub: "تفاصيل الباقات",
    subHref: "/vendor/register",
    img: "https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&q=80&w=1200",
    badge: "مميز",
  },
  {
    bg: "from-[#0C3547] to-[#021D24]",
    tag: "📦 توصيل خلال 24 ساعة",
    title: "إلكترونيات",
    subtitle: "بأفضل الأسعار في السودان",
    desc: "موبايلات، لابتوبات، إكسسوارات — كل ما تحتاج بضغطة زر",
    cta: "استعرض الإلكترونيات",
    ctaHref: "/category/electronics",
    sub: "اكتشف المزيد",
    subHref: "/shop",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
    badge: "خصم يصل 40%",
  },
  {
    bg: "from-[#2C1810] to-[#021D24]",
    tag: "👗 أزياء السودان",
    title: "الموضة الجديدة",
    subtitle: "وصلت لمرسال",
    desc: "أحدث صيحات الأزياء من أفضل المتاجر في السودان",
    cta: "تسوّق الأزياء",
    ctaHref: "/category/fashion",
    sub: "عرض كل الملابس",
    subHref: "/shop",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
    badge: "مجموعة جديدة",
  },
];

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [dynamicBanners, setDynamicBanners] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/banners")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDynamicBanners(data);
        }
      })
      .catch(err => console.error("Banner fetch error:", err));
  }, []);

  const currentSlides = dynamicBanners.length > 0 
    ? dynamicBanners.map(b => ({
        bg: "from-[#0C3547] to-[#021D24]", // Default theme colors
        tag: b.subtitle || "مرسال السودان",
        title: b.title || "تسوق الآن",
        subtitle: "",
        desc: "اكتشف أفضل العروض والمنتجات من أكبر المتاجر في السودان.",
        cta: "استكشف المنتجات",
        ctaHref: b.link || "/shop",
        sub: "عن مرسال",
        subHref: "/faq",
        img: b.imageUrl,
        badge: "جديد",
      }))
    : SLIDES;

  // Auto-slide
  useEffect(() => {
    const t = setInterval(() => changeSlide((active + 1) % currentSlides.length), 5000);
    return () => clearInterval(t);
  }, [active, currentSlides.length]);

  const changeSlide = (idx: number) => {
    setTransitioning(true);
    setTimeout(() => { setActive(idx); setTransitioning(false); }, 250);
  };

  const s = currentSlides[active];

  return (
    <section className="w-full pt-[96px]" dir="rtl">

      {/* ── MAIN HERO BANNER ─────────────────────────────── */}
      <div className={cn("relative h-[320px] md:h-[420px] lg:h-[480px] bg-gradient-to-l overflow-hidden transition-all duration-500", s.bg)}>

        {/* Background image */}
        <div className={cn("absolute inset-0 transition-opacity duration-500", transitioning ? "opacity-0" : "opacity-100")}>
          <Image
            src={s.img}
            alt={s.title}
            fill
            className="object-cover opacity-20 mix-blend-overlay"
            priority
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-[#021D24]/30 via-transparent to-[#021D24]/80" />

        {/* Content */}
        <div className={cn("absolute inset-0 flex items-center max-w-[1600px] mx-auto px-6 lg:px-12 transition-all duration-300", transitioning ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0")}>
          <div className="max-w-2xl">
            <span className="inline-block bg-[#C5A021] text-white text-xs font-black px-3 py-1 rounded mb-4">
              {s.tag}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-2">
              {s.title} <span className="text-[#C5A021]">{s.subtitle}</span>
            </h1>
            <p className="text-sm md:text-base text-white/70 mb-6 max-w-lg">{s.desc}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={s.ctaHref}
                className="bg-[#C5A021] hover:bg-[#A6881A] text-white px-6 py-3 rounded font-black text-sm transition-colors inline-flex items-center gap-2"
              >
                {s.cta}
                <span className="material-symbols-rounded text-base">arrow_back</span>
              </Link>
              <Link
                href={s.subHref}
                className="bg-white/10 hover:bg-white/20 backdrop-blur text-white border border-white/30 px-6 py-3 rounded font-bold text-sm transition-colors"
              >
                {s.sub}
              </Link>
            </div>
          </div>
        </div>

        {/* Badge top-left */}
        <div className="absolute top-6 left-6 bg-[#C5A021] text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
          {s.badge}
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {currentSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => changeSlide(i)}
              className={cn("h-1.5 rounded-full transition-all duration-300", i === active ? "w-8 bg-[#C5A021]" : "w-4 bg-white/30")}
            />
          ))}
        </div>

        {/* Arrow Navigation */}
        <button
          onClick={() => changeSlide((active - 1 + currentSlides.length) % currentSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full border border-white/20 flex items-center justify-center transition-all"
        >
          <span className="material-symbols-rounded">chevron_right</span>
        </button>
        <button
          onClick={() => changeSlide((active + 1) % currentSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full border border-white/20 flex items-center justify-center transition-all"
        >
          <span className="material-symbols-rounded">chevron_left</span>
        </button>
      </div>

    </section>
  );
}
