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


export default function Navbar() {
  const { data: session, status, update } = useSession();
  const { cartCount } = useCart();
  const { favorites, compareList } = useWishlist();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userCity, setUserCity] = useState("جاري التحديد...");
  const [availableCities, setAvailableCities] = useState<string[]>(["الخرطوم", "أم درمان", "بحري", "شندي", "مدني", "بورتسودان", "عطبرة", "كسلا", "الأبيض"]);
  const [navCategories, setNavCategories] = useState<any[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const isAuthenticated = status === "authenticated";
  const [siteSettings, setSiteSettings] = useState<any>(null);

  const [adLinks, setAdLinks] = useState<any[]>([]);

  useEffect(() => {
    // Fetch dynamic categories (PUBLIC)
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const filtered = data.filter((c: any) => c.showInNavbar);
          setNavCategories(filtered);
        }
      })
      .catch(err => console.error("Nav Categories Fetch Error:", err));

    // Fetch Dynamic Ad Links
    fetch("/api/site-config?key=ad_links")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAdLinks(data.filter((l: any) => l.isActive));
        }
      })
      .catch(() => {});

    fetch("/api/admin/settings/appearance")
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSiteSettings(data.settings);
      })
      .catch(err => console.error("Settings fetch error:", err));

    fetch("/api/delivery-zones")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const cities = Array.from(new Set(data.map((z: any) => z.toCity)));
          setAvailableCities(cities as string[]);
        }
      })
      .catch(err => console.error("Zones Fetch Error:", err));
  }, []);

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/vendor")) {
    return null;
  }

  // Combine static and dynamic
  const ALL_NAV_LINKS = [
    { label: "كل الأقسام", href: "/shop", icon: "menu" },
    ...navCategories.map(c => ({
      label: c.name,
      href: `/category/${c.id}`,
      icon: c.icon || "category",
      children: c.children
    })),
    ...(adLinks.length > 0 ? adLinks : [
      { label: "العروض 🔥", href: "/offers", icon: "bolt" },
      { label: "كبار المتاجر", href: "/top-vendors", icon: "storefront" },
      { label: "ابدأ تجارتك", href: "/vendor/register", icon: "add_business" },
    ])
  ];


  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      setSuggestions([]);
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
           setSuggestions(Array.isArray(data) ? data.slice(0, 5) : []);
           setIsSearching(false);
        })
        .catch(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCityByIP = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const cityMap: Record<string, string> = {
          "Khartoum": "الخرطوم", "Omdurman": "أمدرمان", "Bahri": "بحري", "Port Sudan": "بورتسودان",
          "Atbara": "عطبرة", "Wad Madani": "ود مدني", "Kassala": "كسلا", "El Obeid": "الأبيض"
        };
        return cityMap[data.city] || data.city || "الخرطوم";
      } catch (e) {
        return "الخرطوم";
      }
    };

    const detectLocation = () => {
      if (!("geolocation" in navigator)) {
        fetchCityByIP().then(c => { setUserCity(c); localStorage.setItem("mersal_user_city", c); window.dispatchEvent(new Event("mersal_city_changed")); });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=ar`);
            const data = await res.json();
            const city = data.city || data.locality || data.principalSubdivision || "الخرطوم";
            setUserCity(city);
            localStorage.setItem("mersal_user_city", city);
            window.dispatchEvent(new Event("mersal_city_changed"));
          } catch (e) {
            fetchCityByIP().then(c => { setUserCity(c); localStorage.setItem("mersal_user_city", c); window.dispatchEvent(new Event("mersal_city_changed")); });
          }
        },
        () => {
          // If user denies permission, fallback to IP
          fetchCityByIP().then(c => { setUserCity(c); localStorage.setItem("mersal_user_city", c); window.dispatchEvent(new Event("mersal_city_changed")); });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    const saved = localStorage.getItem("mersal_user_city");
    if (saved && saved !== "جاري التحديد...") {
      setUserCity(saved);
    } else {
      detectLocation();
    }
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

        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-3 md:py-0 md:h-16 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-3 gap-x-4 lg:gap-8">

          {/* Logo & Location Section */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 order-1">
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-[100px] h-8 lg:w-[180px] lg:h-16"
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

            <div className="flex items-center gap-1.5 sm:gap-3 bg-white/5 border border-white/10 rounded-full px-2 sm:px-4 py-1 sm:py-1.5 transition-all group">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#F29124]/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-rounded text-sm sm:text-lg text-[#F29124] animate-pulse">location_on</span>
              </div>
              <div className="flex flex-col leading-tight text-right overflow-hidden">
                <span className="text-[8px] sm:text-[10px] text-white/40 font-medium whitespace-nowrap">نصلك إلى</span>
                <span className="text-[9px] sm:text-[13px] font-bold text-white truncate max-w-[65px] sm:max-w-none">{userCity}</span>
              </div>
            </div>
          </div>

          {/* Advanced Search Bar (Amazon Style) */}
          <div className="relative w-full md:w-auto md:flex-grow order-3">
            <form
              onSubmit={handleSearch}
              className="flex items-stretch h-10 bg-white rounded-md border-0 focus-within:ring-2 focus-within:ring-[#f90] transition-all overflow-hidden"
            >
              <select className="hidden md:block bg-[#f3f3f3] text-gray-700 text-xs px-3 hover:bg-[#d4d4d4] outline-none cursor-pointer border-l border-gray-300">
                <option value="all">كل الأقسام</option>
                {navCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث في مرسال"
                className="flex-grow w-full bg-white text-[#0F172A] px-4 text-sm outline-none placeholder:text-gray-400 text-right"
              />
              <button
                type="submit"
                className="px-5 flex items-center justify-center bg-[#febd69] hover:bg-[#f3a847] text-[#0F172A] transition-colors"
              >
                <span className="material-symbols-rounded text-2xl font-black">search</span>
              </button>
            </form>
            
            {/* Auto Suggest Dropdown */}
            <AnimatePresence>
              {searchQuery.trim().length >= 2 && (suggestions.length > 0 || isSearching) && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 10 }}
                   className="absolute top-full mt-2 w-full bg-white rounded-lg border border-gray-200 shadow-2xl overflow-hidden z-50 text-right"
                 >
                   {isSearching ? (
                     <div className="p-4 flex items-center gap-2 text-gray-500 text-sm font-bold">
                        <span className="material-symbols-rounded animate-spin text-[16px]">refresh</span>
                        جاري البحث...
                     </div>
                   ) : (
                     <div className="flex flex-col py-2">
                       {suggestions.map((p) => (
                         <div key={p.id} className="flex flex-col">
                           <Link href={`/product/${p.id}`} onClick={() => setSearchQuery("")} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors text-right">
                              <span className="material-symbols-rounded text-gray-400 text-lg">search</span>
                              <span className="text-sm font-bold text-[#0F172A] line-clamp-1">{p.title}</span>
                           </Link>
                           {p.category && (
                             <Link href={`/shop?category=${p.categoryId}`} onClick={() => setSearchQuery("")} className="flex items-center gap-3 px-4 pb-2 pt-0 hover:bg-gray-100 transition-colors text-right">
                                <span className="material-symbols-rounded text-gray-400 text-lg opacity-0">search</span>
                                <span className="text-xs font-bold text-gray-500">في {p.category.name}</span>
                             </Link>
                           )}
                         </div>
                       ))}
                       <Link href={`/shop?q=${encodeURIComponent(searchQuery.trim())}`} onClick={() => setSearchQuery("")} className="px-4 py-3 text-right text-sm font-bold text-blue-600 hover:underline transition-colors border-t border-gray-100 mt-2 block">
                         عرض جميع النتائج لـ &quot;{searchQuery}&quot;
                       </Link>
                     </div>
                   )}
                 </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 lg:gap-5 shrink-0 order-2 md:order-4" ref={menuRef}>

            {/* Account Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserMenu(p => !p)}
                className="flex flex-col items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all text-center group"
              >
                <div className="relative group-hover:scale-110 transition-transform">
                  {isAuthenticated && session?.user?.image ? (
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full overflow-hidden border border-[#C5A021]/50 shadow-lg">
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={28}
                        height={28}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <span className="material-symbols-rounded text-xl md:text-2xl text-white/70 group-hover:text-white transition-colors">person</span>
                  )}
                  <div className="absolute top-0 right-0 w-1.5 h-1.5 md:w-2 md:h-2 bg-[#C5A021] rounded-full border border-black shadow-[0_0_10px_rgba(197,160,33,0.5)]" />
                </div>
                <span className="hidden md:block text-[9px] font-black text-white/40 group-hover:text-white transition-colors uppercase tracking-widest leading-none mt-1">
                  {isAuthenticated ? ((session?.user as any)?.name ? (session?.user as any).name.split(' ')[0] : "حسابي") : "حسابي"}
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

                        <Link href="/wishlist" className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 text-xs font-bold text-white/80 transition-all group/item">
                          المفضلات
                          <span className="material-symbols-rounded text-lg opacity-40 group-hover/item:opacity-100 group-hover/item:text-[#C5A021]">favorite</span>
                        </Link>

                        <Link href="/compare" className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 text-xs font-bold text-white/80 transition-all group/item">
                          المقارنات
                          <span className="material-symbols-rounded text-lg opacity-40 group-hover/item:opacity-100 group-hover/item:text-[#C5A021]">compare_arrows</span>
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
                          <Link href="/admin/dashboard" className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#C5A021]/10 hover:bg-[#C5A021]/20 text-xs font-black text-[#C5A021] transition-all group/item border border-[#C5A021]/10">
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
                          <Link href="/login" className="flex items-center justify-center h-12 bg-[#F29124] text-[#0F172A] rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-[#F29124]/20 active:scale-95">
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
                className="bg-[#C5A021] text-white rounded-xl h-10 md:h-11 px-3 md:px-4 lg:px-6 flex items-center gap-2 md:gap-3 shadow-lg shadow-[#C5A021]/20 hover:brightness-110 transition-all"
              >
                <div className="relative">
                  <span className="material-symbols-rounded text-xl md:text-2xl">shopping_bag</span>
                  <span className="absolute -top-1 -right-1 h-3 min-w-[12px] md:h-4 md:min-w-[16px] bg-white text-[#C5A021] text-[8px] md:text-[9px] font-black rounded-full flex items-center justify-center px-0.5 md:px-1">
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
            className="flex shrink-0 items-center gap-2 px-3 lg:px-4 h-full border-l border-white/5 font-black text-xs text-[#F29124] hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-rounded text-xl">menu</span>
            <span className="hidden sm:block">تصفح الأقسام</span>
            <span className="block sm:hidden">الأقسام</span>
          </button>



          {/* Categories Links */}
          <div className="flex items-center h-full overflow-x-auto scrollbar-none">
            {ALL_NAV_LINKS.slice(1).map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-5 h-full flex items-center text-[12px] font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
              >
                {link.label}
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
              <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-none">
                {ALL_NAV_LINKS.map(link => {
                  const hasChildren = (link as any).children && (link as any).children.length > 0;
                  const isExpanded = expandedCat === link.label;

                  return (
                    <div key={link.href} className="space-y-1">
                      <div
                        className="flex items-center justify-between px-4 py-4 rounded-2xl hover:bg-white/5 border border-white/5 transition-all group cursor-pointer"
                        onClick={() => {
                          if (hasChildren) {
                            setExpandedCat(isExpanded ? null : link.label);
                          } else {
                            router.push(link.href);
                            setShowCategories(false);
                          }
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <span className="material-symbols-rounded text-[#F29124] group-hover:scale-110 transition-transform">{link.icon}</span>
                          <span className="font-bold text-sm">{link.label}</span>
                        </div>
                        {hasChildren ? (
                          <span className={cn("material-symbols-rounded text-sm transition-transform duration-300", isExpanded ? "rotate-180" : "rotate-0")}>expand_more</span>
                        ) : (
                          <span className="material-symbols-rounded text-sm opacity-20">chevron_left</span>
                        )}
                      </div>

                      {/* Subcategories */}
                      <AnimatePresence>
                        {hasChildren && isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-white/5 rounded-2xl mr-4"
                          >
                            {(link as any).children.map((child: any) => (
                              <Link
                                key={child.id}
                                href={`/category/${child.id}`}
                                onClick={() => setShowCategories(false)}
                                className="flex items-center gap-3 px-6 py-3 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#F29124]/40" />
                                {child.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
