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
  | "delivery" | "shipping" | "finance" | "settings" | "inventory" | "drivers" | "subscriptions" | "attributes" | "globalSettings" | "appearance";

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  userRole: string;
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
  { id: "globalSettings", icon: Settings,      label: "الإعدادات العامة", group: "إعدادات" },
];

const ROLE_PERMISSIONS: Record<string, TabId[]> = {
  ADMIN: ["overview", "approvals", "users", "vendors", "categories", "employees", "orders", "payments", "delivery", "shipping", "finance", "settings", "inventory", "drivers", "subscriptions", "attributes", "globalSettings", "appearance"],
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

export default function AdminSidebar({ activeTab, setActiveTab, userRole }: SidebarProps) {
  const { data: session } = useSession();
  
  const allowedItems = NAV_ITEMS.filter(item => 
    ROLE_PERMISSIONS[userRole]?.includes(item.id)
  );

  const groups = Array.from(new Set(allowedItems.map(i => i.group)));

  return (
    <aside className="hidden lg:flex w-72 bg-[#0F1629] text-white flex-col h-screen sticky top-0 shadow-2xl z-50 overflow-y-auto custom-scrollbar">
      {/* Logo Section */}
      <div className="p-8 border-b border-white/5">
        <div className="relative w-full h-12 mb-2">
          <Image 
            src="/logo-navbar-final.png" 
            alt="Mersall Logo" 
            fill 
            className="object-contain filter brightness-110" 
          />
        </div>
        <div className="text-center mt-4">
          <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Mersall Logistics</span>
        </div>
      </div>

      {/* Nav Section */}
      <div className="flex-grow py-6 px-4 space-y-8">
        {groups.map(group => (
          <div key={group} className="space-y-2">
            <h4 className="px-4 text-[10px] font-black text-[#1089A4] uppercase tracking-widest opacity-80">{group}</h4>
            <div className="space-y-1">
              {allowedItems.filter(i => i.group === group).map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-all relative group",
                    activeTab === item.id
                      ? "bg-[#1089A4] text-white shadow-lg shadow-[#1089A4]/20"
                      : "text-white/50 hover:bg-white/5 hover:text-white/80"
                  )}
                >
                  <item.icon size={18} className={cn(
                    "transition-colors",
                    activeTab === item.id ? "text-white" : "text-[#1089A4]/60 group-hover:text-[#1089A4]"
                  )} />
                  {item.label}
                  {activeTab === item.id && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute right-0 w-1 h-5 bg-[#F29124] rounded-l-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Profile Section */}
      <div className="p-6 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1089A4] to-[#0F1629] flex items-center justify-center font-black text-lg border border-white/10 shadow-xl">
            {session?.user?.name?.[0] || "A"}
          </div>
          <div className="flex-grow">
            <p className="text-xs font-black truncate">{session?.user?.name || "Admin"}</p>
            <p className="text-[10px] text-[#F29124] font-black uppercase">{ROLES[userRole] || userRole}</p>
          </div>
        </div>
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-xs font-black hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
        >
          <LogOut size={14} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
