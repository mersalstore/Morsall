"use client"

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/WishlistContext";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const NAV_CATS = [
  { label: "كل الأقسام",     href: "/shop",              icon: "menu" },
  { label: "الإلكترونيات",   href: "/category/electronics", icon: "smartphone" },
  { label: "الأزياء",        href: "/category/fashion",   icon: "checkroom" },
  { label: "المنزل والمطبخ", href: "/category/home",      icon: "kitchen" },
  { label: "الجمال والعناية",href: "/category/beauty",    icon: "face" },
  { label: "العروض 🔥",       href: "/offers",            icon: "bolt" },
  { label: "كبار المتاجر",  href: "/top-vendors",        icon: "storefront" },
  { label: "ابدأ تجارتك",    href: "/vendor/register",   icon: "add_business" },
];

export default function Navbar() {
  const { data: session, status, update } = useSession();
  const { cartCount } = useCart();
  const { favorites, compareList } = useWishlist();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userCity, setUserCity] = useState("جاري التحديد...");
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const isAuthenticated = status === "authenticated";
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/settings/appearance")
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSiteSettings(data.settings);
      })
      .catch(err => console.error("Settings fetch error:", err));
  }, []);

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/vendor")) {
    return null;
  }


  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // 1. Try local storage first
    const saved = localStorage.getItem("mersal_user_city");
    if (saved) {
      setUserCity(saved);
      return;
    }

    // 2. Try GeoIP (Sudan cities mapping)
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        const city = data.city || "الخرطوم";
        // Map English names to Arabic for Sudan
        const cityMap: Record<string, string> = {
          "Khartoum": "الخرطوم",
          "Omdurman": "أمدرمان",
          "Bahri": "بحري",
          "Port Sudan": "بورتسودان",
          "Atbara": "عطبرة",
          "Wad Madani": "ود مدني",
          "Kassala": "كسلا",
          "El Obeid": "الأبيض",
          "Kosti": "كوسطي",
          "Dongola": "دنقلا"
        };
        const arabicCity = cityMap[city] || city;
        setUserCity(arabicCity);
        localStorage.setItem("mersal_user_city", arabicCity);
      })
      .catch(() => setUserCity("الخرطوم")); // Fallback
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header 
      className={cn(
        "w-full fixed top-0 left-0 z-[100] flex flex-col transition-all duration-300",
        isScrolled ? "translate-y-[-2px]" : "translate-y-0"
      )} 
      dir="rtl"
    >
      {/* ── HIGH-END TOP BAR ─────────────────────────── */}
      <div className="bg-[#020D10] text-white shadow-2xl border-b border-white/5 relative">
        {/* Animated accent line */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#F29124] to-transparent opacity-50" 
        />
        
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 h-16 flex items-center gap-4 lg:gap-8">

          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-[150px] h-12 lg:w-[180px] lg:h-16"
            >
              <Image 
                src={siteSettings?.logo || "/logo-navbar-final.png"} 
                alt={siteSettings?.siteTitle || "مرسال - MERSAL"} 
                fill 
                className="object-contain" 
                priority 
              />
            </motion.div>
          </Link>

          {/* Location Picker (Premium Pill) */}
          <Link href="/delivery" className="hidden xl:flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-1.5 transition-all cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-[#F29124]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-rounded text-lg text-[#F29124]">location_on</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-white/40 font-medium">نصلك إلى</span>
              <span className="text-[13px] font-bold text-white">{userCity}</span>
            </div>
          </Link>

          {/* Advanced Search Bar */}
          <form 
            onSubmit={handleSearch} 
            className="flex-grow flex items-stretch h-11 bg-white/5 rounded-xl border border-white/10 hover:border-[#C5A021]/50 focus-within:border-[#C5A021] focus-within:ring-4 focus-within:ring-[#C5A021]/10 transition-all overflow-hidden"
          >
            <select className="hidden md:block bg-transparent text-white/70 text-[12px] font-bold px-4 hover:text-white outline-none cursor-pointer border-l border-white/10">
              <option className="bg-[#020D10]">كل الأقسام</option>
              <option className="bg-[#020D10]">الإلكترونيات</option>
              <option className="bg-[#020D10]">الأزياء</option>
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث عن أفضل العروض في مرسال..."
              className="flex-grow bg-transparent text-white px-5 text-sm outline-none placeholder:text-white/30 text-right"
            />
            <button
              type="submit"
              className="px-6 flex items-center justify-center text-white/50 hover:text-[#C5A021] transition-colors"
            >
              <span className="material-symbols-rounded text-2xl">search</span>
            </button>
          </form>

          {/* Action Icons */}
          <div className="flex items-center gap-2 lg:gap-5 shrink-0" ref={menuRef}>
            
            {/* Account Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserMenu(p => !p)}
                className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all text-center group"
              >
                <div className="relative group-hover:scale-110 transition-transform">
                  {isAuthenticated && session?.user?.image ? (
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-[#C5A021]/50 shadow-lg">
                      <Image 
                        src={session.user.image} 
                        alt={session.user.name || "User"} 
                        width={28} 
                        height={28} 
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <span className="material-symbols-rounded text-2xl text-white/70 group-hover:text-white transition-colors">person</span>
                  )}
                  <div className="absolute top-0 right-0 w-2 h-2 bg-[#C5A021] rounded-full border border-black shadow-[0_0_10px_rgba(197,160,33,0.5)]" />
                </div>
                <span className="text-[9px] font-black text-white/40 group-hover:text-white transition-colors uppercase tracking-widest leading-none mt-1">
                  {isAuthenticated ? (session?.user?.name?.split(' ')[0] || "حسابي") : "حسابي"}
                </span>
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 top-full mt-4 w-64 bg-[#0F172A] rounded-[2.5rem] shadow-3xl border border-white/5 backdrop-blur-2xl overflow-hidden z-50 text-right ring-1 ring-white/10"
                  >
                    {isAuthenticated ? (
                      <div className="p-2 space-y-1">
                        <div className="px-5 py-4 mb-3 bg-white/5 rounded-3xl border border-white/5">
                          <p className="text-sm font-black text-white tracking-tight">{session?.user?.name || "مستخدم مرسال"}</p>
                          <p className="text-[10px] text-[#C5A021] font-bold uppercase tracking-widest leading-none mt-1">{session?.user?.email}</p>
                        </div>

                        {/* Standard Links */}
                        <Link href="/profile" className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 text-xs font-bold text-white/80 transition-all group/item">
                          حسابي الشخصي
                          <span className="material-symbols-rounded text-lg opacity-40 group-hover/item:opacity-100 group-hover/item:text-[#C5A021]">person</span>
                        </Link>
                        
                        <Link href="/orders" className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 text-xs font-bold text-white/80 transition-all group/item">
                          طلباتي ومشترياتي
                          <span className="material-symbols-rounded text-lg opacity-40 group-hover/item:opacity-100 group-hover/item:text-[#C5A021]">package_2</span>
                        </Link>

                        <div className="h-px bg-white/5 my-2 mx-2" />

                        {/* Role Based Dashboards */}
                        {(session?.user as any)?.isVendor && (
                          <Link href="/vendor/dashboard" className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F29124]/10 hover:bg-[#F29124]/20 text-xs font-black text-[#F29124] transition-all group/item border border-[#F29124]/10">
                            لوحة تحكم التاجر
                            <span className="material-symbols-rounded text-lg group-hover/item:scale-110 transition-transform">storefront</span>
                          </Link>
                        )}

                        {(session?.user as any)?.role === 'ADMIN' && (
                          <Link href="/admin/dashboard" className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#1089A4]/10 hover:bg-[#1089A4]/20 text-xs font-black text-[#1089A4] transition-all group/item border border-[#1089A4]/10">
                            لوحة الإدارة
                            <span className="material-symbols-rounded text-lg group-hover/item:scale-110 transition-transform">admin_panel_settings</span>
                          </Link>
                        )}

                        {(session?.user as any)?.isVendor || (session?.user as any)?.role === 'ADMIN' ? (
                          <div className="h-px bg-white/5 my-2 mx-2" />
                        ) : null}

                        <button
                          onClick={() => signOut()}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-red-500/10 text-xs font-bold text-red-400 transition-all group/item"
                        >
                          تسجيل الخروج
                          <span className="material-symbols-rounded text-lg group-hover/item:translate-x-1 transition-transform">logout</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-5 space-y-4">
                        <div className="text-center space-y-1 mb-2">
                          <p className="text-sm font-black text-white">مرحباً بك في مرسال</p>
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">سجل دخولك لتتمتع بكافة المزايا</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Link href="/login" className="flex items-center justify-center h-12 bg-[#F29124] text-[#021D24] rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-[#F29124]/20 active:scale-95">
                            تسجيل الدخول
                          </Link>
                          <Link href="/login?tab=register" className="flex items-center justify-center h-12 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95">
                            إنشاء حساب جديد
                          </Link>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist */}
            <Link href="/wishlist" className="hidden lg:flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-white/5 transition-all relative group">
              <span className="material-symbols-rounded text-2xl text-white/70 group-hover:text-[#C5A021] transition-colors">favorite</span>
              <span className="text-[10px] font-bold text-white/40">المفضلة</span>
              {favorites.length > 0 && (
                <span className="absolute top-1 left-2 h-4 min-w-[16px] bg-[#C5A021] text-white text-[9px] font-black rounded-full flex items-center justify-center px-1">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Cart Button (Premium) */}
            <Link href="/cart">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#C5A021] text-white rounded-xl h-11 px-4 lg:px-6 flex items-center gap-3 shadow-lg shadow-[#C5A021]/20 hover:brightness-110 transition-all"
              >
                <div className="relative">
                  <span className="material-symbols-rounded text-2xl">shopping_bag</span>
                  <span className="absolute -top-1 -right-1 h-4 min-w-[16px] bg-white text-[#C5A021] text-[9px] font-black rounded-full flex items-center justify-center px-1">
                    {cartCount}
                  </span>
                </div>
                <span className="hidden lg:block text-sm font-black">السلة</span>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>

      {/* ── GLASS NAVIGATION BAR ─────────────────────────── */}
      <nav className="bg-[#020D10]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 flex items-center h-12">
          
          {/* Hamburger */}
          <button
            onClick={() => setShowCategories(p => !p)}
            className="flex items-center gap-3 px-4 h-full border-l border-white/5 font-black text-xs text-[#F29124] hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-rounded text-xl">menu</span>
            تصفح الأقسام
          </button>

          {/* Categories Links */}
          <div className="flex items-center h-full overflow-x-auto scrollbar-none">
            {NAV_CATS.slice(1).map(cat => (
              <Link
                key={cat.href}
                href={cat.href}
                className="px-5 h-full flex items-center text-[12px] font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
              >
                {cat.label}
              </Link>
            ))}
          </div>

          <div className="flex-grow" />

          {/* Promo Badge */}
          <div className="hidden lg:flex items-center gap-2 px-4 h-8 bg-[#F29124]/10 rounded-full border border-[#F29124]/20 text-[#F29124] text-[11px] font-bold animate-pulse">
            <span className="material-symbols-rounded text-sm">bolt</span>
            عروض الجمعة البيضاء وصلت!
          </div>
        </div>
      </nav>

      {/* Mobile Categories Sidebar (Optional/Re-implemented) */}
      <AnimatePresence>
        {showCategories && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[-1]"
              onClick={() => setShowCategories(false)}
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 w-80 h-screen bg-[#020D10] shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[101] p-6 text-white border-l border-white/10"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black">أقسام مرسال</h3>
                <button onClick={() => setShowCategories(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">
                  <span className="material-symbols-rounded">close</span>
                </button>
              </div>
              <div className="space-y-2">
                {NAV_CATS.map(cat => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    onClick={() => setShowCategories(false)}
                    className="flex items-center justify-between px-4 py-4 rounded-2xl hover:bg-white/5 border border-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-rounded text-[#F29124] group-hover:scale-110 transition-transform">{cat.icon}</span>
                      <span className="font-bold">{cat.label}</span>
                    </div>
                    <span className="material-symbols-rounded text-sm opacity-20">chevron_left</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
