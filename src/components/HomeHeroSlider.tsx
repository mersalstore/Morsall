"use client";

import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    fetch("/api/site-config?key=heroImagePosition")
      .then(r => r.json())
      .then(val => { if (val) setHeroImagePosition(val); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(p => (p + 1) % HERO_SLIDES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="pt-28 md:pt-36 pb-6 px-4 lg:px-8 max-w-[1600px] mx-auto w-full">
      <div className="bg-[#0F172A] rounded-2xl overflow-hidden shadow-sm h-[380px] md:h-[430px] lg:h-[480px] relative">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === activeSlide;
          return (
            <div 
              key={idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 flex items-center ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
            >
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <Image 
                  src={slide.img} 
                  alt={slide.title}
                  fill 
                  className="object-cover brightness-[0.24]" 
                  style={{ objectPosition: heroImagePosition }}
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-transparent" />
              </div>

              {/* Text Panel */}
              <div className="relative z-10 max-w-2xl px-6 md:px-16 text-right space-y-4 text-white">
                <span className="inline-block px-3 py-1 rounded bg-[#F29124] text-[10px] font-bold tracking-wider">
                  {slide.badge}
                </span>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black leading-tight">
                  {slide.title}
                </h1>
                <h2 className="text-sm md:text-base font-bold text-slate-300">
                  {slide.subtitle}
                </h2>
                <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed max-w-lg">
                  {slide.desc}
                </p>
                
                <div className="flex gap-3 pt-2">
                  <Link 
                    href={slide.ctaLink}
                    className="px-6 py-2.5 bg-[#F29124] hover:bg-[#d67b1b] text-white font-bold text-xs rounded transition-colors shadow-sm"
                  >
                    {slide.cta}
                  </Link>
                  <Link 
                    href="#products"
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded border border-white/20 transition-colors"
                  >
                    تصفح السوق
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {/* Slider Dots */}
        <div className="absolute bottom-5 left-5 z-20 flex gap-1.5">
          {HERO_SLIDES.map((_, i) => (
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
