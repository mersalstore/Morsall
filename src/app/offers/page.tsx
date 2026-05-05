"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ProductCard";

const discountProducts = [
  { 
    id: "d1", 
    title: "سماعات سوني WH-1000XM5 العازلة للضوضاء", 
    price: 185000, 
    oldPrice: 240000,
    vendor: "تكنو زون", 
    vendorLocation: "الخرطوم", 
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800", 
    discount: 25,
    stock: 12,
    sold: 75
  },
  { 
    id: "d2", 
    title: "آبل آيفون 15 برو ماكس - تيتانيوم", 
    price: 980000, 
    oldPrice: 1100000,
    vendor: "مرسال جادجتس", 
    vendorLocation: "الخرطوم", 
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800", 
    discount: 15,
    stock: 5,
    sold: 90
  },
  { 
    id: "d3", 
    title: "ساعة رولكس أويستر بربتشوال", 
    price: 950000, 
    oldPrice: 1200000,
    vendor: "نخبة الساعات", 
    vendorLocation: "الخرطوم", 
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800", 
    discount: 20,
    stock: 3,
    sold: 95
  },
  { 
    id: "d4", 
    title: "جهاز قهوة نسبريسو فيرتو", 
    price: 65000, 
    oldPrice: 95000,
    vendor: "البيت العصري", 
    vendorLocation: "بحري", 
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&q=80&w=800", 
    discount: 30,
    stock: 25,
    sold: 40
  }
];

export default function OffersPage() {
  const [config, setConfig] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 14, minutes: 22, seconds: 55 });

  useEffect(() => {
    fetch("/api/site-config?key=offers_config")
      .then(res => res.json())
      .then(data => {
        if (data) setConfig(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white pb-44">
      {/* 1. Flash Sale Hero Section */}
      <section className="bg-[#1089A4] pt-44 pb-24 px-12 relative overflow-hidden">
         <div className="max-w-[1920px] mx-auto flex flex-col items-center text-center space-y-12 relative z-10">
            <div className="flex flex-col items-center gap-6">
              <span className="bg-[#F29124] text-[#021D24] px-10 py-3 rounded-full text-xs font-black uppercase tracking-[0.4em] shadow-3xl animate-bounce">
                {config?.offersHeroBadge || "خصومات اليوم المحدودة"}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none font-heading whitespace-pre-line">
                {config?.offersHeroTitle || "صفقات كبرى \n لا تتكرر"}
              </h1>
            </div>

            <div className="flex items-center gap-8 md:gap-16">
               <span className="text-white/40 font-black text-xs uppercase tracking-[0.5em] hidden md:block">ينتهي العرض خلال:</span>
               <div className="flex items-center gap-8 font-heading">
                  <CountdownUnit value={timeLeft.hours} label="ساعة" />
                  <span className="text-white text-3xl font-black animate-pulse opacity-20">:</span>
                  <CountdownUnit value={timeLeft.minutes} label="دقيقة" />
                  <span className="text-white text-3xl font-black animate-pulse opacity-20">:</span>
                  <CountdownUnit value={timeLeft.seconds} label="ثانية" />
               </div>
            </div>
         </div>
         {/* Atmospheric washer */}
         <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-white to-transparent" />
         <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-[#F29124]/10 blur-[150px] rounded-full pointer-events-none" />
      </section>

      {/* 2. Hero Deal of the Day */}
      <section className="max-w-[1920px] mx-auto px-6 md:px-12 -mt-20 relative z-20">
         <div className="bg-[#021D24] rounded-[3.5rem] p-10 md:p-20 grid grid-cols-1 lg:grid-cols-2 gap-20 shadow-4xl relative overflow-hidden border-8 border-white">
            <div className="relative h-[400px] lg:h-[600px] rounded-[2.5rem] overflow-hidden group">
               <Image src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1200" alt="Hero Deal" fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
               <div className="absolute top-10 left-10 bg-[#FF0000] text-white px-8 py-4 rounded-2xl font-black text-xs tracking-widest shadow-2xl animate-pulse">خصم 45%</div>
            </div>
            <div className="flex flex-col justify-center space-y-10 text-right">
               <div className="space-y-4">
                   <span className="text-[#F29124] text-[10px] font-black uppercase tracking-[0.4em]">DEAL OF THE MOMENT</span>
                   <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-tight font-heading">ماك بوك برو M3 <br /> الإصدار السينمائي</h2>
                   <p className="text-white/40 text-sm font-medium leading-relaxed max-w-xl pr-2 border-r-4 border-[#1089A4]/30">تحكم كامل في القوة والإبداع مع أقوى معالج في تاريخ آبل، متاح الآن بخصم لفترة محدودة جداً.</p>
               </div>
               
               <div className="space-y-6">
                   <div className="flex items-baseline gap-4 justify-end">
                      <span className="text-white text-3xl md:text-4xl font-black tracking-tighter">1,250,000 ج.س</span>
                      <span className="text-white/20 text-xl font-black line-through">1,800,000</span>
                  </div>
                  <div className="space-y-4">
                     <div className="h-4 bg-white/5 rounded-full overflow-hidden relative border border-white/10">
                        <div className="absolute inset-y-0 right-0 bg-gradient-to-l from-[#F29124] to-[#1089A4] w-[85%] rounded-full shadow-[0_0_20px_rgba(242,145,36,0.3)] animate-pulse" />
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-[#F29124]">المتبقي: قطع قليلة</span>
                        <span className="text-white/40">تم حجز 85% من المخزون الصيفي</span>
                     </div>
                  </div>
               </div>

               <button className="w-full bg-[#1089A4] text-white py-8 rounded-3xl font-black text-sm uppercase tracking-[0.4em] shadow-3xl hover:bg-[#F29124] hover:text-[#021D24] transition-all hover:-translate-y-2 active:scale-95 border-b-8 border-black/10">
                 احصل على العرض الاستثنائي الآن
               </button>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(16,137,164,0.1),transparent)] pointer-events-none" />
         </div>
      </section>

      {/* 3. Discount Grid */}
      <section className="max-w-[1920px] mx-auto px-6 md:px-12 py-32 space-y-20">
         <div className="flex flex-col md:flex-row items-end justify-between gap-10">
            <div className="space-y-5">
                <h3 className="text-2xl md:text-4xl font-black text-[#021D24] tracking-tighter font-heading border-r-8 border-[#F29124] pr-6">عروض <span className="text-[#1089A4]">الساعة الحالية</span></h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#021D24]/20 pr-8">تحديث كل 6 ساعات لضمان أفضل سعر في السوق</p>
            </div>
            <div className="flex gap-4">
               {["الكل", "إلكترونيات", "أزياء", "منزل"].map((cat) => (
                 <button key={cat} className="px-10 py-4 bg-muted text-[#021D24] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1089A4] hover:text-white transition-all shadow-xl">{cat}</button>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12">
            {discountProducts.map((p) => (
              <div key={p.id} className="group relative space-y-8">
                 <ProductCard {...p} badge={`خصم ${p.discount}%`} />
                 {/* Scarcity Bar for each product */}
                 <div className="px-4 space-y-3">
                    <div className="h-1.5 bg-muted rounded-full relative overflow-hidden">
                       <div 
                         className="absolute inset-y-0 right-0 bg-[#F29124] rounded-full transition-all duration-1000 group-hover:bg-[#1089A4]" 
                         style={{ width: `${p.sold}%` }}
                       />
                    </div>
                    <div className="flex justify-between text-[9px] font-bold text-foreground/40 uppercase tracking-widest">
                       <span>تم بيع {p.sold}%</span>
                       <span>المتبقي {p.stock} قطعة</span>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number, label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[70px] p-4 bg-white/5 backdrop-blur-3xl rounded-[1.5rem] border border-white/10 group hover:bg-[#F29124]/10 transition-all cursor-default">
       <span className="text-3xl md:text-4xl font-black text-white group-hover:scale-110 transition-transform">{value.toString().padStart(2, '0')}</span>
       <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{label}</span>
    </div>
  );
}
