"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BarChart3, 
  Box, 
  ShoppingBasket, 
  Tag, 
  MessageSquare, 
  Megaphone, 
  CreditCard, 
  Settings, 
  Store,
  LogOut,
  ChevronRight
} from "lucide-react";
import Image from "next/image";
import { signOut } from "next-auth/react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  slug?: string;
}

const NAV_ITEMS = [
  { id: "overview",  icon: LayoutDashboard, label: "لوحة التحكم", group: "عام" },
  { id: "analytics", icon: BarChart3,      label: "التحليلات", group: "عام" },
  
  { id: "products",  icon: Box,              label: "المنتجات", group: "إدارة" },
  { id: "orders",    icon: ShoppingBasket,   label: "الطلبات", group: "إدارة" },
  { id: "coupons",   icon: Tag,             label: "الكوبونات", group: "إدارة" },
  
  { id: "reviews",   icon: MessageSquare,       label: "التقييمات", group: "تواصل" },
  { id: "promotion", icon: Megaphone,         label: "الترويج", group: "تواصل" },
  
  { id: "finance",   icon: CreditCard,   label: "المالية", group: "إعدادات" },
  { id: "settings",  icon: Settings,         label: "إعدادات المتجر", group: "إعدادات" },
];

export default function VendorSidebar({ activeTab, setActiveTab, slug }: SidebarProps) {
  const groups = Array.from(new Set(NAV_ITEMS.map(i => i.group)));

  return (
    <aside className="w-72 bg-[#0F1629] text-white flex flex-col h-screen sticky top-0 shadow-2xl z-50 overflow-y-auto custom-scrollbar border-l border-white/5" dir="rtl">
      {/* Brand Section */}
      <div className="p-8 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white/10 p-1 border border-white/10">
             <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <div>
            <p className="font-black text-white text-lg leading-none">مرسال</p>
            <p className="text-[10px] font-bold text-[#1089A4] mt-1 uppercase tracking-widest">لوحة التاجر</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-grow py-6 px-4 space-y-8">
        {groups.map(group => (
          <div key={group} className="space-y-2">
            <h4 className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{group}</h4>
            <div className="space-y-1">
              {NAV_ITEMS.filter(i => i.group === group).map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-all group relative",
                    activeTab === item.id
                      ? "bg-[#1089A4] text-white shadow-lg shadow-[#1089A4]/20"
                      : "text-white/40 hover:bg-white/5 hover:text-white/80"
                  )}
                >
                  <item.icon size={18} className={cn(
                    "transition-colors",
                    activeTab === item.id ? "text-white" : "text-[#1089A4]/60 group-hover:text-[#1089A4]"
                  )} />
                  {item.label}
                  {activeTab === item.id && (
                    <div className="absolute left-2 w-1.5 h-1.5 bg-[#F29124] rounded-full shadow-[0_0_8px_#F29124]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="p-6 border-t border-white/5 bg-black/20 space-y-3">
        <a 
          href={`/store/${slug}`} 
          target="_blank" 
          className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1089A4]/20 text-[#1089A4] flex items-center justify-center">
              <Store size={16} />
            </div>
            <span className="text-xs font-black">زيارة متجرك</span>
          </div>
          <ChevronRight size={14} className="text-white/20 group-hover:text-[#F29124] transition-colors" />
        </a>
        
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-black hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
        >
          <LogOut size={14} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
