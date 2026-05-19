"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MobileFloatingNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "الرئيسية", icon: "home", href: "/" },
    { label: "الأقسام", icon: "grid_view", href: "/categories" },
    { label: "البحث", icon: "search", href: "/search" },
    { label: "السلة", icon: "shopping_cart", href: "/cart", count: 0 },
    { label: "حسابي", icon: "person", href: "/login" },
  ];

  return (
    <div className="lg:hidden fixed bottom-10 left-6 right-6 z-[200]">
      <div className="bg-[#0F172A]/90 backdrop-blur-3xl border-2 border-white/10 rounded-[2.5rem] px-8 py-5 shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex items-center justify-between">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={i} 
              href={item.href}
              className="relative flex flex-col items-center gap-1 group"
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                isActive ? "bg-[#C5A021] text-white shadow-[0_10px_20px_rgba(16,137,164,0.4)] scale-110 -translate-y-4" : "text-white/40 group-hover:text-white"
              )}>
                <span className={cn(
                  "material-symbols-rounded text-2xl transition-all",
                  isActive ? "fill-1" : "font-light"
                )}>{item.icon}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#F29124] text-[#0F172A] text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#0F172A]">
                    {item.count}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-[0.2em] transition-all",
                isActive ? "text-[#C5A021] opacity-100" : "text-white/20 opacity-0 transform translate-y-2"
              )}>{item.label}</span>
              
              {isActive && (
                <div className="absolute -bottom-2 w-1 h-1 bg-[#F29124] rounded-full shadow-[0_0_10px_#F29124]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
