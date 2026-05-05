"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CampaignBar() {
  const [config, setConfig] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 12, minutes: 45, seconds: 0 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetch("/api/site-config?key=offers_config")
      .then(res => res.json())
      .then(data => {
        if (data) {
          setConfig(data);
          setTimeLeft({ days: 0, hours: data.campaignHoursLeft || 12, minutes: data.campaignMinutesLeft || 45, seconds: 0 });
        }
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

  if (!isVisible || (config && !config.campaignEnabled)) return null;

  return (
    <div className="bg-[#1089A4] text-white py-3 md:py-6 relative overflow-hidden group">
      {/* Background Animated Pulse */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 animate-shimmer pointer-events-none" />
      
      <div className="responsive-container kill-scroll flex flex-col md:flex-row items-center justify-center gap-6 md:gap-[clamp(2rem,10vw,8rem)] relative z-10">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-10 text-center sm:text-right">
           <span className="bg-[#F29124] text-[#021D24] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl border-2 border-white/10 flex-shrink-0">عروض مرسـال</span>
           <div className="text-[clamp(11px,4vw,18px)] font-black leading-tight text-center md:text-right">
              {config?.campaignTitle || "خصومات كبرى تصل إلى 60%"} <span className="hidden sm:inline text-[9px] md:text-sm text-white/50">{config?.campaignSubtitle || "على كافة الأجهزة والإلكترونيات"}</span>
           </div>
        </div>

        <div className="flex flex-row items-center justify-center gap-4 md:gap-16">
           <div className="flex items-center gap-3 md:gap-8">
              <span className="text-[9px] font-black text-white/40 uppercase hidden sm:inline">ينتهي خلال:</span>
              <div className="flex items-center gap-2 md:gap-6 font-heading">
                 <TimeUnit value={timeLeft.hours} label="ساعة" />
                 <span className="text-[#F29124] text-[11px] font-black animate-pulse">:</span>
                 <TimeUnit value={timeLeft.minutes} label="دقيقة" />
                 <span className="text-[#F29124] text-[11px] font-black animate-pulse">:</span>
                 <TimeUnit value={timeLeft.seconds} label="ثانية" />
              </div>
           </div>

           <Link href={config?.campaignButtonLink || "/shop"} className="bg-white text-[#1089A4] px-5 md:px-12 py-2 md:py-4 rounded-full text-[9px] md:text-xs font-black uppercase hover:bg-[#F29124] hover:text-[#021D24] transition-all shadow-2xl hover:scale-105 active:scale-95 border-b-2 border-black/10">
              {config?.campaignButtonText || "تـسـوق"}
           </Link>
        </div>
      </div>
      
      {/* Absolute Close Option */}
      <button onClick={() => setIsVisible(false)} className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-100 transition-opacity hidden xl:block">
         <span className="material-symbols-rounded text-2xl text-white">close</span>
      </button>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
       <span className="w-12 text-center text-3xl font-black leading-none tracking-tighter text-white">{value.toString().padStart(2, '0')}</span>
       <span className="text-[9px] text-white/30 uppercase font-black tracking-widest leading-none">{label}</span>
    </div>
  );
}
