"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  CheckCircle, 
  ShoppingBag, 
  Users, 
  Store, 
  Layers, 
  Settings2, 
  Box, 
  UsersRound, 
  Truck, 
  CreditCard, 
  Gem, 
  MapPin, 
  Settings, 
  Palette,
  ArrowUpRight,
  TrendingUp,
  PackageSearch,
  LogOut
} from "lucide-react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

export type TabId =
  | "overview" | "approvals" | "users" | "vendors"
  | "categories" | "employees" | "orders" | "payments"
  | "delivery" | "shipping" | "finance" | "settings" | "inventory" | "drivers" | "subscriptions" | "attributes" | "globalSettings" | "appearance" | "offersAds";

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  userRole: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS: { id: TabId; icon: any; label: string; group?: string }[] = [
  { id: "overview",    icon: LayoutDashboard,  label: "لوحة التحكم", group: "عام" },
  { id: "approvals",   icon: CheckCircle,      label: "الموافقات", group: "عام" },
  
  { id: "orders",      icon: ShoppingBag,      label: "الطلبات", group: "إدارة" },
  { id: "inventory",   icon: Box,               label: "المنتجات", group: "إدارة" },
  { id: "categories",  icon: Layers,           label: "الأقسام", group: "إدارة" },
  { id: "attributes",  icon: Settings2,         label: "سمات المنتجات", group: "إدارة" },
  
  { id: "users",       icon: Users,            label: "العملاء", group: "الأعضاء" },
  { id: "vendors",     icon: Store,            label: "الموردون", group: "الأعضاء" },
  { id: "employees",   icon: UsersRound,       label: "الموظفون", group: "الأعضاء" },
  { id: "drivers",     icon: Truck,            label: "المناديب", group: "الأعضاء" },
  
  { id: "finance",     icon: CreditCard,       label: "المالية", group: "عمليات" },
  { id: "subscriptions",icon: Gem,               label: "الاشتراكات", group: "عمليات" },
  { id: "delivery",    icon: MapPin,           label: "مناطق التوصيل", group: "عمليات" },
  
  { id: "appearance",  icon: Palette,          label: "المظهر والصور", group: "إعدادات" },
  { id: "offersAds",   icon: TrendingUp,        label: "العروض والإعلانات", group: "إعدادات" },
  { id: "globalSettings", icon: Settings,      label: "الإعدادات العامة", group: "إعدادات" },
];

const ROLE_PERMISSIONS: Record<string, TabId[]> = {
  ADMIN: ["overview", "approvals", "users", "vendors", "categories", "employees", "orders", "payments", "delivery", "shipping", "finance", "settings", "inventory", "drivers", "subscriptions", "attributes", "globalSettings", "appearance", "offersAds"],
  PACKING: ["orders", "inventory"],
  SHIPPING: ["orders", "drivers"],
  CUSTOMER_SERVICE: ["overview", "approvals", "orders", "users"],
  INVENTORY: ["inventory", "categories", "vendors", "attributes"],
};

const ROLES: Record<string, string> = {
  PACKING: "مسؤول التغليف",
  SHIPPING: "مسؤول الشحن",
  CUSTOMER_SERVICE: "خدمة العملاء",
  INVENTORY: "أمين المخزون",
  ADMIN: "مدير النظام",
};

export default function AdminSidebar({ activeTab, setActiveTab, userRole, isOpen, onClose }: SidebarProps) {
  const { data: session } = useSession();
  
  const allowedItems = NAV_ITEMS.filter(item => 
    ROLE_PERMISSIONS[userRole]?.includes(item.id)
  );

  const groups = Array.from(new Set(allowedItems.map(i => i.group)));

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 right-0 w-80 bg-gradient-to-b from-[#021D24] via-[#021D24] to-[#011419] text-white flex flex-col h-screen shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[60] overflow-y-auto custom-scrollbar transition-transform duration-500 border-l border-white/5",
        "lg:sticky lg:top-0 lg:translate-x-0 lg:shrink-0",
        isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )} dir="rtl">
      {/* Logo Section */}
      <div className="p-10 border-b border-white/5 bg-white/5 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#1089A4]/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-[#1089A4]/20 transition-all duration-1000" />
        <div className="relative w-full h-14 mb-4 transform group-hover:scale-105 transition-transform duration-500">
          <Image 
            src="/logo-navbar-final.png" 
            alt="Mobhroon Logo" 
            fill 
            className="object-contain filter drop-shadow-[0_0_8px_rgba(16,137,164,0.3)]" 
          />
        </div>
        <div className="text-center">
          <p className="text-[#1089A4] text-[10px] font-black uppercase tracking-[0.4em] mb-1">Mobhroon Platform</p>
          <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-[#F29124] to-transparent mx-auto opacity-50" />
        </div>
      </div>

      {/* Nav Section */}
      <div className="flex-grow py-8 px-6 space-y-10">
        {groups.map(group => (
          <div key={group} className="space-y-3">
            <h4 className="px-5 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">{group}</h4>
            <div className="space-y-1.5">
              {allowedItems.filter(i => i.group === group).map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all relative group",
                    activeTab === item.id
                      ? "bg-gradient-to-l from-[#1089A4] to-[#0D6E84] text-white shadow-xl shadow-[#1089A4]/10 border border-white/10"
                      : "text-white/40 hover:bg-white/5 hover:text-white/80"
                  )}
                >
                  <item.icon size={18} className={cn(
                    "transition-all duration-300",
                    activeTab === item.id 
                      ? "text-white scale-110 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" 
                      : "text-[#1089A4]/40 group-hover:text-[#1089A4] group-hover:rotate-6"
                  )} />
                  <span className="flex-grow text-right">{item.label}</span>
                  {activeTab === item.id && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute right-0 w-1.5 h-6 bg-[#F29124] rounded-l-full shadow-[0_0_15px_#F29124]"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Profile Section */}
      <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-4 mb-6 group cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1089A4] to-[#021D24] flex items-center justify-center font-black text-xl border border-white/20 shadow-2xl group-hover:rotate-3 transition-transform">
            {session?.user?.name?.[0] || "A"}
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-xs font-black truncate text-white/90">{session?.user?.name || "Admin"}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
               <p className="text-[9px] text-[#F29124] font-black uppercase tracking-widest">{ROLES[userRole] || userRole}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => signOut()}
          className="group w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white/5 text-white/60 text-xs font-black hover:bg-red-500 hover:text-white transition-all duration-300 border border-white/5 hover:border-red-500/50"
        >
          <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  </>
  );
}
