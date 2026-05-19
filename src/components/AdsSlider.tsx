"use client"

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const ADS = [
  { 
     bg: "from-[#0F172A] to-[#C5A021]", 
     title: "مساحة إعلانية لمتجرك", 
     desc: "أبرز منتجاتك أمام آلاف الزوار", 
     icon: "campaign", 
     href: "/contact", 
     img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
     bg: "from-[#F29124] to-[#D97B10]", 
     title: "عرض لفترة محدودة؟", 
     desc: "أعلن هنا عن أحدث التخفيضات", 
     icon: "local_offer", 
     href: "/contact", 
     img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200"
  },
  { 
     bg: "from-[#2C1810] to-[#4A2F25]", 
     title: "منتجك الجديد", 
     desc: "احجز مساحتك الآن للترويج", 
     icon: "storefront", 
     href: "/vendor/register",
     img: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=1200"
  },
];

const ADS_SET_B = [
  { 
     bg: "from-[#C5A021] to-[#0F172A]", 
     title: "أفضل الماركات العالمية", 
     desc: "تجدونها الآن وحصرياً على مرسال", 
     icon: "verified", 
     href: "/shop", 
     img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
     bg: "from-[#D97B10] to-[#2C1810]", 
     title: "توصيل مجاني", 
     desc: "على طلباتك الأولى فوق 50,000 ج.س", 
     icon: "local_shipping", 
     href: "/shop", 
     img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200"
  },
];

export default function AdsSlider({ set = "A" }: { set?: "A" | "B" }) {
  const [active, setActive] = useState(0);
  const data = set === "A" ? ADS : ADS_SET_B;

  useEffect(() => {
    const t = setInterval(() => setActive(prev => (prev + 1) % data.length), 5000);
    return () => clearInterval(t);
  }, [data.length]);

  return (
    <section className="py-10 bg-white" dir="rtl">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
        <div className="relative h-[200px] md:h-[300px] rounded-[2rem] overflow-hidden shadow-2xl group">
          {data.map((ad, i) => (
            <div
              key={i}
              className={cn(
                "absolute inset-0 transition-all duration-1000 ease-in-out flex items-center justify-between px-8 md:px-20 bg-gradient-to-l",
                ad.bg,
                i === active ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
              )}
            >
              {/* Background image overlay */}
              <div className="absolute inset-0 z-0">
                <Image src={ad.img} alt={ad.title} fill className="object-cover opacity-20 mix-blend-overlay" />
              </div>

              {/* Content */}
              <div className="relative z-10 space-y-2 md:space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <span className="material-symbols-rounded text-white text-2xl md:text-3xl">{ad.icon}</span>
                  </div>
                  <h3 className="text-xl md:text-4xl font-black text-white drop-shadow-lg">{ad.title}</h3>
                </div>
                <p className="text-sm md:text-xl text-white/80 font-bold max-w-xl">{ad.desc}</p>
                <Link
                  href={ad.href}
                  className="inline-flex items-center gap-2 px-6 py-2.5 md:px-10 md:py-4 bg-white text-[#0F172A] rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:scale-105 transition-transform"
                >
                  احجز الآن
                  <span className="material-symbols-rounded text-lg">arrow_back</span>
                </Link>
              </div>

              {/* Visual Element */}
              <div className="hidden lg:block relative z-10 h-[220px] w-[220px]">
                 <div className="absolute inset-0 bg-white/10 rounded-full animate-ping" />
                 <div className="absolute inset-4 bg-white/20 rounded-full backdrop-blur-md flex items-center justify-center border border-white/30">
                    <span className="material-symbols-rounded text-8xl text-white opacity-40">campaign</span>
                 </div>
              </div>
            </div>
          ))}

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {data.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === active ? "w-8 bg-white" : "w-2 bg-white/30"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
