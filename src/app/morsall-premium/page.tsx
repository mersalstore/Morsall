"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ShoppingBag, 
  MapPin, 
  Menu, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Package, 
  CreditCard, 
  ChevronDown, 
  Check, 
  Star, 
  Plus, 
  Minus, 
  Trash2, 
  Lock, 
  Briefcase,
  Phone,
  Clock,
  Mail,
  Info
} from "lucide-react";

// Mock Data
const MOCK_CATEGORIES = [
  {
    id: "logistics",
    name: "الخدمات اللوجستية والشحن",
    desc: "حلول نقل وتوزيع بري متكاملة تغطي كافة الولايات السودانية",
    items: ["شحن سريع للولايات", "التخزين والفرز", "شحن تجاري للشركات", "توصيل الطرود للمنازل", "التأمين على الشحنات"]
  },
  {
    id: "electronics",
    name: "الأجهزة الإلكترونية",
    desc: "أجهزة ذكية وملحقات أصلية بضمان الموردين المعتمدين",
    items: ["هواتف ذكية", "حواسيب محمولة", "سماعات لاسلكية", "ساعات ذكية", "ملحقات ذكية"]
  },
  {
    id: "lifestyle",
    name: "المستلزمات والحقائب",
    desc: "حقائب شحن ومستلزمات سفر مصممة للتحمل والأمان",
    items: ["حقائب ظهر مقاومة للماء", "حقائب سفر لوجستية", "أدوات تنظيم السفر", "ملحقات حماية"]
  }
];

const MOCK_PRODUCTS = [
  {
    id: "p1",
    title: "هاتف ذكي Morsall Nova S - سعة 256 جيجابايت",
    price: 380000,
    originalPrice: 420000,
    discount: 10,
    rating: 4.8,
    reviews: 94,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600",
    badge: "الأكثر مبيعاً",
    vendor: "الشركة السودانية للتقنية المحدودة",
    stock: 8,
    delivery: "توصيل سريع خلال 24 ساعة"
  },
  {
    id: "p2",
    title: "سماعات لاسلكية عازلة للضوضاء Morsall Pulse Pro",
    price: 85000,
    originalPrice: 105000,
    discount: 19,
    rating: 4.7,
    reviews: 63,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600",
    badge: "عرض خاص",
    vendor: "مجموعة المستقبل للإلكترونيات",
    stock: 12,
    delivery: "توصيل سريع خلال 48 ساعة"
  },
  {
    id: "p3",
    title: "ساعة ذكية Classic Chrono - إطار فولاذي مقاوم للصدأ",
    price: 155000,
    originalPrice: 155000,
    discount: 0,
    rating: 4.6,
    reviews: 41,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600",
    badge: "وصل حديثاً",
    vendor: "وكيل الساعات السويسرية",
    stock: 5,
    delivery: "توصيل سريع خلال 24 ساعة"
  },
  {
    id: "p4",
    title: "حقيبة الظهر اللوجستية المصفحة المقاومة للماء والصدمات",
    price: 45000,
    originalPrice: 55000,
    discount: 18,
    rating: 4.5,
    reviews: 29,
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=600",
    badge: "شحن مجاني",
    vendor: "مصنع النيل للجلود والحقائب",
    stock: 18,
    delivery: "توصيل فوري"
  }
];

const HERO_SLIDES = [
  {
    title: "خدمات شحن بري وطني وتجارة إلكترونية موثوقة",
    subtitle: "ربط الولايات السودانية بأعلى معايير الأمان والسرعة",
    desc: "تقدم منصة مرسال حلول لوجستية متكاملة تضمن نقل بضائعكم بأمان، وتوفير سوق إلكتروني يجمع بين كبار التجار والمشترين مع نظام تتبع دقيق للحالة خطوة بخطوة.",
    tag: "منصة مرسال الرسمية",
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200",
    badge: "تغطية شاملة لكافة الولايات الآمنة",
    cta: "ابدأ الشحن الآن",
    ctaLink: "#tracking"
  },
  {
    title: "تتبع شحنتك لحظة بلحظة وبكل شفافية",
    subtitle: "إدارة متطورة لسلسلة التوريد والتوصيل المنزلي",
    desc: "سواء كنت صاحب متجر أو ترغب في إرسال طرد شخصي، توفر لك مرسال تفاصيل دقيقة عن مسار القافلة اللوجستية ومواعيد الاستلام والتسليم المتوقعة.",
    tag: "خدمات التتبع واللوجستيات",
    img: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200",
    badge: "تحديثات فورية لحركة الشاحنات",
    cta: "تتبع طردك الآن",
    ctaLink: "#tracking"
  }
];

const SERVICES_LIST = [
  {
    title: "اللوجستيات والشحن البري",
    desc: "أسطول نقل منظم يربط الموانئ والمستودعات بالمدن الرئيسية لنقل البضائع والطرود بكفاءة تامة.",
    icon: <Truck className="w-6 h-6 text-[#1E3A8A]" />,
    badge: "شحن الولايات"
  },
  {
    title: "التسوق الموثوق للمنتجات",
    desc: "متجر إلكتروني متكامل يربط الموردين بالزبائن لضمان الحصول على سلع أصلية بأسعار معقولة.",
    icon: <ShoppingBag className="w-6 h-6 text-[#1E3A8A]" />,
    badge: "سوق مرسال"
  },
  {
    title: "التخزين والفرز اللوجستي",
    desc: "مستودعات مجهزة بالكامل لاستقبال شحنات التجار وفرزها وتوزيعها بشكل منظم وسريع.",
    icon: <Package className="w-6 h-6 text-[#1E3A8A]" />,
    badge: "إدارة المخازن"
  },
  {
    title: "بوابات الربط البرمجي للمتاجر",
    desc: "أدوات تقنية تتيح للتجار ربط منصاتهم الخاصة بنظام الشحن لدينا لإدارة الطلبات تلقائياً.",
    icon: <Briefcase className="w-6 h-6 text-[#1E3A8A]" />,
    badge: "حلول تقنية"
  }
];

const TRACKING_DATA_SAMPLES: Record<string, any> = {
  "MSL-9842-SD": {
    code: "MSL-9842-SD",
    origin: "بورتسودان (مركز التجميع البحري)",
    destination: "الخرطوم (مستودع بحري الرئيسي)",
    status: "in_transit",
    statusText: "قيد النقل - بين الولايات",
    currentLocation: "شندي - نقطة فحص المستندات والجمارك",
    eta: "24 مايو 2026 - 4:00 مساءً",
    percentage: 65,
    steps: [
      { name: "تم تسليم الشحنة لمركز التجميع بالميناء", date: "21 مايو 2026 - 09:30 ص", done: true },
      { name: "أكملت القافلة الفحص الجمركي وأوراق المرور", date: "22 مايو 2026 - 02:15 م", done: true },
      { name: "غادرت مركبات النقل الميناء باتجاه العاصمة", date: "23 مايو 2026 - 08:00 ص", done: true },
      { name: "وصول نقطة تفتيش شندي وفحص البيان اللوجستي", date: "23 مايو 2026 - 03:45 م", done: true, active: true },
      { name: "الوصول المتوقع لمركز فرز وتوزيع الخرطوم", date: "متوقع 24 مايو صباحاً", done: false },
      { name: "التسليم النهائي لموقع المستلم المعتمد", date: "متوقع 24 مايو مساءً", done: false }
    ]
  },
  "MSL-1025-SD": {
    code: "MSL-1025-SD",
    origin: "عطبرة (مركز الفرز الإقليمي)",
    destination: "أم درمان (حي الفتيحاب)",
    status: "delivered",
    statusText: "تم التسليم بنجاح",
    currentLocation: "أم درمان - مربع 5",
    eta: "تم التسليم في 22 مايو 2026 - 2:45 م",
    percentage: 100,
    steps: [
      { name: "استلام الطرد وتجهيزه بمستودع عطبرة", date: "20 مايو 2026 - 10:15 ص", done: true },
      { name: "شحن وتأمين البضاعة في وسيلة النقل البري", date: "21 مايو 2026 - 09:00 ص", done: true },
      { name: "الوصول لمركز توزيع أم درمان الرئيسي", date: "22 مايو 2026 - 08:30 ص", done: true },
      { name: "تسليم الطرد لمندوب التوصيل النهائي للمنزل", date: "22 مايو 2026 - 11:30 ص", done: true },
      { name: "تم تسليم الطلب للعميل واستلام التوقيع والتحصيل", date: "22 مايو 2026 - 02:45 م", done: true, active: true }
    ]
  }
};

export default function MorsallShowroom() {
  // Navigation States
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  // Hero Slider
  const [activeSlide, setActiveSlide] = useState(0);
  
  // Cart
  const [cart, setCart] = useState<any[]>([]);
  
  // Tracking
  const [trackingCode, setTrackingCode] = useState("MSL-9842-SD");
  const [trackingResult, setTrackingResult] = useState<any>(TRACKING_DATA_SAMPLES["MSL-9842-SD"]);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  // Checkout Drawer
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState({
    city: "الخرطوم",
    district: "المعمورة",
    street: "شارع الستين",
    phone: "0912345678",
    notes: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("bank-transfer");

  // Cart Handlers
  const handleAddToCart = (product: any) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  // Search Form
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      alert(`البحث عن: ${searchQuery} - سيتم نقلك إلى صفحة نتائج البحث المخصصة.`);
    }
  };

  // Tracking Form
  const handleTrackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTrackingLoading(true);
    setTrackingError("");
    
    setTimeout(() => {
      const code = trackingCode.trim().toUpperCase();
      if (TRACKING_DATA_SAMPLES[code]) {
        setTrackingResult(TRACKING_DATA_SAMPLES[code]);
      } else {
        setTrackingError("لم يتم العثور على شحنة بهذا الرقم. يرجى تجربة الرموز التجريبية الموضحة بالأسفل.");
        setTrackingResult(null);
      }
      setIsTrackingLoading(false);
    }, 1000);
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = cart.length > 0 ? 5000 : 0;
  const cartTotal = cartSubtotal + shippingFee;

  // Auto Hero Slider rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(p => (p + 1) % HERO_SLIDES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="min-h-screen bg-[#F8FAFC] text-slate-800 overflow-x-hidden font-cairo selection:bg-[#1E3A8A] selection:text-white"
      dir="rtl"
    >
      
      {/* ── 1. FORMAL WHITE NAVBAR ── */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-slate-200 shadow-sm">
        {/* Top Header Contact Bar */}
        <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 lg:px-8 hidden md:block">
          <div className="max-w-[1600px] mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>مركز الاتصال الموحد: 4949</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>ساعات العمل: 8:00 ص - 8:00 م</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="#tracking" className="hover:text-white transition-colors">تتبع الشحنات</Link>
              <span>|</span>
              <Link href="/contact" className="hover:text-white transition-colors">الدعم الفني</Link>
            </div>
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-[#1E3A8A] flex items-center justify-center shadow-sm">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col text-right leading-none">
                <span className="font-sans font-black text-xl tracking-wider text-[#1E3A8A]">MORSALL</span>
                <span className="text-[9px] font-bold text-slate-400 tracking-[0.1em] mt-1">الخدمات اللوجستية والتجارة</span>
              </div>
            </Link>

            {/* Delivery Location selector */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <div className="flex flex-col text-right leading-none">
                <span className="text-[8px] text-slate-400">توصيل إلى</span>
                <span className="text-[11px] font-bold text-slate-700 mt-0.5">الخرطوم، السودان</span>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-grow max-w-lg hidden lg:block relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-stretch h-10 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden focus-within:border-[#1E3A8A] focus-within:bg-white transition-all">
              <input 
                type="text" 
                placeholder="ابحث عن المنتجات، الموردين، أو أدخل رقم التتبع..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(e.target.value.trim().length > 0);
                }}
                className="flex-grow bg-transparent border-0 px-4 text-xs text-slate-800 focus:ring-0 focus:outline-none placeholder:text-slate-400 text-right"
              />
              <button type="submit" className="px-5 bg-[#1E3A8A] hover:bg-[#152e72] text-white flex items-center justify-center transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Suggestions drop-down */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-lg shadow-lg p-2.5 z-50 text-right"
                >
                  <div className="text-[10px] text-slate-400 font-bold mb-1.5 px-2">اقتراحات سريعة للبحث:</div>
                  <div className="space-y-0.5">
                    <button onClick={() => { setSearchQuery("MSL-9842-SD"); setShowSuggestions(false); }} className="w-full text-right px-2.5 py-1.5 rounded hover:bg-slate-50 text-xs text-slate-700 transition-colors flex items-center justify-between">
                      <span>تتبع الشحنة MSL-9842-SD</span>
                      <ArrowLeft className="w-3.5 h-3.5 text-[#1E3A8A]" />
                    </button>
                    <button onClick={() => { setSearchQuery("Morsall Nova"); setShowSuggestions(false); }} className="w-full text-right px-2.5 py-1.5 rounded hover:bg-slate-50 text-xs text-slate-700 transition-colors flex items-center justify-between">
                      <span>هاتف Morsall Nova S</span>
                      <Search className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls & Cart */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu trigger */}
            <button 
              className="lg:hidden p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600"
              onClick={() => setActiveMenu(activeMenu ? null : "mobile-sidebar")}
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Profile */}
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all text-slate-600">
              <User className="w-4 h-4" />
              <span className="hidden md:inline text-xs font-bold">حسابي</span>
              <ChevronDown className="hidden md:inline w-3 h-3 text-slate-400" />
            </button>

            {/* Cart Button */}
            <button 
              onClick={() => setShowCheckout(true)}
              className="relative px-4 py-2 rounded-lg bg-[#1E3A8A] hover:bg-[#152e72] text-white font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden md:inline text-xs font-bold">العربة</span>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -left-1.5 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Categories Bar */}
        <nav className="border-t border-slate-200/80 bg-slate-50 hidden lg:block">
          <div className="max-w-[1600px] mx-auto px-8 h-10 flex items-center justify-between text-xs font-bold text-slate-600">
            <div className="flex items-center gap-6">
              
              {/* Category dropdown hover menu */}
              <div 
                className="relative"
                onMouseEnter={() => setActiveMenu("categories")}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button className="flex items-center gap-1.5 text-[#1E3A8A] font-bold h-10 hover:text-slate-800 transition-colors">
                  <Menu className="w-3.5 h-3.5" />
                  <span>جميع الخدمات والفئات</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                <AnimatePresence>
                  {activeMenu === "categories" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full w-[650px] bg-white border border-slate-200 rounded-b-xl shadow-lg p-5 grid grid-cols-3 gap-5 z-50 text-right text-slate-700"
                    >
                      {MOCK_CATEGORIES.map((cat) => (
                        <div key={cat.id} className="space-y-2.5">
                          <h4 className="font-black text-xs text-[#1E3A8A] border-b border-slate-100 pb-1.5">{cat.name}</h4>
                          <ul className="space-y-1 text-slate-500 font-medium">
                            {cat.items.map((item, idx) => (
                              <li key={idx} className="hover:text-[#1E3A8A] transition-colors py-0.5">
                                <Link href="/shop">{item}</Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Flat links */}
              <div className="flex items-center gap-5">
                <Link href="#services" className="hover:text-slate-800 transition-colors">الخدمات اللوجستية</Link>
                <Link href="#products" className="hover:text-slate-800 transition-colors">سوق المنتجات</Link>
                <Link href="#tracking" className="hover:text-slate-800 transition-colors">نظام التتبع</Link>
                <Link href="/about" className="hover:text-slate-800 transition-colors">عن الشركة</Link>
                <Link href="/pricing" className="hover:text-slate-800 transition-colors">أسعار الشحن للولايات</Link>
              </div>
            </div>

            <div className="text-[#1E3A8A] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>مكتب بورتسودان الجمركي ومستودعات التوزيع مستمرة بالعمل</span>
            </div>
          </div>
        </nav>
      </header>

      {/* ── 2. HERO SLIDER SECTION ── */}
      <section className="pt-24 lg:pt-36 pb-10 px-4 lg:px-8 max-w-[1600px] mx-auto">
        <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-md h-[380px] md:h-[430px] lg:h-[460px] relative">
          
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === activeSlide;
            return (
              <div 
                key={idx}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 flex items-center ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
              >
                {/* Background image */}
                <div className="absolute inset-0 z-0">
                  <Image 
                    src={slide.img} 
                    alt={slide.title}
                    fill 
                    className="object-cover brightness-[0.22] object-center" 
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />
                </div>

                {/* Content Box */}
                <div className="relative z-10 max-w-2xl px-6 md:px-16 text-right space-y-4 text-white">
                  <span className="inline-block px-2.5 py-1 rounded bg-[#1E3A8A] text-[10px] font-bold tracking-wider">
                    {slide.badge}
                  </span>
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-black leading-tight">
                    {slide.title}
                  </h1>
                  <h2 className="text-sm md:text-base font-bold text-slate-300">
                    {slide.subtitle}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed max-w-lg">
                    {slide.desc}
                  </p>
                  
                  <div className="flex gap-3 pt-2">
                    <Link 
                      href={slide.ctaLink}
                      className="px-6 py-2.5 bg-[#1E3A8A] hover:bg-[#152e72] text-white font-bold text-xs rounded transition-colors shadow-sm"
                    >
                      {slide.cta}
                    </Link>
                    <Link 
                      href="#products"
                      className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded border border-white/20 transition-colors"
                    >
                      تصفح العروض
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Dots Controls */}
          <div className="absolute bottom-5 left-5 z-20 flex gap-1.5">
            {HERO_SLIDES.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setActiveSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === activeSlide ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. SERVICES SECTION (BENTO GRID STYLE) ── */}
      <section id="services" className="py-10 px-4 lg:px-8 max-w-[1600px] mx-auto">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">حلول لوجستية وتجارية متكاملة</h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto">نصمم خدماتنا لخدمة الاحتياجات التجارية الكبرى والشحنات الشخصية على حدٍ سواء.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES_LIST.map((svc, i) => (
            <div 
              key={i}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all flex flex-col justify-between h-[230px]"
            >
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                  {svc.icon}
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900">{svc.title}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{svc.desc}</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2 text-[10px] font-bold text-slate-400">
                <span>{svc.badge}</span>
                <span className="text-[#1E3A8A] hover:underline cursor-pointer flex items-center gap-0.5">
                  <span>التفاصيل</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. SHIPPING TRACKER SECTION (DHL/FEDEX Timelines) ── */}
      <section id="tracking" className="py-10 px-4 lg:px-8 max-w-[1600px] mx-auto">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Tracking Form Column */}
            <div className="space-y-5 lg:border-l lg:border-slate-200 lg:pl-8">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900">نظام الاستعلام وتتبع الطرود</h3>
                <p className="text-xs text-slate-400 leading-relaxed">أدخل رقم بوليصة الشحن الخاص بمرسال لمتابعة مسار القافلة البرية المباشر وتحديثات التسليم.</p>
              </div>

              <form onSubmit={handleTrackingSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">رقم بوليصة التتبع (الباركود)</label>
                  <input 
                    type="text" 
                    placeholder="مثال: MSL-9842-SD" 
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-xs text-slate-800 placeholder:text-slate-400 font-bold focus:border-[#1E3A8A] focus:bg-white text-right focus:outline-none focus:ring-0"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isTrackingLoading}
                  className="w-full py-2.5 rounded-lg bg-[#1E3A8A] hover:bg-[#152e72] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  {isTrackingLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري جلب بيانات الشحنة...</span>
                    </>
                  ) : (
                    <span>استعلام وتحديث الحالة</span>
                  )}
                </button>
              </form>

              {/* Sample tracking numbers */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-[10.5px] text-slate-500">
                <span className="font-bold block mb-1.5 text-slate-700">بيانات تجريبية صالحة للتتبع:</span>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  <button onClick={() => { setTrackingCode("MSL-9842-SD"); }} className="underline text-[#1E3A8A] font-bold">MSL-9842-SD (بورتسودان ← الخرطوم)</button>
                  <button onClick={() => { setTrackingCode("MSL-1025-SD"); }} className="underline text-[#1E3A8A] font-bold">MSL-1025-SD (عطبرة ← أم درمان)</button>
                </div>
              </div>

              {trackingError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg flex items-center gap-1.5">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{trackingError}</span>
                </div>
              )}
            </div>

            {/* Stepper Timeline Column */}
            <div className="lg:col-span-2 flex flex-col justify-between min-h-[350px]">
              {trackingResult ? (
                <div className="space-y-6">
                  {/* Status header summary */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded bg-[#1E3A8A]/5 flex items-center justify-center text-[#1E3A8A]">
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="text-right leading-none">
                        <span className="text-[8px] text-slate-400">رقم الشحنة</span>
                        <h4 className="text-sm font-black text-slate-800 mt-1">{trackingResult.code}</h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">الوضع الحالي:</span>
                      <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-[#1E3A8A] font-bold text-[10px] rounded">
                        {trackingResult.statusText}
                      </span>
                    </div>
                  </div>

                  {/* Route points info grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400">نقطة المنشأ</span>
                      <span className="text-xs font-bold text-slate-700 mt-0.5 block">{trackingResult.origin}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400">نقطة الوصول</span>
                      <span className="text-xs font-bold text-slate-700 mt-0.5 block">{trackingResult.destination}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400">الموقع الحالي للناقل</span>
                      <span className="text-xs font-bold text-[#1E3A8A] mt-0.5 block">{trackingResult.currentLocation}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400">تاريخ الاستلام المتوقع</span>
                      <span className="text-xs font-bold text-slate-700 mt-0.5 block">{trackingResult.eta}</span>
                    </div>
                  </div>

                  {/* Vertical Timelines steps */}
                  <div className="relative border-r-2 border-slate-100 mr-2 pr-6 py-2.5 space-y-6">
                    {trackingResult.steps.map((step: any, idx: number) => (
                      <div key={idx} className="relative flex flex-col items-start text-right">
                        
                        {/* Dot badge indicator */}
                        <div className={`absolute right-[-31px] top-0.5 w-3 h-3 rounded-full flex items-center justify-center border-2 ${
                          step.active 
                            ? "bg-white border-[#1E3A8A] shadow-[0_0_0_3px_rgba(30,58,138,0.1)]" 
                            : step.done 
                            ? "bg-[#1E3A8A] border-[#1E3A8A]" 
                            : "bg-white border-slate-200"
                        }`}>
                          {step.done && !step.active && <Check className="w-1.5 h-1.5 text-white stroke-[3]" />}
                        </div>

                        <div className="space-y-0.5">
                          <h5 className={`text-xs font-bold ${step.active ? "text-[#1E3A8A] text-sm" : step.done ? "text-slate-800" : "text-slate-400"}`}>
                            {step.name}
                          </h5>
                          <span className="text-[9px] text-slate-400 block">{step.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-20 space-y-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <Package className="w-12 h-12 text-slate-300" />
                  <h4 className="font-bold text-xs text-slate-400">يرجى إدخال بوليصة الشحن لعرض حالة وتفاصيل مسار الطرد</h4>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4 mt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 gap-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  شحن مؤمن عليه بالكامل ضد المخاطر المعتمدة
                </span>
                <span>تحديث تلقائي لحركة الشاحنات كل ساعة</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 5. PRODUCT DISPLAY SECTION (LIGHT/FORMAL THEME) ── */}
      <section id="products" className="py-10 px-4 lg:px-8 max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between border-b border-slate-200 pb-3 mb-8">
          <div className="space-y-1 text-right">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">سوق مرسال الإلكتروني</h2>
            <p className="text-xs text-slate-500">بضائع أصلية مقدمة من موردين محليين مع خيارات شحن سريعة.</p>
          </div>
          <Link href="/shop" className="text-xs font-bold text-[#1E3A8A] hover:underline flex items-center gap-0.5">
            <span>عرض كافة المعروضات</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_PRODUCTS.map((prod) => (
            <div 
              key={prod.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between h-[410px]"
            >
              {/* Image Container */}
              <div className="relative h-[180px] bg-slate-50 w-full flex items-center justify-center border-b border-slate-100">
                <Image 
                  src={prod.image} 
                  alt={prod.title}
                  fill 
                  className="object-cover"
                />
                <span className="absolute top-3 right-3 text-[9px] font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded">
                  {prod.badge}
                </span>
              </div>

              {/* Product Info */}
              <div className="p-4 flex-grow flex flex-col justify-between text-right">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span className="truncate max-w-[120px]">{prod.vendor}</span>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-slate-700">{prod.rating}</span>
                    </div>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2 hover:text-[#1E3A8A] transition-colors">
                    {prod.title}
                  </h3>
                </div>

                <div className="space-y-3 pt-3">
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 block leading-none">السعر</span>
                      <span className="text-base font-black text-slate-900">
                        {prod.price.toLocaleString()} 
                        <span className="text-[10px] text-[#1E3A8A] font-bold mr-0.5">ج.س</span>
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {prod.delivery}
                    </span>
                  </div>

                  <button 
                    onClick={() => handleAddToCart(prod)}
                    className="w-full py-2.5 rounded-lg border border-slate-200 hover:bg-[#1E3A8A] hover:text-white hover:border-[#1E3A8A] text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>إضافة إلى العربة</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. CHECKOUT DRAWER AND CART OVERLAY ── */}
      <AnimatePresence>
        {showCheckout && (
          <>
            {/* Dark background overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[100]"
              onClick={() => setShowCheckout(false)}
            />

            {/* Slide-out drawer container */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 h-screen w-full sm:w-[460px] bg-white border-l border-slate-200 z-[101] flex flex-col justify-between shadow-xl text-slate-700 text-right"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4.5 h-4.5 text-[#1E3A8A]" />
                  <h3 className="font-black text-sm text-slate-900">حقيبة المشتريات</h3>
                </div>
                <button 
                  onClick={() => setShowCheckout(false)}
                  className="w-7 h-7 rounded bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                
                {/* Steps indicator */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-[11px] font-bold">
                  <span className={checkoutStep >= 1 ? "text-[#1E3A8A]" : "text-slate-400"}>1. مراجعة السلة</span>
                  <ChevronLeft className="w-3 h-3 text-slate-300" />
                  <span className={checkoutStep >= 2 ? "text-[#1E3A8A]" : "text-slate-400"}>2. معلومات التوصيل والدفع</span>
                  <ChevronLeft className="w-3 h-3 text-slate-300" />
                  <span className={checkoutStep === 3 ? "text-emerald-600" : "text-slate-400"}>3. تأكيد الطلب</span>
                </div>

                {/* Step 1: Items list */}
                {checkoutStep === 1 && (
                  <div className="space-y-3">
                    {cart.length > 0 ? (
                      cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg justify-between bg-slate-50/50">
                          <div className="relative w-12 h-12 rounded overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            <Image src={item.image} alt={item.title} fill className="object-cover" />
                          </div>
                          
                          <div className="flex-grow text-right overflow-hidden mr-2">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{item.title}</h4>
                            <span className="text-[9px] text-slate-400 block">{item.vendor}</span>
                            <span className="text-xs font-black text-[#1E3A8A] mt-0.5 block">{item.price.toLocaleString()} ج.س</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button onClick={() => handleUpdateQuantity(item.id, -1)} className="w-5 h-5 rounded bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center">
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="text-xs font-bold text-slate-800 w-3 text-center">{item.quantity}</span>
                            <button onClick={() => handleUpdateQuantity(item.id, 1)} className="w-5 h-5 rounded bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center">
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                            
                            <button 
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="w-5 h-5 rounded hover:bg-red-50 hover:text-red-600 text-slate-400 flex items-center justify-center border border-transparent hover:border-red-100 mr-2"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16 text-slate-400 text-xs space-y-2">
                        <ShoppingBag className="w-9 h-9 text-slate-200 mx-auto" />
                        <span>عربة المشتريات فارغة حالياً.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Delivery address details */}
                {checkoutStep === 2 && (
                  <div className="space-y-4 text-xs font-bold text-slate-600">
                    <div className="p-4 border border-slate-200 rounded-xl space-y-3">
                      <h4 className="text-xs font-black text-[#1E3A8A] border-b border-slate-100 pb-1.5">معلومات موقع التسليم</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 block">المدينة / الولاية</label>
                          <input 
                            type="text" 
                            value={deliveryAddress.city} 
                            onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                            className="w-full h-8 bg-slate-50 border border-slate-200 rounded px-2.5 text-xs text-slate-800 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 block">الحي / المنطقة</label>
                          <input 
                            type="text" 
                            value={deliveryAddress.district} 
                            onChange={(e) => setDeliveryAddress({...deliveryAddress, district: e.target.value})}
                            className="w-full h-8 bg-slate-50 border border-slate-200 rounded px-2.5 text-xs text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 block">تفاصيل الشارع والمنزل</label>
                        <input 
                          type="text" 
                          value={deliveryAddress.street} 
                          onChange={(e) => setDeliveryAddress({...deliveryAddress, street: e.target.value})}
                          className="w-full h-8 bg-slate-50 border border-slate-200 rounded px-2.5 text-xs text-slate-800 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 block">رقم الاتصال (الجوال)</label>
                        <input 
                          type="text" 
                          value={deliveryAddress.phone} 
                          onChange={(e) => setDeliveryAddress({...deliveryAddress, phone: e.target.value})}
                          className="w-full h-8 bg-slate-50 border border-slate-200 rounded px-2.5 text-xs text-slate-800 text-left font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-4 border border-slate-200 rounded-xl space-y-3">
                      <h4 className="text-xs font-black text-[#1E3A8A] border-b border-slate-100 pb-1.5">طريقة الدفع والتسليم</h4>
                      
                      <div className="space-y-2">
                        {/* Application bank direct */}
                        <div 
                          onClick={() => setPaymentMethod("bank-transfer")}
                          className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${paymentMethod === "bank-transfer" ? "bg-blue-50/50 border-[#1E3A8A]" : "bg-slate-50/50 border-slate-200"}`}
                        >
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-slate-500" />
                            <div className="text-right leading-tight mr-1">
                              <span className="text-xs font-bold text-slate-800 block">تطبيق بنكك (بنك الخرطوم)</span>
                              <span className="text-[9px] text-slate-400">تحويل مباشر لحساب مرسال المعتمد</span>
                            </div>
                          </div>
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentMethod === "bank-transfer" ? "border-[#1E3A8A] bg-[#1E3A8A]" : "border-slate-300"}`}>
                            {paymentMethod === "bank-transfer" && <Check className="w-2 h-2 text-white stroke-[3]" />}
                          </div>
                        </div>

                        {/* Cash on delivery */}
                        <div 
                          onClick={() => setPaymentMethod("cod")}
                          className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${paymentMethod === "cod" ? "bg-blue-50/50 border-[#1E3A8A]" : "bg-slate-50/50 border-slate-200"}`}
                        >
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-slate-500" />
                            <div className="text-right leading-tight mr-1">
                              <span className="text-xs font-bold text-slate-800 block">الدفع نقداً عند الاستلام</span>
                              <span className="text-[9px] text-slate-400">التسليم والتسوية المالية للمندوب مباشرة</span>
                            </div>
                          </div>
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentMethod === "cod" ? "border-[#1E3A8A] bg-[#1E3A8A]" : "border-slate-300"}`}>
                            {paymentMethod === "cod" && <Check className="w-2 h-2 text-white stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Success order message */}
                {checkoutStep === 3 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-black text-base text-slate-900">تم تسجيل طلبيتك بنجاح</h4>
                      <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                        شكراً لثقتكم بمرسال. طلبكم قيد المراجعة برقم المتابعة المؤقت <span className="font-bold text-slate-800">#MSL-1052</span>. 
                        سيتواصل معكم منسق التوزيع اللوجستي لتأكيد عملية الشحن والتوصيل.
                      </p>
                    </div>

                    <div className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-right text-xs space-y-1.5">
                      <p className="text-slate-500">منطقة التوصيل: <span className="font-bold text-slate-800">{deliveryAddress.district}، {deliveryAddress.city}</span></p>
                      <p className="text-slate-500">طريقة الدفع: <span className="font-bold text-slate-800">{paymentMethod === "bank-transfer" ? "تطبيق بنكك" : "الدفع عند الاستلام"}</span></p>
                      <p className="text-slate-500">الناقل المسؤول: <span className="font-bold text-[#1E3A8A]">MERSAL LOGISTICS SERVICE</span></p>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer summary */}
              <div className="p-4 border-t border-slate-200 bg-slate-50">
                {checkoutStep < 3 && (
                  <>
                    <div className="space-y-1.5 text-xs text-slate-500 font-bold mb-4">
                      <div className="flex justify-between">
                        <span>مجموع المشتريات</span>
                        <span className="text-slate-800">{cartSubtotal.toLocaleString()} ج.س</span>
                      </div>
                      <div className="flex justify-between">
                        <span>رسوم شحن مرسال اللوجستية</span>
                        <span className="text-slate-800">{shippingFee.toLocaleString()} ج.س</span>
                      </div>
                      <div className="h-px bg-slate-200 my-1" />
                      <div className="flex justify-between text-sm font-black text-slate-900">
                        <span>إجمالي الفاتورة المتوقع</span>
                        <span className="text-[#1E3A8A]">{cartTotal.toLocaleString()} ج.س</span>
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      {checkoutStep === 1 ? (
                        <button 
                          disabled={cart.length === 0}
                          onClick={() => setCheckoutStep(2)}
                          className="flex-grow py-3 bg-[#1E3A8A] hover:bg-[#152e72] text-white font-bold text-xs rounded transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          <span>المتابعة لملء العنوان والدفع</span>
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => setCheckoutStep(1)}
                            className="px-4 py-3 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded hover:bg-slate-50 transition-colors"
                          >
                            <span>رجوع</span>
                          </button>
                          
                          <button 
                            onClick={() => {
                              setCheckoutStep(3);
                              setCart([]);
                            }}
                            className="flex-grow py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>تأكيد الطلب والدفع الآمن</span>
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}

                {checkoutStep === 3 && (
                  <button 
                    onClick={() => {
                      setShowCheckout(false);
                      setCheckoutStep(1);
                    }}
                    className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded transition-colors"
                  >
                    إغلاق والعودة للتصفح
                  </button>
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── 7. CORPORATE SOLID FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 md:py-16 text-xs relative z-10">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12 text-right">
          
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <span className="font-sans font-black text-lg tracking-wider text-white">MORSALL</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-medium max-w-sm">
              بوابتك اللوجستية والتجارية الوطنية لربط المدن والولايات السودانية بشبكة نقل بري مؤمنة وقناة بيع وشراء موحدة تخدم الأفراد والمؤسسات.
            </p>
            <div className="space-y-1.5 font-bold">
              <p>البريد الإلكتروني: support@morsall.com</p>
              <p>الهاتف: +249 912 345678</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs">خدمات الشحن</h4>
            <ul className="space-y-2 text-slate-500 font-medium">
              <li><Link href="#tracking" className="hover:text-white transition-colors">تتبع حالة الطرد</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">أسعار النقل للولايات</Link></li>
              <li><Link href="/locations" className="hover:text-white transition-colors">مكاتب الاستلام والتسليم</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs">التجارة الإلكترونية</h4>
            <ul className="space-y-2 text-slate-500 font-medium">
              <li><Link href="#products" className="hover:text-white transition-colors">سوق المنتجات</Link></li>
              <li><Link href="/stores" className="hover:text-white transition-colors">المتاجر المعتمدة</Link></li>
              <li><Link href="/vendor/register" className="hover:text-white transition-colors">التسجيل كمورد/تاجر</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs">الشركة والسياسات</h4>
            <ul className="space-y-2 text-slate-500 font-medium">
              <li><Link href="/about" className="hover:text-white transition-colors">من نحن</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية والاستخدام</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">تذكرة دعم فني</Link></li>
            </ul>
          </div>

        </div>

        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-right">
          <p className="text-[10px] text-slate-600 font-bold">
            جميع الحقوق محفوظة © 2026 شركة مرسال المحدودة للخدمات اللوجستية والتجارية.
          </p>
          <div className="flex items-center gap-4 text-[10px] text-slate-600 font-bold">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              اتصال آمن ومحمي بالكامل ببروتوكول SSL
            </span>
          </div>
        </div>

      </footer>

    </div>
  );
}
