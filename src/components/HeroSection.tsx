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
    bg: "from-[#0C3547] to-[#0F172A]",
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
    bg: "from-[#2C1810] to-[#0F172A]",
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
    fetch("/api/admin/settings/appearance")
      .then(res => res.json())
      .then(data => {
        if (data.banners && data.banners.length > 0) {
          setDynamicBanners(data.banners);
        }
      })
      .catch(err => console.error("Banner fetch error:", err));
  }, []);

  const currentSlides = dynamicBanners.length > 0 
    ? dynamicBanners.map(b => ({
        tag: b.subtitle || "عروض حصرية",
        title: b.title || "مرسال السودان",
        desc: "اكتشف أفضل المنتجات والماركات العالمية بأسعار تنافسية وتوصيل سريع لباب بيتك.",
        cta: "تسوق الآن",
        ctaHref: b.link || "/shop",
        img: b.imageUrl,
        badge: "جديد",
      }))
    : SLIDES.map(s => ({ ...s, title: s.title, desc: s.desc, cta: s.cta, img: s.img, badge: s.badge, tag: s.tag }));

  useEffect(() => {
    if (currentSlides.length <= 1) return;
    const t = setInterval(() => changeSlide((active + 1) % currentSlides.length), 6000);
    return () => clearInterval(t);
  }, [active, currentSlides.length]);

  const changeSlide = (idx: number) => {
    setTransitioning(true);
    setTimeout(() => { setActive(idx); setTransitioning(false); }, 400);
  };

  const s = currentSlides[active];

  return (
    <section className="w-full pt-[80px]" dir="rtl">
      <div className="relative h-[450px] md:h-[500px] lg:h-[550px] w-full overflow-hidden bg-[#0F172A]">
        
        {/* Slide Content */}
        <div className="absolute inset-0">
          <Image
            src={s.img}
            alt={s.title}
            fill
            className={cn(
              "object-cover transition-all duration-1000 ease-out scale-105",
              transitioning ? "opacity-0 scale-110 blur-sm" : "opacity-100 scale-100 blur-0"
            )}
            priority
          />
          {/* Enhanced Gradients for Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 via-[#0F172A]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/60 via-transparent to-transparent" />
        </div>

        {/* Text Overlay - Positioned for Premium Look */}
        <div className={cn(
          "relative h-full max-w-[1600px] mx-auto px-6 lg:px-24 flex flex-col justify-center items-start transition-all duration-700",
          transitioning ? "opacity-0 -translate-x-10" : "opacity-100 translate-x-0"
        )}>
          <div className="space-y-4 md:space-y-6 max-w-2xl text-right mt-10 md:mt-0">
            <div className="flex items-center gap-3">
               <span className="w-8 md:w-12 h-[2px] bg-[#F29124]" />
               <span className="text-[#F29124] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.4em]">{s.tag}</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white leading-[1.2] drop-shadow-2xl">
              {s.title}
            </h1>
            
            <p className="text-xs sm:text-sm md:text-xl text-white/70 font-medium leading-relaxed max-w-lg">
              {s.desc}
            </p>

            <div className="pt-4 md:pt-6 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href={s.ctaHref}
                className="group relative px-6 md:px-12 py-3.5 md:py-5 bg-[#C5A021] text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm overflow-hidden shadow-2xl shadow-[#C5A021]/30 hover:shadow-[#F29124]/40 transition-all active:scale-95 w-full sm:w-auto flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-[#F29124] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative flex items-center gap-2 md:gap-3">
                  {s.cta}
                  <span className="material-symbols-rounded text-lg group-hover:-translate-x-2 transition-transform">arrow_back</span>
                </span>
              </Link>
              
              <Link
                href="/shop"
                className="px-6 md:px-10 py-3.5 md:py-5 bg-white/5 backdrop-blur-xl text-white border border-white/10 rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:bg-white/10 transition-all w-full sm:w-auto flex items-center justify-center"
              >
                اكتشف الأقسام
              </Link>
            </div>
          </div>
        </div>

        {/* Dynamic Badge */}
        <div className={cn(
          "absolute top-12 left-12 bg-white/90 backdrop-blur-md p-6 rounded-[2.5rem] shadow-2xl transition-all duration-1000 hidden lg:block",
          transitioning ? "opacity-0 translate-y-10" : "opacity-100 translate-y-0"
        )}>
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black text-[#0F172A] uppercase tracking-widest">متوفر الآن</span>
            <div className="h-px w-8 bg-gray-200" />
            <span className="text-[#C5A021] text-xs font-black">{s.badge}</span>
          </div>
        </div>

        {/* Slide Controls */}
        {currentSlides.length > 1 && (
          <>
            {/* Dots */}
            <div className="absolute bottom-6 md:bottom-10 right-0 left-0 flex justify-center md:justify-start md:right-24 gap-3 md:gap-4 z-50">
              {currentSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => changeSlide(i)}
                  className="p-2 transition-all"
                  aria-label={`Go to slide ${i + 1}`}
                >
                  <div className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === active ? "w-8 md:w-16 bg-[#F29124]" : "w-4 md:w-6 bg-white/30 hover:bg-white/50"
                  )} />
                </button>
              ))}
            </div>

            {/* Arrows - Premium Minimalist */}
            <div className="hidden md:flex absolute bottom-10 left-6 lg:left-24 gap-6 z-50">
              <button 
                type="button"
                onClick={() => changeSlide((active - 1 + currentSlides.length) % currentSlides.length)}
                className="w-16 h-16 rounded-full border border-white/20 bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-[#0F172A] transition-all cursor-pointer hover:scale-110 active:scale-95"
              >
                <span className="material-symbols-rounded text-2xl font-bold">chevron_right</span>
              </button>
              <button 
                type="button"
                onClick={() => changeSlide((active + 1) % currentSlides.length)}
                className="w-16 h-16 rounded-full border border-white/20 bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-[#0F172A] transition-all cursor-pointer hover:scale-110 active:scale-95"
              >
                <span className="material-symbols-rounded text-2xl font-bold">chevron_left</span>
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
