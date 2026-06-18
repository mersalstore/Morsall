"use client"

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const ADS = [
  { 
     href: "/shop", 
     img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
     href: "/shop", 
     img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200"
  },
  { 
     href: "/vendor/register",
     img: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=1200"
  },
];

const ADS_SET_B = [
  { 
     href: "/shop", 
     img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
     href: "/shop", 
     img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200"
  },
  { 
     href: "/shop", 
     img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200"
  },
];

export default function AdsSlider({ set = "A" }: { set?: "A" | "B" }) {
  const [active, setActive] = useState(0);
  const [slides, setSlides] = useState<any[]>(set === "A" ? ADS : ADS_SET_B);

  useEffect(() => {
    fetch("/api/admin/settings/appearance")
      .then(r => r.json())
      .then(data => {
        const banners = Array.isArray(data?.banners) ? data.banners : [];
        const typeFilter = set === "A" ? "HOME_AD_A" : "HOME_AD_B";
        const filtered = banners
          .filter((b: any) => b.type === typeFilter && b.isActive !== false && b.imageUrl)
          .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
          .map((b: any) => ({
            href: b.link || "/shop",
            img: b.imageUrl,
            title: b.title || ""
          }));

        if (filtered.length > 0) {
          setSlides(filtered);
          setActive(0);
        }
      })
      .catch(() => {});
  }, [set]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setActive(prev => (prev + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className="py-10 bg-white" dir="rtl">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
        <div className="relative h-[200px] md:h-[300px] rounded-[2rem] overflow-hidden shadow-sm group bg-gray-50">
          {slides.map((ad, i) => (
            <div
              key={i}
              className={cn(
                "absolute inset-0 transition-all duration-1000 ease-in-out w-full h-full",
                i === active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              )}
            >
              <Link href={ad.href} className="block w-full h-full relative">
                <Image 
                  src={ad.img} 
                  alt={ad.title || "إعلان ترويجي"} 
                  fill 
                  className="object-cover" 
                  priority
                />
              </Link>
            </div>
          ))}

          {/* Dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === active ? "w-8 bg-white shadow-sm" : "w-2 bg-white/40"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
