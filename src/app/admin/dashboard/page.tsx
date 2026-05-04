"use client"

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────
type TabId =
  | "overview" | "approvals" | "users" | "vendors"
  | "categories" | "employees" | "orders" | "payments"
  | "delivery" | "shipping" | "finance" | "settings" | "inventory" | "drivers" | "subscriptions" | "attributes" | "globalSettings" | "appearance";

import AdminSidebar from "@/components/AdminSidebar";
import AppearanceSettings from "@/components/AppearanceSettings";

const NAV_ITEMS: { id: TabId; icon: string; label: string }[] = [
  { id: "overview",    icon: "dashboard_customize",  label: "التحكم" },
  { id: "approvals",   icon: "verified",              label: "الموافقات" },
  { id: "orders",      icon: "shopping_bag",          label: "الطلبات" },
  { id: "users",       icon: "person_search",         label: "العملاء" },
  { id: "vendors",     icon: "storefront",            label: "الموردون" },
  { id: "categories",  icon: "category",              label: "الأقسام" },
  { id: "attributes",  icon: "tune",                  label: "المنتجات المتغيرة" },
  { id: "inventory",   icon: "inventory_2",           label: "المنتجات" },
  { id: "employees",   icon: "badge",                 label: "الموظفون" },
  { id: "drivers",     icon: "sports_motorsports",    label: "المناديب" },
  { id: "payments",    icon: "payments",              label: "طرق الدفع" },
  { id: "subscriptions",icon: "card_membership",       label: "الاشتراكات" },
  { id: "delivery",    icon: "local_shipping",        label: "مناطق التوصيل" },
  { id: "shipping",    icon: "settings_input_antenna",label: "شركة الشحن" },
  { id: "finance",     icon: "account_balance",       label: "المالية" },
  { id: "settings",    icon: "security",              label: "إعدادات النشر" },
  { id: "globalSettings", icon: "settings_suggest",        label: "الإعدادات العامة" },
  { id: "appearance",  icon: "palette",                label: "المظهر والصور" },
];

const ORDER_STATUSES: Record<string, { label: string; cls: string }> = {
  PENDING_APPROVAL: { label: "بانتظار الموافقة", cls: "badge-pending" },
  APPROVED:         { label: "موافق عليه",        cls: "badge-approved" },
  PACKING:          { label: "قيد التعبئة",       cls: "badge-packing" },
  SHIPPED:          { label: "جاري التوصيل",      cls: "badge-shipped" },
  DELIVERED:        { label: "تم التسليم",         cls: "badge-delivered" },
  REJECTED:         { label: "مرفوض",             cls: "badge-rejected" },
};

const ROLES: Record<string, string> = {
  PACKING:          "مسؤول التغليف",
  SHIPPING:         "مسؤول الشحن",
  CUSTOMER_SERVICE: "خدمة العملاء",
  INVENTORY:        "أمين المخزون",
  ADMIN:            "مدير",
};

const ROLE_PERMISSIONS: Record<string, TabId[]> = {
  ADMIN: ["overview", "approvals", "users", "vendors", "categories", "employees", "orders", "payments", "delivery", "shipping", "finance", "settings", "inventory", "drivers", "subscriptions", "attributes"],
  PACKING: ["orders", "inventory"],
  SHIPPING: ["orders", "drivers"],
  CUSTOMER_SERVICE: ["overview", "approvals", "orders", "users"],
  INVENTORY: ["inventory", "categories", "vendors", "attributes"],
};

import Barcode from "react-barcode";

// ── Shipping Label Component ───────────────────────────
function ShippingLabel({ order, onClose }: { order: any; onClose: () => void }) {
  const handlePrint = () => window.print();

  // Generate secure payload (for scanning validation later)
  const barcodePayload = `MOR-${order.id?.slice(-8).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-[999] bg-black/80 flex flex-col items-center justify-center p-4 print:bg-white print:p-0 print:block" onClick={onClose}>
      
      {/* Action Buttons (Visible on screen, Hidden on Print) */}
      <div className="flex gap-4 print:hidden mb-4 bg-white/10 p-3 rounded-xl border border-white/20" onClick={e => e.stopPropagation()}>
        <button onClick={handlePrint} className="bg-[#1089A4] text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2 hover:bg-[#0c7287] transition">
          <span className="material-symbols-rounded">print</span> طباعة الفاتورة (مقاس 100x150)
        </button>
        <button onClick={onClose} className="bg-red-500/80 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-red-500 transition">إغلاق المستند</button>
      </div>

      <div
        id="shipping-label-print"
        className="bg-white w-[100mm] h-[150mm] overflow-hidden print:w-[100mm] print:h-[150mm] print:mx-auto border print:border-none shadow-2xl print:shadow-none"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Print Content Area (thermal receipt style) */}
        <div className="p-5 text-[12px] font-medium text-black leading-normal bg-white h-full relative border-2 border-black">
          
          {/* Header - Forced LTR to ensure Logo is strictly on the Left */}
          <div className="flex justify-between items-start border-b-4 border-black pb-4 mb-4" dir="ltr">
            {/* Left: Combined Logo (Icon + Text) */}
            <div className="w-1/2 flex flex-col items-start pl-2 pt-2">
               <Image src="/logo-navbar-final.png" alt="Mersal" width={160} height={120} className="object-contain" />
            </div>
            {/* Right: Order ID (Clear and Large) */}
            <div className="text-right w-1/2 flex flex-col items-end pr-4 pt-4">
               <p className="text-[11px] font-black uppercase tracking-widest text-[#021D24]">Standard Shipping</p>
               <p className="text-[18px] font-black mt-2 text-black">ID: {order.id?.slice(-12).toUpperCase()}</p>
            </div>
          </div>

          <div className="flex justify-between text-[10px] font-black border-b-2 border-black pb-2 mb-4">
             <span>المشغل المعتمد: مرسال</span>
             <span dir="ltr" className="font-mono">{new Date(order.createdAt).toLocaleDateString("en-GB")}</span>
          </div>

          {/* Sender / Receiver Grid */}
          <div className="grid grid-cols-2 border-b-2 border-black pb-4 mb-4 bg-gray-50/50 print:bg-white">
             <div className="border-l-2 border-black pl-4 space-y-2">
                <div className="flex gap-2 text-[10px] items-center"><span className="text-gray-500 font-bold w-12">من:</span> <strong className="text-sm">الخرطوم</strong></div>
                <div className="flex gap-2 items-center"><span className="text-gray-500 font-bold text-[10px] w-12">المرسل:</span> <strong className="text-sm">Mersall Hub</strong></div>
             </div>
             <div className="pr-4 space-y-2">
                <div className="flex gap-2 text-[10px] items-center"><span className="text-gray-500 font-bold w-12">إلى:</span> <strong className="text-sm">{order.city}</strong></div>
                <div className="flex gap-2 items-center"><span className="text-gray-500 font-bold text-[10px] w-12">المستلم:</span> <strong className="text-sm">{order.customerName || order.customer?.name}</strong></div>
             </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-2 border-b-2 border-black pb-4 mb-4">
            <div className="border-l-2 border-black pl-4">
              <p className="text-[9px] text-gray-500 font-bold mb-1 uppercase tracking-tighter">عنوان المرسل:</p>
              <p className="text-[11px] font-black leading-tight">الخرطوم - مركز معالجة طلبات مرسال</p>
            </div>
            <div className="pr-4">
              <p className="text-[9px] text-gray-500 font-bold mb-1 uppercase tracking-tighter">عنوان المستلم:</p>
              <p className="text-[12px] font-black leading-relaxed mb-2">{`${order.street || ''}، ${order.district || ''}، ${order.city}`}</p>
              <p className="font-mono text-[14px] font-black bg-black text-white px-2 py-0.5 w-max rounded" dir="ltr">{order.phone}</p>
            </div>
          </div>

          {/* Financials & Packages Grid */}
          <div className="border-b-4 border-black pb-4 mb-4">
             <div className="grid grid-cols-2 mb-3">
                <div className="border-l-2 border-black text-center py-2 bg-gray-50 print:bg-white">
                  <span className="text-gray-500 text-[10px] font-bold block mb-1">قيمة التحصيل</span>
                  <strong className="text-2xl font-black">{order.paymentMethod === "COD" ? `${order.totalAmount} ج.س` : "0 ج.س"}</strong>
                </div>
                <div className="text-center py-2">
                  <span className="text-gray-500 text-[10px] font-bold block mb-1">نوع الدفع</span>
                  <strong className="text-lg font-black">{order.paymentMethod === "COD" ? "الدفع عند الاستلام" : "مدفوع مسبقاً"}</strong>
                </div>
             </div>
             <div className="grid grid-cols-4 text-center text-[10px] border-t-2 border-black pt-2 font-black">
                 <div className="border-l-2 border-black">
                    <span className="text-gray-400 text-[9px] block">الوزن</span> 1 KG
                 </div>
                 <div className="border-l-2 border-black">
                    <span className="text-gray-400 text-[9px] block">القطع</span> {order.items?.length || 1}
                 </div>
                 <div className="border-l-2 border-black">
                    <span className="text-gray-400 text-[9px] block">طرد</span> 1/1
                 </div>
                 <div>
                    <span className="text-gray-400 text-[9px] block">الخدمة</span> سريع
                 </div>
             </div>
          </div>

          {/* Contents - Dynamic scaling */}
          <div className="flex-grow min-h-[40mm]">
             <p className="text-[10px] font-black mb-2 border-b-2 border-black pb-1 w-max">محتويات الشحنة:</p>
             <div className={cn(
               "flex flex-col gap-1",
               order.items?.length > 5 ? "text-[9px]" : "text-[12px]"
             )}>
                {order.items?.map((item: any, i: number) => (
                  <span key={i} className="font-black flex items-center gap-2 border-b border-gray-100 last:border-0 pb-1">
                     <span className="w-5 h-5 rounded bg-black text-white flex items-center justify-center text-[9px] shrink-0 font-mono">{item.quantity}</span>
                     <span className="truncate">{item.product?.title}</span>
                  </span>
                ))}
             </div>
          </div>

          {/* UID Footer - Pinned strictly to bottom of 150mm */}
          <div className="mt-auto border-t-4 border-black pt-2 bg-white pb-1 flex flex-col items-center">
             <div className="mb-2">
                <Barcode 
                  value={barcodePayload} 
                  width={1.5} 
                  height={50} 
                  fontSize={10}
                  margin={0}
                />
             </div>
             <p className="text-[10px] tracking-[0.4em] font-black uppercase text-center">M E R S A L L   L O G I S T I C S</p>
             <div className="flex justify-between items-center w-full px-4 mt-1 border-t border-black/5 pt-1">
                <span className="text-[8px] font-bold text-gray-400">Printed via Mersal Hub</span>
                <span className="text-[8px] font-black uppercase">Standard v2.0</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────
const ProductReviewRow = ({ p, onAction, onEdit, loading }: any) => {
  const [price, setPrice] = useState(p.price || 0);
  const [stock, setStock] = useState(p.stock || 0);
  
  return (
    <div className="p-4 flex flex-col gap-3">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border flex-shrink-0">
                {p.images && <Image src={p.images.split(",")[0]} alt={p.title} fill className="object-cover" />}
             </div>
             <div>
                <p className="font-bold text-sm text-[#021D24] leading-tight">{p.title}</p>
                <p className="text-xs text-gray-400 font-bold mt-1">المتجر: <span className="text-[#1089A4]">{p.vendor?.storeName || 'غير محدد'}</span></p>
             </div>
          </div>
          <button onClick={() => onEdit(p)} className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors">
            <span className="material-symbols-rounded text-sm">edit</span>
          </button>
       </div>
       <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
          <div>
             <label className="text-[10px] text-gray-500 font-bold block mb-1">السعر (ج.س)</label>
             <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="input-mersal py-1.5 px-2 text-xs w-28" />
          </div>
          <div>
             <label className="text-[10px] text-gray-500 font-bold block mb-1">الكمية (Stock)</label>
             <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} className="input-mersal py-1.5 px-2 text-xs w-24" />
          </div>
          <div className="flex gap-2 mr-auto mt-4">
             <button disabled={loading === p.id} onClick={() => onAction(p.id, "APPROVE", price, stock)} className="bg-green-500 disabled:opacity-50 text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-md hover:bg-green-600 transition-colors">
                <span className="material-symbols-rounded text-sm">done_all</span>
             </button>
             <button disabled={loading === p.id} onClick={() => onAction(p.id, "REJECT")} className="bg-red-500 disabled:opacity-50 text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-md hover:bg-red-600 transition-colors">
                <span className="material-symbols-rounded text-sm">delete</span>
             </button>
          </div>
       </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const userRole = ((session?.user as any)?.role || "CUSTOMER").toUpperCase();

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // تصحيح التبويب الافتراضي بناءً على الدور
  useEffect(() => {
    if (userRole !== "ADMIN" && userRole !== "CUSTOMER") {
      const allowed = ROLE_PERMISSIONS[userRole] || [];
      if (allowed.length > 0 && !allowed.includes(activeTab)) {
        setActiveTab(allowed[0]);
      }
    }
  }, [userRole, activeTab]);

  const filteredNavItems = NAV_ITEMS.filter(item => 
    ROLE_PERMISSIONS[userRole === "ADMIN" ? "ADMIN" : userRole]?.includes(item.id)
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [printOrder, setPrintOrder] = useState<any>(null);
  const [assigningDriver, setAssigningDriver] = useState<any>(null); // { orderId, status }
  const [selectedDriverId, setSelectedDriverId] = useState(""); 
  const [trackingOrder, setTrackingOrder] = useState<any>(null); // الطلب الجاري تتبعه حالياً
  
  // Delivery details states
  const [deliveryDays, setDeliveryDays] = useState("3");
  const [deliveryPrice, setDeliveryPrice] = useState("");
  const [manualTrackingLink, setManualTrackingLink] = useState("");


  // Data states
  const [stats, setStats] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pendingVendors, setPendingVendors] = useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [allVendors, setAllVendors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [inventoryProducts, setInventoryProducts] = useState<any[]>([]);
  const [inventorySearch, setInventorySearch] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [ordersViewMode, setOrdersViewMode] = useState<"list" | "grid">("grid");
  const [ordersAdvancedFilter, setOrdersAdvancedFilter] = useState(false);
  const [orderStatus, setOrderStatus] = useState("ALL");
  const [orderSearch, setOrderSearch] = useState("");
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [shippingProviders, setShippingProviders] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [sysSettings, setSysSettings] = useState<any>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [newPlan, setNewPlan] = useState({ name: "", price: "", durationDays: "30", isTrial: false });
  const [attributes, setAttributes] = useState<any[]>([]);
  const [newAttribute, setNewAttribute] = useState({ name: "", options: "" });
  const [banners, setBanners] = useState<any[]>([]);
  const [bannerModal, setBannerModal] = useState<any>(null); // { type: 'HOME_HERO' | 'CATEGORY', targetId?: string }

  const handleSaveGlobalSettings = async () => {
    setActionLoading("global");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sysSettings)
      });
      if (res.ok) alert("تم حفظ الإعدادات العامة بنجاح!");
      else alert("فشل حفظ الإعدادات");
    } catch (err) {
      alert("خطأ في الاتصال");
    }
    setActionLoading(null);
  };

  const handleSaveBanner = async (imageUrl: string, type: string, targetId?: string) => {
    setActionLoading("banner");
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, type, targetId, isActive: true })
      });
      if (res.ok) {
        const nb = await res.json();
        setBanners(prev => [...prev, nb]);
        setBannerModal(null);
      }
    } catch (err) {}
    setActionLoading(null);
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا البانر؟")) return;
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
      if (res.ok) setBanners(prev => prev.filter(b => b.id !== id));
    } catch (err) {}
  };

  // Vendor Modal States
  const [vendorModal, setVendorModal] = useState<null | "add">(null);
  const [vendorForm, setVendorForm] = useState({
    storeName: "",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    phone: "",
    location: "الخرطوم"
  });
  const [vendorFormLoading, setVendorFormLoading] = useState(false);

  // Orders Filter States
  const [oContentSearch, setOContentSearch] = useState("");
  const [oNotesSearch, setONotesSearch] = useState("");
  const [oStatusFilter, setOStatusFilter] = useState("");
  const [oTrackingSearch, setOTrackingSearch] = useState("");
  const [oVendorFilter, setOVendorFilter] = useState("");
  const [oPackageSearch, setOPackageSearch] = useState("");

  // Inventory Filter States
  const [pTitleSearch, setPTitleSearch] = useState("");
  const [pCategoryFilter, setPCategoryFilter] = useState("");
  const [pVendorSearch, setPVendorSearch] = useState("");
  const [pStatusFilter, setPStatusFilter] = useState("");
  const [pIdSearch, setPIdSearch] = useState("");

  // Form states
  const [newEmployee, setNewEmployee] = useState({ name: "", email: "", role: "PACKING" });
  const [newDriver, setNewDriver] = useState({ name: "", phone: "", vehicleType: "مواتر (دباب)" });
  const [newZone, setNewZone] = useState({ fromCity: "", toCity: "", fee: "" });
  const [newCategory, setNewCategory] = useState({ name: "", icon: "📦" });
  const [newProvider, setNewProvider] = useState({ name: "", apiKey: "", baseUrl: "" });

  // Order Edit Modal (Logestechs-style)
  const [editOrderModal, setEditOrderModal] = useState<any>(null);
  const [editOrderStatus, setEditOrderStatus] = useState("");
  const [editOrderTracking, setEditOrderTracking] = useState("");
  const [editOrderNotes, setEditOrderNotes] = useState("");
  const [editOrderShippingCost, setEditOrderShippingCost] = useState("");
  const [editOrderLoading, setEditOrderLoading] = useState(false);

  // Admin Product Add/Edit Modal
  const [productModal, setProductModal] = useState<"add" | "edit" | null>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({ 
    title: "", 
    description: "", 
    shortDescription: "",
    price: "", 
    stock: "", 
    categoryId: "", 
    vendorId: "", 
    images: "", 
    brand: "", 
    range: "",
    type: "SIMPLE",
    sku: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    ram: "",
    storage: "",
    screenSize: "",
    bundleData: "",
    discountPrice: "",
    discountType: "FIXED"
  });
  const [productFormLoading, setProductFormLoading] = useState(false);
  const [productImageFiles, setProductImageFiles] = useState<File[]>([]);
  const [productPreviews, setProductPreviews] = useState<string[]>([]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || []);
        setChartData(data.chartData || []);
        setPendingVendors(data.pendingVendors || []);
      } else {
        console.error("Failed to fetch stats:", res.status);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "overview") await fetchStats();
      if (activeTab === "approvals") {
        await fetchStats();
        const r = await fetch("/api/admin/products?type=pending");
        if (r.ok) setPendingProducts(await r.json());
      }
      if (activeTab === "users") {
        const r = await fetch("/api/admin/users");
        if (r.ok) setUsers(await r.json());
      }
      if (activeTab === "vendors") {
        const r = await fetch("/api/admin/vendors");
        if (r.ok) setAllVendors(await r.json());
      }
      if (activeTab === "categories") {
        const r = await fetch("/api/admin/categories");
        if (r.ok) setCategories(await r.json());
      }
      if (activeTab === "inventory") {
        const params = new URLSearchParams();
        if (inventorySearch) params.set("search", inventorySearch);
        const r = await fetch(`/api/admin/inventory?${params}`);
        if (r.ok) setInventoryProducts(await r.json());
      }
      if (activeTab === "employees") {
        const r = await fetch("/api/admin/employees");
        if (r.ok) setEmployees(await r.json());
      }
      if (activeTab === "drivers") {
        const r = await fetch("/api/admin/drivers");
        if (r.ok) setDrivers(await r.json());
      }
      if (activeTab === "orders") {
        const params = new URLSearchParams();
        if (orderStatus !== "ALL") params.set("status", orderStatus);
        if (orderSearch) params.set("search", orderSearch);
        const r = await fetch(`/api/admin/orders?${params}`);
        if (r.ok) setOrders(await r.json());
      }
      if (activeTab === "payments") {
        const r = await fetch("/api/admin/payment-methods");
        if (r.ok) setPaymentSettings(await r.json());
      }
      if (activeTab === "delivery") {
        const r = await fetch("/api/admin/delivery-zones");
        if (r.ok) setDeliveryZones(await r.json());
      }
      if (activeTab === "shipping") {
        const r = await fetch("/api/admin/shipping-provider");
        if (r.ok) {
          const d = await r.json();
          setShippingProviders(d.all || []);
        }
      }
      if (activeTab === "finance") {
        await fetchStats();
        const r = await fetch("/api/admin/withdrawals");
        if (r.ok) setWithdrawals(await r.json());
      }
      if (activeTab === "attributes") {
        const r = await fetch("/api/admin/attributes");
        if (r.ok) setAttributes(await r.json());
      }
      if (activeTab === "settings") {
        const r = await fetch("/api/admin/settings");
        if (r.ok) {
          const d = await r.json();
          setSysSettings(d.settings);
          setAdmins(d.admins);
        }
      }
      if (activeTab === "globalSettings") {
        const r = await fetch("/api/admin/settings");
        if (r.ok) {
          const d = await r.json();
          setSysSettings(d.settings);
        }
        const br = await fetch("/api/admin/banners");
        if (br.ok) {
          const bd = await br.json();
          setBanners(bd);
        }
      }
      if (activeTab === "subscriptions") {
        const r = await fetch("/api/admin/subscriptions/plans");
        if (r.ok) setSubscriptionPlans(await r.json());
        const vr = await fetch("/api/admin/vendors");
        if (vr.ok) setAllVendors(await vr.json());
      }
    } catch {}
    setLoading(false);
  }, [activeTab, orderStatus, orderSearch, inventorySearch, fetchStats]);

  useEffect(() => {
    if (!session) return;
    fetchData();
  }, [activeTab, session, fetchData]);

  // Live Tracking Interval
  useEffect(() => {
    if (!trackingOrder) return;
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`/api/delivery/tracking?orderId=${trackingOrder.id}`);
        if (r.ok) {
          const freshOrder = await r.json();
          setTrackingOrder(freshOrder);
        }
      } catch (err) {}
    }, 10000); // 10 seconds refresh
    return () => clearInterval(interval);
  }, [trackingOrder]);

  // ── Actions ──
  const handleExportExcel = async (dataOrType?: any[]) => {
    try {
      const { exportToExcel } = await import("@/lib/excel");
      const dataToExport = dataOrType || inventoryProducts;
      
      const exportData = dataToExport.map((p: any) => ({
        "معرف المنتج (ID)": p.id,
        "اسم المنتج": p.title,
        "تاريخ الإضافة": new Date(p.createdAt).toLocaleDateString('ar-EG'),
        "السعر الحالي (ج.س)": p.price,
        "الكمية المتوفرة (Stock)": p.stock,
        "الحالة": p.status,
        "اسم البائع": p.vendor?.storeName || "—",
        "القسم": p.category?.name || "—",
        "روابط الصور (فواصل ,)": p.images,
        "العلامة التجارية": p.brand,
        "النطاق / الحالة": p.range,
        "نوع المنتج": p.type,
        "رمز المنتج (SKU)": p.sku,
        "وصف مصغر": p.shortDescription,
        "الوزن": p.weight,
        "الطول": p.length,
        "العرض": p.width,
        "الارتفاع": p.height,
        "الرام": p.ram,
        "التخزين": p.storage,
        "الشاشة": p.screenSize,
        "بيانات العرض": p.bundleData
      }));
      
      exportToExcel(exportData, "مرسال_المخزون");
    } catch (err) {
      alert("حدث خطأ أثناء تصدير الملف.");
    }
  };

  const [importPreview, setImportPreview] = useState<{ data: any[], errors: any[] } | null>(null);

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setActionLoading("import_excel");
    try {
      const { importFromExcel } = await import("@/lib/excel");
      const { validateProductRow } = await import("@/lib/validation");
      const data = await importFromExcel(file);
      
      const formattedData: any[] = [];
      const allErrors: any[] = [];

      data.forEach((row: any, index: number) => {
        const product = {
          id: row["معرف المنتج (ID)"],
          title: row["اسم المنتج"],
          price: row["السعر الحالي (ج.س)"],
          stock: row["الكمية المتوفرة (Stock)"],
          status: row["الحالة"],
          images: row["روابط الصور (فواصل ,)"],
          brand: row["العلامة التجارية"],
          range: row["النطاق / الحالة"],
          type: row["نوع المنتج"] || "SIMPLE",
          sku: row["رمز المنتج (SKU)"],
          shortDescription: row["وصف مصغر"],
          weight: row["الوزن"],
          length: row["الطول"],
          width: row["العرض"],
          height: row["الارتفاع"],
          ram: row["الرام"],
          storage: row["التخزين"],
          screenSize: row["الشاشة"],
          bundleData: row["بيانات العرض"]
        };

        const errors = validateProductRow(product, index);
        if (errors.length > 0) {
          allErrors.push(...errors);
        }
        formattedData.push(product);
      });

      setImportPreview({ data: formattedData, errors: allErrors });
      setActionLoading(null);
    } catch (err) {
      alert("فشل قراءة ومسح الملف.");
      setActionLoading(null);
    }
    e.target.value = '';
  };

  const confirmImport = async () => {
    if (!importPreview) return;
    if (importPreview.errors.length > 0) {
      if (!confirm(`يوجد ${importPreview.errors.length} أخطاء في البيانات. هل تريد الاستمرار وتجاهل الصفوف الخاطئة؟`)) return;
    }

    const validData = importPreview.data.filter((_, idx) => 
      !importPreview.errors.some(e => e.row === idx + 1)
    );

    if (validData.length === 0) return alert("لا توجد بيانات صالحة للاستيراد");

    setActionLoading("import_confirm");
    const res = await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: validData })
    });

    if (res.ok) {
      alert("تم تحديث المخزون بنجاح!");
      setImportPreview(null);
      fetchData();
    } else {
      alert("حدث خطأ أثناء التحديث.");
    }
    setActionLoading(null);
  };

  const handleExportOrdersExcel = async () => {
    try {
      const { exportToExcel } = await import("@/lib/excel");
      const exportData = orders.map((o: any, index: number) => ({
        "#": index + 1,
        "ملاحظة": o.notes || "—",
        "المفصل": "40680" + o.id?.slice(-5).toUpperCase(),
        "الاجراء المطلوب": o.trackingUrl ? "جاهز" : "—",
        "رقم التتبع": o.trackingUrl || "2375831" + (index + 10),
        "الحالة": ORDER_STATUSES[o.status]?.label || o.status,
        "حالة التاجر": "تم التوصيل",
        "التوصيل": o.items?.[0]?.product?.vendor?.storeName || "متجر هايفيس",
        "استرداد": o.customerName || o.customer?.name || "العنود"
      }));
      exportToExcel(exportData, "طلبات_مرسال");
    } catch (err) {
      alert("حدث خطأ أثناء تصدير الطلبات.");
    }
  };

  const handleImportOrdersExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setActionLoading("import_orders");
    try {
      const { importFromExcel } = await import("@/lib/excel");
      const data = await importFromExcel(file);
      
      const updates = data.map((row: any) => ({
        id: row["معرف الطلب"] || row["ID"] || row["رقم الطرد"]?.replace("#100", ""),
        status: row["الحالة الجديدة"] || row["الحالة"],
        trackingNumber: row["رقم التتبع"]
      })).filter((u: any) => !!u.id && !!u.status);

      if (updates.length > 0) {
        const res = await fetch("/api/admin/orders/bulk-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates })
        });
        if (res.ok) {
          alert(`تم تحديث ${updates.length} طلب بنجاح.`);
          fetchData();
        } else {
          const err = await res.json();
          alert(err.error || "حدث خطأ أثناء التحديث.");
        }
      } else {
        alert("لم يتم العثور على بيانات صالحة للتحديث في الملف.");
      }
      setActionLoading(null);
    } catch (err) {
      alert("فشل قراءة الملف.");
      setActionLoading(null);
    }
    e.target.value = '';
  };

  const handleVendorAction = async (id: string, action: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/vendors", { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }) 
      });
      
      const result = await res.json();
      if (res.ok) {
        setAllVendors(prev => prev.map(v => v.id === id ? { ...v, status: action === 'APPROVE' || action === 'ACTIVATE' ? 'APPROVED' : (action === 'SUSPEND' ? 'SUSPENDED' : v.status) } : v));
        setPendingVendors(prev => prev.filter(v => v.id !== id));
        alert("تم تحديث حالة المورد بنجاح");
      } else {
        alert(result.error || "فشل تحديث الحالة");
      }
    } catch (err) {
      console.error("Vendor Action Error:", err);
      alert("خطأ في الاتصال بالسيرفر");
    } finally {
      setActionLoading(null);
    }
  };

  const handleVendorDetails = (vendor: any) => {
    alert(`تفاصيل المتجر: ${vendor.name || vendor.storeName}\nالمالك: ${vendor.owner || vendor.ownerName}\nالحالة: ${vendor.status}`);
    // Future: Open a detailed modal
  };

  const handleAddPlan = async () => {
    if (!newPlan.name || !newPlan.price) return;
    setActionLoading("add_plan");
    const r = await fetch("/api/admin/subscriptions/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPlan)
    });
    if (r.ok) {
      const data = await r.json();
      setSubscriptionPlans(prev => [...prev, data]);
      setNewPlan({ name: "", price: "", durationDays: "30", isTrial: false });
    }
    setActionLoading(null);
  };

  const handleAssignPlan = async (vendorId: string, planId: string) => {
    setActionLoading(vendorId);
    const r = await fetch("/api/admin/vendors/subscription", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId, planId, action: "assign_plan" })
    });
    if (r.ok) {
      alert("تم تحديث اشتراك المتجر بنجاح");
      fetchData();
    }
    setActionLoading(null);
  };

  const handleProductAction = async (id: string, action: string, price?: number, stock?: number) => {
    setActionLoading(id);
    await fetch("/api/admin/products", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, price, stock }) 
    });
    setPendingProducts(prev => prev.filter(p => p.id !== id));
    setActionLoading(null);
  };

  const handleOrderStatus = async (id: string, status: string) => {
    const currentOrder = orders.find(o => o.id === id);
    if (currentOrder?.status === "DELIVERED") return alert("لا يمكن تغيير حالة الطلب بعد التسليم");
    
    if (status === "SHIPPED") {
      const order = orders.find(o => o.id === id);
      setDeliveryPrice(order?.shippingCost?.toString() || "0");
      setAssigningDriver({ orderId: id, status });
      return;
    }
    setActionLoading(id);
    await fetch("/api/admin/orders", { 
      method: "PATCH", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }) 
    });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setActionLoading(null);
  };

  const handleBulkPrint = () => {
    if (selectedOrders.length === 0) return alert("يرجى تحديد طلب واحد على الأقل");
    const orderToPrint = orders.find(o => o.id === selectedOrders[0]);
    if (orderToPrint) setPrintOrder(orderToPrint);
  };

  const toggleOrderSelection = (id: string) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAllOrders = () => {
    if (selectedOrders.length === orders.length) setSelectedOrders([]);
    else setSelectedOrders(orders.map(o => o.id));
  };

  const submitDriverAssignment = async () => {
    if (!assigningDriver || !selectedDriverId) return;
    const { orderId, status } = assigningDriver;
    setActionLoading(orderId);
    
    await fetch("/api/admin/orders", { 
      method: "PATCH", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        id: orderId, 
        status, 
        driverId: selectedDriverId,
        estimatedDays: parseInt(deliveryDays) || 0,
        shippingCost: parseFloat(deliveryPrice) || 0,
        trackingUrl: manualTrackingLink
      }) 
    });

    setOrders(prev => prev.map(o => o.id === orderId ? { 
      ...o, 
      status, 
      driverId: selectedDriverId,
      shippingCost: parseFloat(deliveryPrice) || 0,
      estimatedDays: parseInt(deliveryDays) || 0,
      trackingUrl: manualTrackingLink
    } : o));

    setAssigningDriver(null);
    setSelectedDriverId("");
    setDeliveryDays("3");
    setManualTrackingLink("");
    setActionLoading(null);
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email) return;
    setActionLoading("emp");
    const r = await fetch("/api/admin/employees", { method: "POST", body: JSON.stringify(newEmployee) });
    if (r.ok) {
      const data = await r.json();
      setEmployees(prev => [data, ...prev]);
      setNewEmployee({ name: "", email: "", role: "PACKING" });
    }
    setActionLoading(null);
  };

  const handleDeleteEmployee = async (id: string) => {
    await fetch("/api/admin/employees", { method: "DELETE", body: JSON.stringify({ id }) });
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const handleAddDriver = async () => {
    if (!newDriver.name || !newDriver.phone) return;
    setActionLoading("driver");
    const r = await fetch("/api/admin/drivers", { method: "POST", body: JSON.stringify(newDriver) });
    if (r.ok) {
      const data = await r.json();
      setDrivers(prev => [data, ...prev]);
      setNewDriver({ name: "", phone: "", vehicleType: "مواتر (دباب)" });
    }
    setActionLoading(null);
  };
  
  const handleAddAttribute = async () => {
    if (!newAttribute.name || !newAttribute.options) return;
    setActionLoading("attr");
    const r = await fetch("/api/admin/attributes", { 
      method: "POST", 
      body: JSON.stringify({ 
        name: newAttribute.name, 
        options: newAttribute.options.split(",").map(o => o.trim()) 
      }) 
    });
    if (r.ok) {
      const data = await r.json();
      setAttributes(prev => [data, ...prev]);
      setNewAttribute({ name: "", options: "" });
    }
    setActionLoading(null);
  };

  const handleDeleteAttribute = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المتغير؟")) return;
    setActionLoading(id);
    const r = await fetch("/api/admin/attributes", { 
      method: "DELETE", 
      body: JSON.stringify({ id }) 
    });
    if (r.ok) {
      setAttributes(prev => prev.filter(a => a.id !== id));
    }
    setActionLoading(null);
  };

  const handleDeleteDriver = async (id: string) => {
    await fetch("/api/admin/drivers", { method: "DELETE", body: JSON.stringify({ id }) });
    setDrivers(prev => prev.filter(d => d.id !== id));
  };

  const handleAddZone = async () => {
    if (!newZone.fromCity || !newZone.toCity || !newZone.fee) return;
    setActionLoading("zone");
    const r = await fetch("/api/admin/delivery-zones", { method: "POST", body: JSON.stringify({ fromCity: newZone.fromCity, toCity: newZone.toCity, fee: Number(newZone.fee) }) });
    if (r.ok) {
      const data = await r.json();
      setDeliveryZones(prev => [data, ...prev]);
      setNewZone({ fromCity: "", toCity: "", fee: "" });
    }
    setActionLoading(null);
  };

  const handleDeleteZone = async (id: string) => {
    await fetch("/api/admin/delivery-zones", { method: "DELETE", body: JSON.stringify({ id }) });
    setDeliveryZones(prev => prev.filter(z => z.id !== id));
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) return;
    setActionLoading("cat");
    const r = await fetch("/api/admin/categories", { method: "DELETE", body: JSON.stringify({ id }) });
    if (r.ok) {
      setCategories(prev => prev.filter(c => c.id !== id));
      if (selectedCategory?.id === id) setSelectedCategory(null);
    }
    setActionLoading(null);
  };

  const handleCategoryIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setActionLoading("cat_upload");
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (data.url) {
        setNewCategory(p => ({ ...p, icon: data.url }));
      }
    } catch (err) {
      console.error(err);
    }
    setActionLoading(null);
  };

  const handleAddCategory = async () => {
    if (!newCategory.name) return;
    setActionLoading("cat");
    const r = await fetch("/api/admin/categories", { method: "POST", body: JSON.stringify(newCategory) });
    if (r.ok) {
      const data = await r.json();
      setCategories(prev => [data, ...prev]);
      setNewCategory({ name: "", icon: "" });
    }
    setActionLoading(null);
  };

  const handleSaveProvider = async () => {
    if (!newProvider.name || !newProvider.apiKey || !newProvider.baseUrl) return;
    setActionLoading("provider");
    const r = await fetch("/api/admin/shipping-provider", { method: "POST", body: JSON.stringify(newProvider) });
    if (r.ok) {
      const data = await r.json();
      setShippingProviders(prev => [data, ...prev]);
      setNewProvider({ name: "", apiKey: "", baseUrl: "" });
    }
    setActionLoading(null);
  };

  const handleSavePayments = async () => {
    setActionLoading("pay");
    await fetch("/api/admin/payment-methods", { method: "PATCH", body: JSON.stringify(paymentSettings) });
    alert("تم حفظ إعدادات الدفع!");
    setActionLoading(null);
  };

  const handleWithdrawalAction = async (id: string, wStatus: string) => {
    setActionLoading(id);
    await fetch("/api/admin/withdrawals", { method: "PATCH", body: JSON.stringify({ id, status: wStatus }) });
    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: wStatus } : w));
    setActionLoading(null);
  };

  const handlePromoteAdmin = async () => {
    const email = prompt("أدخل البريد الإلكتروني للمستخدم المراد تعيينه مديراً:");
    if (!email) return;
    setActionLoading("promote");
    await fetch("/api/admin/users", { method: "PATCH", body: JSON.stringify({ email }) });
    fetchData();
    setActionLoading(null);
  };
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    const r = await fetch("/api/admin/products", { method: "DELETE", body: JSON.stringify({ id }) });
    if (r.ok) setInventoryProducts(prev => prev.filter(p => p.id !== id));
  };

  // ── Order Edit (Logestechs-style) ──
  const openEditOrder = (order: any) => {
    if (order.status === "DELIVERED") {
       alert("هذا الطلب تم تسليمه بنجاح ولا يمكن تعديله.");
       return;
    }
    setEditOrderModal(order);
    setEditOrderStatus(order.status || "");
    setEditOrderTracking(order.trackingNumber || "");
    setEditOrderNotes(order.notes || "");
    setEditOrderShippingCost(order.shippingCost?.toString() || "0");
  };

  const handleSaveOrderEdit = async () => {
    if (!editOrderModal) return;
    setEditOrderLoading(true);
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editOrderModal.id, status: editOrderStatus, trackingNumber: editOrderTracking, notes: editOrderNotes, shippingCost: parseFloat(editOrderShippingCost) }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
      setEditOrderModal(null);
    }
    setEditOrderLoading(false);
  };

  // ── Admin Product Modal ──
  const openAddProduct = () => {
    setProductModal("add");
    setEditingProduct(null);
    setProductForm({ 
      title: "", description: "", shortDescription: "", price: "", stock: "", 
      categoryId: "", vendorId: "", images: "", brand: "", range: "",
      type: "SIMPLE", sku: "", weight: "", length: "", width: "", height: "",
      ram: "", storage: "", screenSize: "", bundleData: "",
      discountPrice: "", discountType: "FIXED"
    });
    setProductImageFiles([]);
    setProductPreviews([]);
  };

  const openEditProduct = (p: any) => {
    setProductModal("edit");
    setEditingProduct(p);
    setProductForm({
      title: p.title || "",
      description: p.description || "",
      price: String(p.price || ""),
      stock: String(p.stock || ""),
      categoryId: p.categoryId || "",
      vendorId: p.vendorId || "",
      images: p.images || "",
      brand: p.brand || "",
      range: p.range || "",
      type: p.type || "SIMPLE",
      sku: p.sku || "",
      shortDescription: p.shortDescription || "",
      weight: p.weight || "",
      length: p.length || "",
      width: p.width || "",
      height: p.height || "",
      ram: p.ram || "",
      storage: p.storage || "",
      screenSize: p.screenSize || "",
      bundleData: p.bundleData || "",
      discountPrice: String(p.discountPrice || ""),
      discountType: p.discountType || "FIXED",
    });
    setProductPreviews(p.images ? p.images.split(",").filter(Boolean) : []);
    setProductImageFiles([]);
  };

  const handleProductImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setProductImageFiles(prev => [...prev, ...files]);
    setProductPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const handleSaveProduct = async () => {
    setProductFormLoading(true);
    try {
      let finalImages = productForm.images;
      // Upload new files
      if (productImageFiles.length > 0) {
        const urls = await Promise.all(productImageFiles.map(async (file) => {
          const fd = new FormData(); fd.append("file", file);
          const r = await fetch("/api/upload", { method: "POST", body: fd });
          const d = await r.json(); return d.url;
        }));
        // Merge with existing images (for edit mode)
        const existing = productForm.images ? productForm.images.split(",").filter(Boolean) : [];
        finalImages = [...existing, ...urls].join(",");
      }

      const payload = { ...productForm, images: finalImages };

      if (productModal === "edit" && editingProduct) {
        const res = await fetch("/api/admin/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingProduct.id, ...payload }) });
        if (res.ok) {
          const updated = await res.json();
          setInventoryProducts(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
          setProductModal(null);
        }
      } else {
        const res = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (res.ok) {
          const created = await res.json();
          setInventoryProducts(prev => [created, ...prev]);
          setProductModal(null);
        }
      }
    } catch (e) { console.error(e); }
    setProductFormLoading(false);
  };



  const handleSaveVendor = async () => {
    if (!vendorForm.storeName || !vendorForm.ownerEmail || !vendorForm.ownerPassword) {
      alert("الرجاء إكمال كافة الحقول المطلوبة");
      return;
    }
    setVendorFormLoading(true);
    try {
      const res = await fetch("/api/admin/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendorForm)
      });
      if (res.ok) {
        const created = await res.json();
        // Refresh vendors list
        const r = await fetch("/api/admin/vendors");
        if (r.ok) setAllVendors(await r.json());
        setVendorModal(null);
        setVendorForm({ storeName: "", ownerName: "", ownerEmail: "", ownerPassword: "", phone: "", location: "الخرطوم" });
      } else {
        const d = await res.json();
        alert(d.error || "فشل إنشاء المتجر");
      }
    } catch (e) {
      console.error(e);
      alert("حدث خطأ تقني");
    }
    setVendorFormLoading(false);
  };

  // ── Computations for Filters ──
  const filteredOrdersArray = orders.filter(o => {
    if (orderSearch && !o.id?.includes(orderSearch)) return false;
    if (oContentSearch && !(o.items?.[0]?.product?.title?.toLowerCase()?.includes(oContentSearch.toLowerCase()))) return false;
    if (oNotesSearch && !o.notes?.toLowerCase()?.includes(oNotesSearch.toLowerCase())) return false;
    if (oStatusFilter && oStatusFilter !== "الكل" && oStatusFilter !== "قيد المراجعة" && o.status !== oStatusFilter) return false;
    if (oTrackingSearch && !o.trackingNumber?.toLowerCase()?.includes(oTrackingSearch.toLowerCase())) return false;
    if (oVendorFilter && oVendorFilter !== "الكل" && !o.customerEmail?.toLowerCase()?.includes(oVendorFilter.toLowerCase())) return false;
    if (oPackageSearch && !o.id?.toLowerCase()?.includes(oPackageSearch.toLowerCase())) return false;
    return true;
  });

  const uniqueCategories = Array.from(new Set(inventoryProducts.map(p => p.category?.name).filter(Boolean)));
  const filteredInventoryArray = inventoryProducts.filter(p => {
    if (inventorySearch && !p.title?.toLowerCase()?.includes(inventorySearch.toLowerCase()) && !p.vendor?.storeName?.toLowerCase()?.includes(inventorySearch.toLowerCase())) return false;
    if (pTitleSearch && !p.title?.toLowerCase()?.includes(pTitleSearch.toLowerCase())) return false;
    if (pCategoryFilter && pCategoryFilter !== "الكل" && p.category?.name !== pCategoryFilter) return false;
    if (pVendorSearch && !p.vendor?.storeName?.toLowerCase()?.includes(pVendorSearch.toLowerCase())) return false;
    if (pStatusFilter && pStatusFilter !== "الكل" && p.status !== pStatusFilter) return false;
    if (pIdSearch && !p.id?.toLowerCase()?.includes(pIdSearch.toLowerCase())) return false;
    return true;
  });

  // ── Loading ──
  if (status === "loading" || (loading && !stats.length && activeTab === "overview")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#021D24]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-[#1089A4] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex overflow-hidden font-sans rtl" dir="rtl">

      {/* Shipping Label Modal */}
      {printOrder && <ShippingLabel order={printOrder} onClose={() => setPrintOrder(null)} />}

      {/* ── Order Edit Modal (Logestechs-style) ── */}
      {editOrderModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditOrderModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
            {/* Header */}
            <div className="bg-[#021D24] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg">تعديل حالة الطلب</h3>
                <p className="text-white/40 text-xs font-mono mt-0.5">#{editOrderModal.id?.slice(-8).toUpperCase()}</p>
              </div>
              <button onClick={() => setEditOrderModal(null)} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20">
                <span className="material-symbols-rounded text-sm">close</span>
              </button>
            </div>

            {/* Status Timeline */}
            <div className="px-6 pt-5 pb-3">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">الحالة الحالية</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { val: "PENDING", label: "معلق", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
                  { val: "PROCESSING", label: "قيد التجهيز", color: "bg-blue-100 text-blue-700 border-blue-200" },
                  { val: "SHIPPED", label: "قيد التوصيل", color: "bg-purple-100 text-purple-700 border-purple-200" },
                  { val: "DELIVERED", label: "تم التوصيل", color: "bg-green-100 text-green-700 border-green-200" },
                  { val: "POSTPONED", label: "مؤجل", color: "bg-orange-100 text-orange-700 border-orange-200" },
                  { val: "RETURNED", label: "مرتجع", color: "bg-gray-100 text-gray-700 border-gray-200" },
                  { val: "REJECTED", label: "ملغاة", color: "bg-red-100 text-red-700 border-red-200" },
                ].map(s => (
                  <button
                    key={s.val}
                    onClick={() => setEditOrderStatus(s.val)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 transition-all ${editOrderStatus === s.val ? s.color + " scale-105 shadow-md" : "bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-300"}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tracking */}
            <div className="px-6 py-3 space-y-3">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1.5">رقم الإرسالية / التتبع</label>
                <input
                  value={editOrderTracking}
                  onChange={e => setEditOrderTracking(e.target.value)}
                  placeholder="أدخل رقم التتبع..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:border-[#1089A4] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1.5">تكلفة التوصيل (ج.س)</label>
                <input
                  type="number"
                  value={editOrderShippingCost}
                  onChange={e => setEditOrderShippingCost(e.target.value)}
                  placeholder="0"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:border-[#1089A4] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1.5">ملاحظات</label>
                <textarea
                  value={editOrderNotes}
                  onChange={e => setEditOrderNotes(e.target.value)}
                  placeholder="ملاحظات إضافية..."
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1089A4] transition-colors resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setEditOrderModal(null)} className="px-5 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">إلغاء</button>
              <button onClick={handleSaveOrderEdit} disabled={editOrderLoading} className="px-6 py-2 bg-[#1089A4] text-white text-sm font-black rounded-xl hover:bg-[#0E7A92] disabled:opacity-50 transition-colors flex items-center gap-2">
                {editOrderLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Admin Product Add/Edit Modal ── */}
      {productModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setProductModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-[#021D24] text-white px-6 py-4 flex items-center justify-between sticky top-0">
              <h3 className="font-black text-lg">{productModal === "add" ? "إضافة منتج جديد" : "تعديل المنتج"}</h3>
              <button onClick={() => setProductModal(null)} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20">
                <span className="material-symbols-rounded text-sm">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Vendor Selector */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1.5">المتجر / البائع <span className="text-red-500">*</span></label>
                <select value={productForm.vendorId} onChange={e => setProductForm(p => ({...p, vendorId: e.target.value}))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1089A4]">
                  <option value="">اختر المتجر...</option>
                  {allVendors.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.storeName} — {v.city}</option>
                  ))}
                </select>
              </div>

              {/* Title & Price & Stock */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1.5">اسم المنتج <span className="text-red-500">*</span></label>
                <input value={productForm.title} onChange={e => setProductForm(p => ({...p, title: e.target.value}))} placeholder="مثال: سماعة بلوتوث لاسلكية" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1089A4]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1.5">السعر (ج.س) <span className="text-red-500">*</span></label>
                  <input type="number" value={productForm.price} onChange={e => setProductForm(p => ({...p, price: e.target.value}))} placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1089A4]" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1.5">الكمية</label>
                  <input type="number" value={productForm.stock} onChange={e => setProductForm(p => ({...p, stock: e.target.value}))} placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1089A4]" />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1.5">القسم</label>
                <select value={productForm.categoryId} onChange={e => setProductForm(p => ({...p, categoryId: e.target.value}))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1089A4]">
                  <option value="">بدون قسم</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Brand & Range */}
              <div className="grid grid-cols-2 gap-3">
              {/* New Fields: Type, SKU, Short Description */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1.5">نوع المنتج</label>
                  <select value={productForm.type} onChange={e => setProductForm(p => ({...p, type: e.target.value}))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1089A4]">
                    <option value="SIMPLE">ثابت (قلم، حقيبة...)</option>
                    <option value="VARIABLE">متغير (مقاسات، ألوان...)</option>
                    <option value="BUNDLE">مركب (عرض، مجموعة...)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1.5">رمز المنتج (SKU)</label>
                  <input value={productForm.sku} onChange={e => setProductForm(p => ({...p, sku: e.target.value}))} placeholder="مثال: SKU-001" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1089A4]" />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1.5">وصف مصغر</label>
                <input value={productForm.shortDescription} onChange={e => setProductForm(p => ({...p, shortDescription: e.target.value}))} placeholder="وصف سريع يظهر بجانب السعر" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1089A4]" />
              </div>

              {/* Specs & Bundle Data */}
              {productForm.type === "VARIABLE" && (
                <div className="p-4 bg-blue-50 rounded-xl grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-blue-600 block mb-1">رام</label>
                    <input value={productForm.ram} onChange={e => setProductForm(p => ({...p, ram: e.target.value}))} className="w-full bg-white border border-blue-100 rounded-lg px-3 py-1.5 text-xs font-bold outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-blue-600 block mb-1">تخزين</label>
                    <input value={productForm.storage} onChange={e => setProductForm(p => ({...p, storage: e.target.value}))} className="w-full bg-white border border-blue-100 rounded-lg px-3 py-1.5 text-xs font-bold outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-blue-600 block mb-1">شاشة</label>
                    <input value={productForm.screenSize} onChange={e => setProductForm(p => ({...p, screenSize: e.target.value}))} className="w-full bg-white border border-blue-100 rounded-lg px-3 py-1.5 text-xs font-bold outline-none" />
                  </div>
                </div>
              )}

              {productForm.type === "BUNDLE" && (
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1.5">بيانات العرض (JSON)</label>
                  <textarea value={productForm.bundleData} onChange={e => setProductForm(p => ({...p, bundleData: e.target.value}))} rows={2} placeholder='[{"name":"منتج 1", "price":"100"}]' className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[10px] outline-none focus:border-[#1089A4] font-mono" />
                </div>
              )}

              {/* Logistics */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                   <label className="text-[9px] font-black text-gray-400 block mb-1">الوزن</label>
                   <input type="number" value={productForm.weight} onChange={e => setProductForm(p => ({...p, weight: e.target.value}))} className="w-full bg-gray-50 border rounded-lg px-2 py-1.5 text-xs" />
                </div>
                <div>
                   <label className="text-[9px] font-black text-gray-400 block mb-1">الطول</label>
                   <input type="number" value={productForm.length} onChange={e => setProductForm(p => ({...p, length: e.target.value}))} className="w-full bg-gray-50 border rounded-lg px-2 py-1.5 text-xs" />
                </div>
                <div>
                   <label className="text-[9px] font-black text-gray-400 block mb-1">العرض</label>
                   <input type="number" value={productForm.width} onChange={e => setProductForm(p => ({...p, width: e.target.value}))} className="w-full bg-gray-50 border rounded-lg px-2 py-1.5 text-xs" />
                </div>
                <div>
                   <label className="text-[9px] font-black text-gray-400 block mb-1">الارتفاع</label>
                   <input type="number" value={productForm.height} onChange={e => setProductForm(p => ({...p, height: e.target.value}))} className="w-full bg-gray-50 border rounded-lg px-2 py-1.5 text-xs" />
                </div>
              </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1.5">وصف المنتج</label>
                <textarea value={productForm.description} onChange={e => setProductForm(p => ({...p, description: e.target.value}))} rows={3} placeholder="وصف تفصيلي للمنتج..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1089A4] resize-none" />
              </div>

              {/* Images */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1.5">صور المنتج</label>
                {productPreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {productPreviews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => { setProductPreviews(p => p.filter((_, j) => j !== i)); setProductImageFiles(p => p.filter((_, j) => j !== i)); }} className="absolute top-1 left-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex items-center gap-3 cursor-pointer bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-[#1089A4] transition-colors">
                  <span className="material-symbols-rounded text-2xl text-[#1089A4]">add_photo_alternate</span>
                  <span className="text-sm font-bold text-gray-500">اختر صور المنتج</span>
                  <input type="file" multiple accept="image/*" onChange={handleProductImageSelect} className="hidden" />
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setProductModal(null)} className="px-5 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl">إلغاء</button>
              <button onClick={handleSaveProduct} disabled={productFormLoading || !productForm.title || !productForm.price || !productForm.vendorId} className="px-6 py-2 bg-[#1089A4] text-white text-sm font-black rounded-xl hover:bg-[#0E7A92] disabled:opacity-50 flex items-center gap-2">
                {productFormLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {productModal === "add" ? "إضافة المنتج" : "حفظ التعديلات"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DryRun / Import Preview Modal ── */}
      {importPreview && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setImportPreview(null)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl z-10 max-h-[85vh] overflow-hidden flex flex-col border border-white/20">
            {/* Header */}
            <div className="bg-[#021D24] text-white p-8 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-2xl font-black mb-1">معاينة استيراد البيانات (Dry-run)</h3>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                  تم فحص {importPreview.data.length} صفاً - وجد {importPreview.errors.length} تنبيهات
                </p>
              </div>
              <button onClick={() => setImportPreview(null)} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-8 space-y-8">
              {importPreview.errors.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 space-y-3">
                  <h4 className="font-black text-red-600 flex items-center gap-2 text-sm">
                    <span className="material-symbols-rounded">error</span>
                    تنبيهات جودة البيانات
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {importPreview.errors.slice(0, 10).map((err, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-red-50 text-[11px] font-bold">
                        <span className="w-6 h-6 bg-red-100 text-red-500 rounded-lg flex items-center justify-center shrink-0">#{err.row}</span>
                        <span className="text-gray-400">{err.field}:</span>
                        <span className="text-red-600">{err.message}</span>
                      </div>
                    ))}
                    {importPreview.errors.length > 10 && <p className="text-xs text-red-400 font-bold px-2">+ {importPreview.errors.length - 10} أخطاء أخرى...</p>}
                  </div>
                </div>
              )}

              <div className="overflow-hidden border rounded-2xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50 border-b text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">المنتج</th>
                      <th className="px-6 py-4">السعر</th>
                      <th className="px-6 py-4">المخزون</th>
                      <th className="px-6 py-4">SKU</th>
                      <th className="px-6 py-4">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {importPreview.data.slice(0, 50).map((p, i) => {
                      const hasError = importPreview.errors.some(e => e.row === i + 1);
                      return (
                        <tr key={i} className={cn("hover:bg-gray-50 transition-colors", hasError ? "bg-red-50/30" : "")}>
                          <td className="px-6 py-4 font-bold text-[#021D24]">{p.title || "—"}</td>
                          <td className="px-6 py-4 font-black text-[#1089A4]">{p.price || 0} ج.س</td>
                          <td className="px-6 py-4 font-bold">{p.stock || 0}</td>
                          <td className="px-6 py-4 font-mono text-gray-400">{p.sku || "—"}</td>
                          <td className="px-6 py-4">
                            {hasError ? (
                              <span className="text-red-500 font-black text-[9px] uppercase">سيتم تجاهله</span>
                            ) : (
                              <span className="text-green-600 font-black text-[9px] uppercase">جاهز للاستيراد</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t bg-gray-50 flex items-center justify-between shrink-0">
               <div className="text-xs font-bold text-gray-400">
                  إجمالي الصفوف الصالحة: <span className="text-[#1089A4] font-black">{importPreview.data.length - importPreview.errors.length}</span>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setImportPreview(null)} className="px-8 py-3 bg-white border border-gray-200 text-gray-500 rounded-2xl font-black text-xs hover:bg-gray-100 transition-all">إلغاء</button>
                  <button 
                    onClick={confirmImport} 
                    disabled={actionLoading === "import_confirm"}
                    className="px-10 py-3 bg-[#1089A4] text-white rounded-2xl font-black text-xs shadow-xl shadow-[#1089A4]/20 hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {actionLoading === "import_confirm" ? "جاري الاستيراد..." : "✅ تأكيد استيراد البيانات الصالحة"}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} 
        userRole={userRole} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* ── Main ── */}
      <main className="flex-grow flex flex-col overflow-y-auto">

        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#021D24] border border-gray-100"
            >
              <span className="material-symbols-rounded">menu</span>
            </button>
            <h2 className="text-lg font-black text-[#021D24]">
              {NAV_ITEMS.find(i => i.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === "finance" && (
              <button
                onClick={() => window.open("/api/admin/reports/excel")}
                className="bg-[#1089A4] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <span className="material-symbols-rounded text-sm">download</span>
                تقرير إكسل
              </button>
            )}
            <button className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#1089A4] transition-colors">
              <span className="material-symbols-rounded text-xl">notifications</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8 space-y-6 pb-24 lg:pb-8">
          <AnimatePresence mode="wait">

            {/* ── 1. OVERVIEW ── */}
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {stats.map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 flex items-center gap-5 shadow-sm">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white", s.color)}>
                        <span className="material-symbols-rounded text-2xl">{s.icon}</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
                        <p className="text-3xl font-black text-[#021D24]">{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Platform Sales Chart */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-black text-[#021D24]">نمو المبيعات</h3>
                      <p className="text-xs text-gray-400 font-bold">إجمالي مبيعات المنصة خلال آخر 7 أيام</p>
                    </div>
                    <div className="flex items-center gap-2 text-[#1089A4] bg-[#1089A4]/10 px-3 py-1.5 rounded-lg">
                      <span className="material-symbols-rounded text-sm">trending_up</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">تحديث تلقائي</span>
                    </div>
                  </div>
                  <div className="h-64 w-full relative">
                    <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="adminChartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1089A4" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#1089A4" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      {[...Array(5)].map((_, i) => (
                        <line key={i} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="#f0f0f0" strokeWidth="0.1" />
                      ))}
                      {chartData.length > 1 && (
                        <>
                          <path
                            d={`M 0 40 ${chartData.map((d, i) => `L ${(i / (chartData.length - 1)) * 100} ${40 - (d.value / Math.max(...chartData.map(x => x.value || 1))) * 35}`).join(' ')} L 100 40 Z`}
                            fill="url(#adminChartGradient)"
                          />
                          <path
                            d={`M ${chartData.map((d, i) => `${(i / (chartData.length - 1)) * 100} ${40 - (d.value / Math.max(...chartData.map(x => x.value || 1))) * 35}`).join(' L ')}`}
                            fill="none"
                            stroke="#1089A4"
                            strokeWidth="0.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </>
                      )}
                    </svg>
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 pt-4">
                      {chartData.map((d, i) => (
                        <span key={i} className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{d.name}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {pendingVendors.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
                    <p className="font-black text-orange-700 flex items-center gap-2">
                      <span className="material-symbols-rounded">warning</span>
                      {pendingVendors.length} موردون ينتظرون الموافقة
                    </p>
                    <button onClick={() => setActiveTab("approvals")} className="text-xs bg-orange-200 px-3 py-1 rounded-lg font-bold hover:bg-orange-300 transition-all">عرض الطلبات</button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── 2. APPROVALS ── */}
            {activeTab === "approvals" && (
              <motion.div key="approvals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Vendors */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b flex items-center justify-between">
                    <h3 className="font-black text-[#021D24]">موافقة المتاجر</h3>
                    <span className="bg-orange-100 text-orange-600 text-xs font-black px-3 py-1 rounded-full">{pendingVendors.length}</span>
                  </div>
                  <div className="divide-y">
                    {pendingVendors.map(v => (
                      <div key={v.id} className="p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#1089A4] text-white flex items-center justify-center font-black">{v.store?.[0]}</div>
                          <div>
                            <p className="font-bold text-sm text-[#021D24]">{v.store}</p>
                            <p className="text-xs text-gray-400">{v.city} • {v.name}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button disabled={actionLoading === v.id} onClick={() => handleVendorAction(v.id, "APPROVED")} className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center hover:bg-green-600 disabled:opacity-50 transition-colors">
                            <span className="material-symbols-rounded text-sm">check</span>
                          </button>
                          <button disabled={actionLoading === v.id} onClick={() => handleVendorAction(v.id, "REJECTED")} className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 disabled:opacity-50 transition-colors">
                            <span className="material-symbols-rounded text-sm">close</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    {pendingVendors.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">لا توجد طلبات معلقة ✅</p>}
                  </div>
                </div>

                {/* Pending Products */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b flex items-center justify-between">
                    <h3 className="font-black text-[#021D24]">مراجعة المنتجات</h3>
                    <span className="bg-blue-100 text-blue-600 text-xs font-black px-3 py-1 rounded-full">{pendingProducts.length}</span>
                  </div>
                  <div className="divide-y">
                    {pendingProducts.map(p => (
                      <ProductReviewRow key={p.id} p={p} onAction={handleProductAction} onEdit={openEditProduct} loading={actionLoading} />
                    ))}
                    {pendingProducts.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">لا توجد منتجات بانتظار المراجعة ✅</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── 3. ORDERS ── */}
            {activeTab === "orders" && (
              <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                
                {/* Redesigned Orders Table (Matching Mockup) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-xs" dir="rtl">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex gap-2">
                       <button className="bg-[#FF6B6B] text-white px-4 py-2 rounded font-bold hover:bg-red-500 transition-colors">إضافة حزمة تجميعية</button>
                       <button className="bg-[#FF6B6B] text-white px-4 py-2 rounded font-bold hover:bg-red-500 transition-colors">قراءة باستخدام الباركود</button>
                       <button onClick={handleExportOrdersExcel} className="bg-white border border-gray-300 px-4 py-2 rounded font-bold flex items-center gap-1 hover:bg-gray-50">تصدير إكسل <span className="material-symbols-rounded text-sm">download</span></button>
                       <label className="bg-white border border-gray-300 px-4 py-2 rounded font-bold flex items-center gap-1 hover:bg-gray-50 cursor-pointer">
                          تحديث الحالات (Excel)
                          <span className="material-symbols-rounded text-sm">upload</span>
                          <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportOrdersExcel} />
                       </label>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="font-black text-gray-700 text-lg">إدارة الطرود</span>
                       <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">{orders.length}</span>
                    </div>
                  </div>

                  {/* Filter Bar */}
                  <div className="bg-gray-50 p-3 flex justify-between items-center border-b border-gray-200">
                    <div className="flex items-center gap-2">
                       <div className="bg-white border border-gray-200 rounded px-2 py-1.5 flex items-center gap-1">
                          <span className="material-symbols-rounded text-sm text-gray-400">search</span>
                          <input type="text" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="بحث..." className="bg-transparent outline-none w-24 text-xs" />
                       </div>
                       <select className="bg-white border border-gray-200 rounded px-2 py-1.5 outline-none text-xs w-24"><option>تخصيص</option></select>
                       <select className="bg-white border border-gray-200 rounded px-2 py-1.5 outline-none text-xs w-20"><option>الكل</option></select>
                       <select className="bg-white border border-gray-200 rounded px-2 py-1.5 outline-none text-xs w-32"><option>تاريخ أخر حالة</option></select>
                       <select className="bg-white border border-gray-200 rounded px-2 py-1.5 outline-none text-xs w-20"><option>الكل</option></select>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-gray-500 font-bold">تحديد الكل</span>
                       <input type="checkbox" checked={orders.length > 0 && selectedOrders.length === orders.length} onChange={toggleAllOrders} className="rounded text-[#1089A4] w-4 h-4 cursor-pointer" />
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-center text-xs whitespace-nowrap">
                      <thead className="bg-white text-gray-400 border-b border-gray-200 uppercase tracking-widest text-[9px] font-black">
                        <tr>
                          <th className="p-3 border-l min-w-[150px]">المحتوى</th>
                          <th className="p-3 border-l min-w-[120px]">حالة الطلب</th>
                          <th className="p-3 border-l">المسار</th>
                          <th className="p-3 border-l">عرض</th>
                          <th className="p-3 border-l min-w-[120px]">رقم التتبع</th>
                          <th className="p-3 border-l">التوصيل</th>
                          <th className="p-3 border-l">COD</th>
                          <th className="p-3 border-l">الإجمالي</th>
                          <th className="p-3 border-l min-w-[140px]">البائع</th>
                          <th className="p-3 border-l min-w-[180px]">العنوان</th>
                          <th className="p-3 border-l">رقم الطرد</th>
                          <th className="p-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredOrdersArray.map((order) => {
                          const statusConfig: any = {
                            'PENDING': { label: 'معلق', color: 'bg-yellow-500', icon: 'schedule' },
                            'PROCESSING': { label: 'قيد التجهيز', color: 'bg-blue-500', icon: 'package' },
                            'SHIPPED': { label: 'قيد التوصيل', color: 'bg-purple-500', icon: 'local_shipping' },
                            'DELIVERED': { label: 'تم التوصيل', color: 'bg-green-500', icon: 'check_circle' },
                            'POSTPONED': { label: 'مؤجل', color: 'bg-orange-500', icon: 'event_busy' },
                            'RETURNED': { label: 'مرتجع', color: 'bg-gray-500', icon: 'keyboard_return' },
                            'REJECTED': { label: 'ملغاة', color: 'bg-red-500', icon: 'cancel' },
                          };
                          const s = statusConfig[order.status] || { label: order.status, color: 'bg-gray-400', icon: 'help' };

                          return (
                            <tr 
                              key={order.id} 
                              onClick={() => openEditOrder(order)} 
                              className={cn(
                                "transition-colors cursor-pointer group",
                                order.status === 'REJECTED' ? 'bg-red-50/50 hover:bg-red-50' : 'bg-white hover:bg-gray-50/50'
                              )}
                            >
                              <td className="p-4 border-l text-gray-500 max-w-[150px] truncate text-right">
                                 {order.items?.[0]?.product?.title || "—"}
                                 {order.items?.length > 1 && <span className="text-[10px] text-[#1089A4] block mt-0.5">+{order.items.length - 1} منتجات أخرى</span>}
                              </td>
                              <td className="p-4 border-l">
                                 <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white font-black text-[9px] shadow-sm", s.color)}>
                                   <span className="material-symbols-rounded text-xs">{s.icon}</span>
                                   {s.label}
                                 </div>
                              </td>
                              <td className="p-4 border-l">
                                 <div className="flex items-center justify-center gap-1">
                                   <div className={cn("w-2 h-2 rounded-full", s.color)}></div>
                                   <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                                   <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                                 </div>
                              </td>
                              <td className="p-4 border-l">
                                 <button className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-[#1089A4] transition-colors">
                                   <span className="material-symbols-rounded text-sm">visibility</span>
                                 </button>
                              </td>
                              <td className="p-4 border-l font-mono text-gray-600 font-bold">{order.trackingNumber || "—"}</td>
                              <td className="p-4 border-l font-black text-gray-700">{order.shippingCost || 0} ج.س</td>
                              <td className="p-4 border-l font-black text-gray-700">{order.paymentMethod === "COD" ? order.totalAmount?.toLocaleString() : 0}</td>
                              <td className="p-4 border-l font-black text-[#1089A4]">{order.totalAmount?.toLocaleString()}</td>
                              <td className="p-4 border-l">
                                <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                  {order.items?.[0]?.product?.vendor?.storeName || "—"}
                                </span>
                              </td>
                              <td className="p-4 border-l text-[10px] text-gray-500 leading-tight w-[200px] whitespace-normal text-right">
                                 {order.city} — {order.district}
                              </td>
                              <td className="p-4 border-l font-mono text-gray-400">#100{order.id?.slice(-5).toUpperCase()}</td>
                              <td className="p-4 text-center" onClick={(e) => { e.stopPropagation(); toggleOrderSelection(order.id); }}>
                                <input type="checkbox" checked={selectedOrders.includes(order.id)} readOnly className="rounded text-[#1089A4] w-4 h-4 cursor-pointer" />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── 4. USERS ── */}
            {activeTab === "users" && (
              <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b flex items-center justify-between bg-gray-50">
                  <h3 className="font-black text-[#021D24]">قاعدة بيانات المستخدمين ({users.length})</h3>
                  <input type="text" placeholder="بحث..." className="input-mersal w-52 text-sm py-1.5" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-[#021D24] text-white/60 text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-4">المستخدم</th>
                        <th className="px-5 py-4">الهاتف</th>
                        <th className="px-5 py-4">الدور</th>
                        <th className="px-5 py-4">تاريخ التسجيل</th>
                        <th className="px-5 py-4">الإجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedUser(u)}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#1089A4]/10 text-[#1089A4] flex items-center justify-center font-black text-sm flex-shrink-0">
                                {(u.name?.[0] || "?").toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-[#021D24]">{u.name || "بدون اسم"}</p>
                                <p className="text-xs text-[#1089A4]">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm">{u.phone || "—"}</td>
                          <td className="px-5 py-4">
                            <span className={cn("badge", u.role === "ADMIN" ? "badge-approved" : "badge-pending")}>{u.role}</span>
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString("ar-EG")}</td>
                          <td className="px-5 py-4">
                            <button className="text-xs text-[#1089A4] font-bold hover:underline" onClick={e => { e.stopPropagation(); setSelectedUser(u); }}>
                              عرض الملف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* User Profile Modal */}
                {selectedUser && (
                  <div className="fixed inset-0 z-[500] bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-[#021D24]">ملف المستخدم</h3>
                        <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                          <span className="material-symbols-rounded">close</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-14 h-14 rounded-2xl bg-[#1089A4] text-white flex items-center justify-center font-black text-2xl">
                          {(selectedUser.name?.[0] || "?").toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-lg text-[#021D24]">{selectedUser.name || "بدون اسم"}</p>
                          <p className="text-sm text-[#1089A4]">{selectedUser.email}</p>
                          <span className={cn("badge mt-1", selectedUser.role === "ADMIN" ? "badge-approved" : "badge-pending")}>{selectedUser.role}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {[
                          ["الهاتف", selectedUser.phone || "غير مضاف"],
                          ["عنوان IP", selectedUser.lastIp || "غير معروف"],
                          ["تاريخ التسجيل", new Date(selectedUser.createdAt).toLocaleDateString("ar-EG")],
                          ["آخر تسجيل دخول", selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString("ar-EG") : "—"],
                        ].map(([label, val]) => (
                          <div key={label} className="bg-gray-50 p-3 rounded-xl">
                            <p className="text-xs text-gray-400 font-bold">{label}</p>
                            <p className="font-bold text-[#021D24]">{val}</p>
                          </div>
                        ))}
                      </div>
                      <button className="w-full py-2.5 bg-red-50 text-red-500 rounded-xl font-bold text-sm border border-red-200">
                        حظر هذا المستخدم
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── 5. VENDORS ── */}
            {activeTab === "vendors" && (
              <motion.div key="vendors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                {/* Header with Add Button */}
                <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                   <div>
                      <h3 className="font-black text-[#021D24]">إدارة الموردين</h3>
                      <p className="text-xs text-gray-400">إجمالي المتاجر المسجلة: {allVendors.length}</p>
                   </div>
                   <button onClick={() => setVendorModal("add")} className="bg-[#1089A4] text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-[#0d6e84] transition-colors shadow-lg shadow-[#1089A4]/20">
                      <span className="material-symbols-rounded">add_business</span>
                      إضافة متجر جديد
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allVendors.map((store, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-[#021D24] text-white flex items-center justify-center font-black text-lg">
                          {store.name?.[0]}
                        </div>
                        <span className={cn("badge", store.status === "APPROVED" ? "badge-approved" : "badge-pending")}>
                          {store.status === "APPROVED" ? "نشط" : store.status}
                        </span>
                      </div>
                      <h3 className="font-black text-[#021D24] mb-1">{store.name}</h3>
                      <p className="text-xs text-gray-400 mb-4">المالك: {store.owner}</p>
                      <div className="grid grid-cols-2 gap-3 border-t pt-4">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase block">المنتجات</span>
                          <span className="font-black text-[#1089A4]">{store.productsCount}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase block">المبيعات</span>
                          <span className="font-black text-[#F29124]">{store.sales}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button 
                          disabled={actionLoading === store.id}
                          onClick={() => handleVendorAction(store.id, store.status === "APPROVED" ? "SUSPEND" : "ACTIVATE")}
                          className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-lg border transition-colors disabled:opacity-50",
                            store.status === "APPROVED" 
                              ? "border-red-100 text-red-500 hover:bg-red-50" 
                              : "border-green-100 text-green-600 hover:bg-green-50"
                          )}>
                          {actionLoading === store.id ? "..." : (store.status === "APPROVED" ? "إيقاف" : "تفعيل")}
                        </button>
                        <button 
                          onClick={() => handleVendorDetails(store)}
                          className="flex-1 py-2 text-xs font-bold rounded-lg bg-[#021D24] text-white hover:bg-[#1089A4] transition-colors">
                          التفاصيل
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── SUBSCRIPTIONS ── */}
            {activeTab === "subscriptions" && (
              <motion.div key="subscriptions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   {/* Plans Management */}
                   <div className="lg:col-span-1 space-y-6">
                      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                        <h3 className="font-black text-[#021D24]">إضافة باقة اشتراك</h3>
                        <div className="space-y-3">
                           <input placeholder="اسم الباقة" className="input-mersal" value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} />
                           <input type="number" placeholder="السعر (ج.س)" className="input-mersal" value={newPlan.price} onChange={e => setNewPlan({...newPlan, price: e.target.value})} />
                           <input type="number" placeholder="المدة (أيام)" className="input-mersal" value={newPlan.durationDays} onChange={e => setNewPlan({...newPlan, durationDays: e.target.value})} />
                           <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                              <input type="checkbox" checked={newPlan.isTrial} onChange={e => setNewPlan({...newPlan, isTrial: e.target.checked})} className="w-4 h-4 rounded text-[#1089A4]" />
                              <span className="text-xs font-bold text-gray-600">فترة تجريبية</span>
                           </label>
                           <button onClick={handleAddPlan} className="w-full bg-[#1089A4] text-white py-3 rounded-xl font-black text-xs shadow-lg shadow-[#1089A4]/20 hover:scale-[1.02] transition-all">
                              {actionLoading === "add_plan" ? "جاري الحفظ..." : "حفظ الباقة الجديدة"}
                           </button>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                         <h3 className="font-black text-[#021D24] text-sm">الباقات الحالية</h3>
                         <div className="space-y-3">
                            {subscriptionPlans.map(plan => (
                              <div key={plan.id} className="p-4 rounded-xl border border-gray-100 flex items-center justify-between group hover:border-[#1089A4]/30 transition-all">
                                 <div>
                                    <p className="font-black text-sm text-[#021D24]">{plan.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold">{plan.durationDays} يوم - {plan.price} ج.س</p>
                                 </div>
                                 {plan.isTrial && <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">Trial</span>}
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Vendors Subscriptions */}
                   <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm overflow-hidden">
                      <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-black text-[#021D24]">اشتراكات المتاجر</h3>
                        <p className="text-[10px] text-gray-400 font-bold">إدارة تفعيل وتعطيل المتاجر بناءً على الدفع</p>
                      </div>
                      <div className="overflow-x-auto">
                         <table className="w-full text-right">
                            <thead className="bg-[#021D24] text-white/40 text-[10px] font-black uppercase tracking-widest">
                               <tr>
                                  <th className="px-6 py-4">المتجر</th>
                                  <th className="px-6 py-4">الباقة الحالية</th>
                                  <th className="px-6 py-4">تاريخ الانتهاء</th>
                                  <th className="px-6 py-4">الحالة</th>
                                  <th className="px-6 py-4">تعديل</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                               {allVendors.map((v: any) => {
                                 const endsAt = v.subscriptionEndsAt ? new Date(v.subscriptionEndsAt) : null;
                                 const isExpired = endsAt ? endsAt < new Date() : true;
                                 
                                 return (
                                   <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                                      <td className="px-6 py-4">
                                         <div className="flex flex-col">
                                            <span className="font-black text-[#021D24] text-sm">{v.storeName || v.name}</span>
                                            <span className="text-[10px] text-[#1089A4] font-bold">{v.user?.email}</span>
                                         </div>
                                      </td>
                                      <td className="px-6 py-4">
                                         <span className="text-xs font-bold text-gray-500">{v.plan?.name || "—"}</span>
                                      </td>
                                      <td className="px-6 py-4">
                                         <span className={cn("text-xs font-black", isExpired ? "text-red-500" : "text-green-600")}>
                                            {endsAt ? endsAt.toLocaleDateString("ar-EG") : "لا يوجد اشتراك"}
                                         </span>
                                      </td>
                                      <td className="px-6 py-4">
                                         <span className={cn(
                                           "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                           isExpired ? "bg-red-50 text-red-500 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"
                                         )}>
                                            {isExpired ? "مغلق" : "نشط"}
                                         </span>
                                      </td>
                                      <td className="px-6 py-4">
                                         <select 
                                           onChange={(e) => handleAssignPlan(v.id, e.target.value)}
                                           className="input-mersal py-1 px-3 text-[10px] w-32"
                                         >
                                            <option value="">تغيير الباقة...</option>
                                            {subscriptionPlans.map(p => (
                                              <option key={p.id} value={p.id}>{p.name} ({p.durationDays} يوم)</option>
                                            ))}
                                         </select>
                                      </td>
                                   </tr>
                                 )
                               })}
                            </tbody>
                         </table>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {/* ── 6. CATEGORIES ── */}
            {activeTab === "categories" && (
              <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Add Category */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="font-black text-[#021D24] mb-4">إضافة قسم جديد</h3>
                  <div className="flex flex-col md:flex-row gap-3 items-center">
                    <label className="relative cursor-pointer shrink-0">
                      <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors">
                        {newCategory.icon ? (
                          <Image src={newCategory.icon} alt="icon" fill className="object-cover" />
                        ) : (
                          <span className="material-symbols-rounded text-gray-400">add_photo_alternate</span>
                        )}
                      </div>
                      <input type="file" accept="image/*" onChange={handleCategoryIconChange} className="hidden" />
                      {actionLoading === "cat_upload" && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                           <span className="material-symbols-rounded animate-spin">sync</span>
                        </div>
                      )}
                    </label>
                    <input value={newCategory.name} onChange={e => setNewCategory(p => ({...p, name: e.target.value}))} className="input-mersal flex-1 h-12" placeholder="اسم القسم مثلاً: ملابس" />
                    <button onClick={handleAddCategory} disabled={actionLoading === "cat"} className="btn-primary px-8 h-12 disabled:opacity-50">
                      إضافة +
                    </button>
                  </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.map(cat => (
                    <div key={cat.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow relative group">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                        className="absolute top-2 left-2 w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                      >
                         <span className="material-symbols-rounded text-sm">delete</span>
                      </button>
                      <div className="cursor-pointer" onClick={async () => {
                        const r = await fetch(`/api/admin/categories?id=${cat.id}`);
                        if (r.ok) setSelectedCategory(await r.json());
                      }}>
                        <div className="w-16 h-16 mb-3 rounded-full overflow-hidden relative bg-gray-100 flex items-center justify-center mx-auto text-3xl">
                          {cat.icon && (cat.icon.startsWith("http") || cat.icon.startsWith("/")) ? (
                             <Image src={cat.icon} alt={cat.name} fill className="object-cover" />
                          ) : (
                             <span>{cat.icon || "📦"}</span>
                          )}
                        </div>
                        <p className="font-black text-[#021D24] text-center">{cat.name}</p>
                        <p className="text-xs text-gray-400 mt-1 text-center">{cat._count?.products || 0} منتج</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Category Products Modal */}
                {selectedCategory && (
                  <div className="fixed inset-0 z-[500] bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedCategory(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                      <div className="p-5 border-b flex items-center justify-between">
                        <h3 className="font-black text-[#021D24] flex items-center gap-2">
                          <span className="text-2xl">{selectedCategory.icon}</span>
                          {selectedCategory.name} ({selectedCategory.products?.length} منتج)
                        </h3>
                        <button onClick={() => setSelectedCategory(null)}><span className="material-symbols-rounded text-gray-400">close</span></button>
                      </div>
                      <div className="overflow-y-auto p-4 space-y-3">
                        {selectedCategory.products?.map((p: any) => (
                          <div key={p.id} className="flex items-center gap-3 p-3 border rounded-xl">
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {p.images && <Image src={p.images.split(",")[0]} alt={p.title} fill className="object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-[#021D24] truncate">{p.title}</p>
                              <p className="text-xs text-gray-400">{p.vendor?.storeName}</p>
                            </div>
                            <div className="text-left">
                              <p className="font-black text-[#1089A4] text-sm">{p.price?.toLocaleString()} ج.س</p>
                              <p className="text-xs text-gray-400">مخزون: {p.stock}</p>
                            </div>
                          </div>
                        ))}
                        {selectedCategory.products?.length === 0 && <p className="text-center py-8 text-gray-400">لا توجد منتجات في هذا القسم</p>}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── 7. EMPLOYEES ── */}
            {activeTab === "employees" && (
              <motion.div key="employees" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Add Form - ADMIN ONLY */}
                {userRole === "ADMIN" && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="font-black text-[#021D24] mb-4">تعيين موظف جديد</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input value={newEmployee.name} onChange={e => setNewEmployee(p => ({...p, name: e.target.value}))} className="input-mersal" placeholder="الاسم الكامل" />
                      <input value={newEmployee.email} onChange={e => setNewEmployee(p => ({...p, email: e.target.value}))} className="input-mersal" placeholder="البريد الإلكتروني" type="email" />
                      <select value={newEmployee.role} onChange={e => setNewEmployee(p => ({...p, role: e.target.value}))} className="input-mersal">
                        {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <button onClick={handleAddEmployee} disabled={actionLoading === "emp"} className="btn-primary disabled:opacity-50">
                        تعيين +
                      </button>
                    </div>
                  </div>
                )}

                {/* Employees List */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-gray-50 border-b text-xs font-black text-gray-500 uppercase">
                      <tr>
                        <th className="px-5 py-3">الموظف</th>
                        <th className="px-5 py-3">الدور</th>
                        <th className="px-5 py-3">الحالة</th>
                        <th className="px-5 py-3">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {employees.map(emp => (
                        <tr key={emp.id} className="hover:bg-gray-50">
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-bold">{emp.name}</p>
                              <p className="text-xs text-gray-400">{emp.email}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="badge badge-packing">{ROLES[emp.role]}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={cn("badge", emp.isActive ? "badge-approved" : "badge-rejected")}>
                              {emp.isActive ? "نشط" : "موقوف"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {userRole === "ADMIN" && (
                              <button onClick={() => handleDeleteEmployee(emp.id)} className="text-xs text-red-500 font-bold hover:underline">حذف</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {employees.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">لا يوجد موظفون مضافون بعد</p>}
                </div>
              </motion.div>
            )}

            {/* ── 8. PAYMENTS ── */}
            {activeTab === "payments" && (
              <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-4">
                {paymentSettings ? (
                  <>
                    {/* COD */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-[#021D24] flex items-center gap-2">
                          <span className="material-symbols-rounded text-[#F29124]">payments</span>
                          الدفع عند الاستلام
                        </h3>
                        <button
                          onClick={() => setPaymentSettings((p: any) => ({...p, codEnabled: !p.codEnabled}))}
                          className={cn("w-12 h-6 rounded-full relative transition-all", paymentSettings.codEnabled ? "bg-[#1089A4]" : "bg-gray-200")}
                        >
                          <div className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow", paymentSettings.codEnabled ? "right-0.5" : "left-0.5")} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-gray-500 block mb-1">رسوم التوصيل الإضافية (ج.س)</label>
                          <input type="number" value={paymentSettings.codExtraFee || 2000}
                            onChange={e => setPaymentSettings((p: any) => ({...p, codExtraFee: Number(e.target.value)}))}
                            className="input-mersal" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 block mb-1">المدن المتاحة</label>
                          <input value={paymentSettings.codCitiesOnly || "الخرطوم"}
                            onChange={e => setPaymentSettings((p: any) => ({...p, codCitiesOnly: e.target.value}))}
                            className="input-mersal" placeholder="الخرطوم، أم درمان..." />
                        </div>
                      </div>
                    </div>

                    {/* Bank Transfer */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-[#021D24] flex items-center gap-2">
                          <span className="material-symbols-rounded text-[#1089A4]">account_balance</span>
                          التحويل البنكي
                        </h3>
                        <button
                          onClick={() => setPaymentSettings((p: any) => ({...p, bankTransferEnabled: !p.bankTransferEnabled}))}
                          className={cn("w-12 h-6 rounded-full relative transition-all", paymentSettings.bankTransferEnabled ? "bg-[#1089A4]" : "bg-gray-200")}
                        >
                          <div className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow", paymentSettings.bankTransferEnabled ? "right-0.5" : "left-0.5")} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-gray-500 block mb-1">اسم البنك</label>
                          <input value={paymentSettings.bankName || ""} onChange={e => setPaymentSettings((p: any) => ({...p, bankName: e.target.value}))} className="input-mersal" placeholder="بنك السودان الجزيرة..." />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 block mb-1">رقم الحساب</label>
                          <input value={paymentSettings.bankAccountNumber || ""} onChange={e => setPaymentSettings((p: any) => ({...p, bankAccountNumber: e.target.value}))} className="input-mersal" placeholder="1234567890" dir="ltr" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 block mb-1">اسم صاحب الحساب</label>
                          <input value={paymentSettings.bankAccountName || ""} onChange={e => setPaymentSettings((p: any) => ({...p, bankAccountName: e.target.value}))} className="input-mersal" placeholder="مرسال للتجارة الإلكترونية" />
                        </div>
                      </div>
                    </div>

                    <button onClick={handleSavePayments} disabled={actionLoading === "pay"} className="btn-primary w-full py-3 text-sm disabled:opacity-50">
                      {actionLoading === "pay" ? "جاري الحفظ..." : "💾 حفظ إعدادات الدفع"}
                    </button>
                  </>
                ) : <p className="text-center py-8 text-gray-400">جاري التحميل...</p>}
              </motion.div>
            )}

            {/* ── 9. DELIVERY ZONES ── */}
            {activeTab === "delivery" && (
              <motion.div key="delivery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="font-black text-[#021D24] mb-4">إضافة منطقة توصيل</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">من مدينة</label>
                      <input
                        value={newZone.fromCity}
                        onChange={e => setNewZone(p => ({...p, fromCity: e.target.value}))}
                        className="input-mersal w-full"
                        placeholder="الخرطوم"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">إلى مدينة</label>
                      <input
                        value={newZone.toCity}
                        onChange={e => setNewZone(p => ({...p, toCity: e.target.value}))}
                        className="input-mersal w-full"
                        placeholder="أم درمان"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">رسوم التوصيل (ج.س)</label>
                      <input
                        type="number"
                        value={newZone.fee}
                        onChange={e => setNewZone(p => ({...p, fee: e.target.value}))}
                        className="input-mersal w-full"
                        placeholder="مثال: 500"
                      />
                    </div>
                    <button onClick={handleAddZone} disabled={actionLoading === "zone"} className="btn-primary disabled:opacity-50 h-[42px]">إضافة +</button>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-gray-50 border-b text-xs font-black text-gray-500 uppercase">
                      <tr>
                        <th className="px-5 py-3">المنطلق</th>
                        <th className="px-5 py-3">الوصول</th>
                        <th className="px-5 py-3">رسوم التوصيل</th>
                        <th className="px-5 py-3">الحالة</th>
                        <th className="px-5 py-3">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {deliveryZones.map(zone => (
                        <tr key={zone.id} className="hover:bg-gray-50">
                          <td className="px-5 py-4 font-bold">{zone.fromCity}</td>
                          <td className="px-5 py-4 font-bold text-[#1089A4]">{zone.toCity}</td>
                          <td className="px-5 py-4 font-black text-[#F29124]">{zone.fee?.toLocaleString()} ج.س</td>
                          <td className="px-5 py-4">
                            <span className={cn("badge", zone.isActive ? "badge-approved" : "badge-rejected")}>
                              {zone.isActive ? "نشطة" : "معطّلة"}
                            </span>
                          </td>
                          <td className="px-5 py-4 flex gap-2">
                            <button onClick={async () => {
                              await fetch("/api/admin/delivery-zones", { method: "PATCH", body: JSON.stringify({ id: zone.id, isActive: !zone.isActive }) });
                              setDeliveryZones(prev => prev.map(z => z.id === zone.id ? {...z, isActive: !z.isActive} : z));
                            }} className="text-xs font-bold text-[#1089A4] hover:underline">
                              {zone.isActive ? "تعطيل" : "تفعيل"}
                            </button>
                            <button onClick={() => handleDeleteZone(zone.id)} className="text-xs font-bold text-red-500 hover:underline">حذف</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {deliveryZones.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">لم تُضف مناطق توصيل بعد</p>}
                </div>
              </motion.div>
            )}

            {/* ── 10. SHIPPING PROVIDER ── */}
            {activeTab === "shipping" && (
              <motion.div key="shipping" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
                  <h3 className="font-black text-[#021D24] flex items-center gap-2">
                    <span className="material-symbols-rounded text-[#1089A4]">settings_input_antenna</span>
                    ربط شركة الشحن
                  </h3>
                  <p className="text-sm text-gray-500">أدخل بيانات الـ API الخاص بشركة التوصيل وسيتكامل الموقع معها تلقائياً.</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">اسم الشركة</label>
                      <input value={newProvider.name} onChange={e => setNewProvider(p => ({...p, name: e.target.value}))} className="input-mersal" placeholder="مثلاً: شركة توصيل السودان" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">API Key</label>
                      <input value={newProvider.apiKey} onChange={e => setNewProvider(p => ({...p, apiKey: e.target.value}))} className="input-mersal" placeholder="sk_live_xxxx..." type="password" dir="ltr" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">Base URL للـ API</label>
                      <input value={newProvider.baseUrl} onChange={e => setNewProvider(p => ({...p, baseUrl: e.target.value}))} className="input-mersal" placeholder="https://api.deliverycompany.sd/orders" dir="ltr" />
                    </div>
                    <button onClick={handleSaveProvider} disabled={actionLoading === "provider"} className="btn-primary w-full py-3 text-sm disabled:opacity-50">
                      {actionLoading === "provider" ? "جاري الحفظ..." : "🔗 حفظ وربط الشركة"}
                    </button>
                  </div>
                </div>

                {/* Active Providers */}
                {shippingProviders.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b font-black text-[#021D24] text-sm">شركات الشحن المضافة</div>
                    <div className="divide-y">
                      {shippingProviders.map(p => (
                        <div key={p.id} className="p-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-bold">{p.name}</p>
                            <p className="text-xs text-gray-400 font-mono" dir="ltr">{p.baseUrl}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {p.isActive && <span className="badge badge-approved">نشطة</span>}
                            <button
                              onClick={() => fetch("/api/admin/shipping-provider", { method: "PATCH", body: JSON.stringify({ id: p.id, isActive: true }) }).then(fetchData)}
                              className="text-xs text-[#1089A4] font-bold hover:underline"
                            >
                              {p.isActive ? "افتراضية" : "تفعيل"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── 11. FINANCE ── */}
            {activeTab === "finance" && (
              <motion.div key="finance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">{s.label}</p>
                      <p className="text-3xl font-black text-[#1089A4]">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-[#021D24] text-white rounded-xl p-6 shadow-xl space-y-3">
                  <h3 className="font-black text-lg">طلبات سحب الأرباح</h3>
                  {withdrawals.map((req, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-sm">{req.vendor}</p>
                        <p className="text-xs text-white/40">{req.method} • {req.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-black text-[#F29124]">{req.amount?.toLocaleString()} ج.س</p>
                        {req.status === "PENDING" ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleWithdrawalAction(req.id, "APPROVED")} className="px-3 py-1 bg-green-500 rounded-lg text-xs font-bold">موافقة</button>
                            <button onClick={() => handleWithdrawalAction(req.id, "REJECTED")} className="px-3 py-1 bg-red-500 rounded-lg text-xs font-bold">رفض</button>
                          </div>
                        ) : (
                          <span className="text-xs opacity-40 uppercase">{req.status}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {withdrawals.length === 0 && <p className="text-center py-6 text-white/20 font-bold">لا توجد طلبات سحب</p>}
                </div>
              </motion.div>
            )}

            {/* ── 12. SETTINGS ── */}
            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-6">
                <div className="bg-[#021D24] text-white rounded-xl p-6 shadow-xl space-y-4">
                  <h3 className="font-black text-lg text-[#F29124]">إعدادات النظام</h3>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <p className="font-bold">وضع الصيانة</p>
                      <p className="text-xs text-white/40 mt-0.5">عند التفعيل يُقفل الموقع عن كل المستخدمين</p>
                    </div>
                    <button
                      onClick={async () => {
                        const v = !sysSettings?.maintenanceMode;
                        await fetch("/api/admin/settings", { method: "PATCH", body: JSON.stringify({ maintenanceMode: v }) });
                        setSysSettings((p: any) => ({...p, maintenanceMode: v}));
                      }}
                      className={cn("w-14 h-7 rounded-full relative transition-all", sysSettings?.maintenanceMode ? "bg-[#F29124]" : "bg-white/20")}
                    >
                      <div className={cn("absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow", sysSettings?.maintenanceMode ? "left-1" : "left-8")} />
                    </button>
                  </div>
                </div>

                {/* Admins List */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-[#021D24]">هيئة المدراء</h3>
                    <button onClick={handlePromoteAdmin} disabled={actionLoading === "promote"} className="btn-primary text-xs px-4 py-2 disabled:opacity-50">
                      {actionLoading === "promote" ? "..." : "إضافة مدير +"}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {admins.map(admin => (
                      <div key={admin.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border">
                        <div className="w-10 h-10 rounded-lg bg-[#021D24] text-white flex items-center justify-center font-black">{admin.name?.[0]}</div>
                        <div>
                          <p className="font-bold text-sm text-[#021D24]">{admin.name}</p>
                          <p className="text-xs text-gray-400">{admin.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── 15. GLOBAL SETTINGS (Site Customization) ── */}
            {activeTab === "globalSettings" && (
              <motion.div key="globalSettings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Site Identity */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
                      <h3 className="font-black text-[#021D24] text-lg flex items-center gap-2">
                        <span className="material-symbols-rounded text-[#1089A4]">language</span>
                        هوية الموقع
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">عنوان الموقع</label>
                          <input type="text" value={sysSettings?.siteTitle || ""} onChange={e => setSysSettings({...sysSettings, siteTitle: e.target.value})} className="input-mersal" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">وصف الموقع (SEO)</label>
                          <input type="text" value={sysSettings?.siteDescription || ""} onChange={e => setSysSettings({...sysSettings, siteDescription: e.target.value})} className="input-mersal" />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">شعار الموقع (Logo)</label>
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gray-50 border flex items-center justify-center overflow-hidden">
                              {sysSettings?.logo ? <Image src={sysSettings.logo} alt="Logo" width={64} height={64} className="object-contain" /> : <span className="material-symbols-rounded text-gray-200">image</span>}
                            </div>
                            <label className="flex-1">
                              <div className="btn-secondary py-2 text-xs cursor-pointer text-center">تغيير الشعار</div>
                              <input type="file" className="hidden" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const fd = new FormData(); fd.append("file", file);
                                const res = await fetch("/api/upload", { method: "POST", body: fd });
                                const data = await res.json();
                                if (res.ok) setSysSettings({...sysSettings, logo: data.url});
                              }} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Banners Management */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-black text-[#021D24] flex items-center gap-2">
                          <span className="material-symbols-rounded text-[#F29124]">gallery_thumbnail</span>
                          إدارة البانرات والصور (First Images)
                        </h3>
                        <button onClick={() => setBannerModal({ type: "HOME_HERO" })} className="text-xs font-black text-[#1089A4] hover:underline">إضافة بانر جديد +</button>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {banners.map((b: any) => (
                            <div key={b.id} className="group relative rounded-xl overflow-hidden border border-gray-100 aspect-[21/9] bg-gray-50">
                              <Image src={b.imageUrl} alt="" fill className="object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button onClick={() => handleDeleteBanner(b.id)} className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                                  <span className="material-symbols-rounded">delete</span>
                                </button>
                                <div className="bg-white/90 px-3 py-1 rounded-full text-[10px] font-black">{b.type}</div>
                              </div>
                            </div>
                          ))}
                          {banners.length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 rounded-2xl">
                              لا توجد بانرات مضافة حالياً. الموقع سيظهر فارغاً!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Colors & Contact */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
                      <h3 className="font-black text-[#021D24] text-lg">الألوان والسمات</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-500">اللون الأساسي</span>
                          <input type="color" value={sysSettings?.primaryColor || "#1089A4"} onChange={e => setSysSettings({...sysSettings, primaryColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-500">اللون الفرعي</span>
                          <input type="color" value={sysSettings?.secondaryColor || "#F29124"} onChange={e => setSysSettings({...sysSettings, secondaryColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
                      <h3 className="font-black text-[#021D24] text-lg">معلومات التواصل</h3>
                      <div className="space-y-3">
                        <input type="text" placeholder="رقم واتساب" value={sysSettings?.whatsappNumber || ""} onChange={e => setSysSettings({...sysSettings, whatsappNumber: e.target.value})} className="input-mersal" />
                        <input type="text" placeholder="فيسبوك" value={sysSettings?.facebookUrl || ""} onChange={e => setSysSettings({...sysSettings, facebookUrl: e.target.value})} className="input-mersal" />
                        <input type="text" placeholder="إنستغرام" value={sysSettings?.instagramUrl || ""} onChange={e => setSysSettings({...sysSettings, instagramUrl: e.target.value})} className="input-mersal" />
                      </div>
                    </div>

                    <button onClick={handleSaveGlobalSettings} disabled={actionLoading === "global"} className="btn-primary w-full py-4 font-black shadow-xl shadow-[#1089A4]/20">
                      {actionLoading === "global" ? "جاري الحفظ..." : "حفظ كل التغييرات"}
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
            
            {/* ── 15. APPEARANCE ── */}
            {activeTab === "appearance" && (
              <motion.div key="appearance" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <AppearanceSettings />
              </motion.div>
            )}

            {/* ── 13. INVENTORY ── */}
            {activeTab === "inventory" && (
              <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-xs" dir="rtl">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex gap-2">
                       <button onClick={openAddProduct} className="bg-[#1089A4] text-white px-4 py-2 rounded-lg font-black hover:bg-[#0E7A92] transition-colors flex items-center gap-1.5 shadow-sm">
                         <span className="material-symbols-rounded text-sm">add_circle</span>
                         إضافة منتج جديد
                       </button>
                       <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 hover:bg-gray-50">
                         <span className="material-symbols-rounded text-sm">barcode_scanner</span>
                         قراءة باركود
                       </button>
                       <button 
                         onClick={() => handleExportExcel()}
                         className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 hover:bg-gray-50"
                       >
                         <span className="material-symbols-rounded text-sm">download</span>
                         تصدير إكسل
                       </button>
                       <label className="bg-[#F29124] text-white px-4 py-2 rounded-lg font-black flex items-center gap-1.5 hover:bg-[#d98120] cursor-pointer shadow-sm">
                          <span className="material-symbols-rounded text-sm">upload_file</span>
                          استيراد إكسل
                          <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} disabled={actionLoading === "import_excel"} />
                       </label>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="font-black text-[#021D24] text-lg">إدارة المخزون</span>
                       <span className="bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full font-black">{inventoryProducts.length}</span>
                    </div>
                  </div>

                  {/* Filter Bar */}
                  <div className="bg-white p-6 grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-gray-100">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">إجمالي المنتجات</span>
                      <span className="text-2xl font-black text-[#021D24]">{inventoryProducts.length}</span>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col gap-1">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">نشطة</span>
                      <span className="text-2xl font-black text-[#1089A4]">{inventoryProducts.filter(p => p.status === 'APPROVED').length}</span>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex flex-col gap-1">
                      <span className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">قيد المراجعة</span>
                      <span className="text-2xl font-black text-yellow-600">{inventoryProducts.filter(p => p.status === 'PENDING').length}</span>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col gap-1">
                      <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">مرفوضة</span>
                      <span className="text-2xl font-black text-red-500">{inventoryProducts.filter(p => p.status === 'REJECTED').length}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 p-4 flex justify-between items-center border-b border-gray-200">
                    <div className="flex items-center gap-3">
                       <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm focus-within:border-[#1089A4] transition-all">
                          <span className="material-symbols-rounded text-sm text-gray-400">search</span>
                          <input type="text" value={inventorySearch} onChange={e => setInventorySearch(e.target.value)} placeholder="بحث في المنتجات..." className="bg-transparent outline-none w-56 text-xs font-bold" />
                       </div>
                       <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-xs font-bold text-gray-500 cursor-pointer hover:bg-gray-50 transition-all">
                          <span className="material-symbols-rounded text-sm">filter_list</span>
                          تصفية متقدمة
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">عرض 25 من {inventoryProducts.length}</span>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-center text-xs whitespace-nowrap">
                      <thead className="bg-white text-gray-400 border-b border-gray-200 uppercase tracking-widest text-[10px]">
                        <tr>
                          <th className="p-3 border-l min-w-[200px]">
                             <div className="font-black mb-1">المنتج</div>
                             <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1 flex items-center justify-between">
                                <input type="text" value={pTitleSearch} onChange={e => setPTitleSearch(e.target.value)} placeholder="بحث" className="bg-transparent outline-none w-full text-[10px]" />
                                <span className="material-symbols-rounded text-[14px]">search</span>
                             </div>
                          </th>
                          <th className="p-3 border-l min-w-[120px]">
                             <div className="font-black mb-1">باركود</div>
                             <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1 flex items-center justify-between">
                                <input type="text" value={pIdSearch} onChange={e => setPIdSearch(e.target.value)} placeholder="رقم SKU" className="bg-transparent outline-none w-full text-[10px]" />
                                <span className="material-symbols-rounded text-[14px]">barcode</span>
                             </div>
                          </th>
                          <th className="p-3 border-l min-w-[120px]">
                             <div className="font-black mb-1">القسم</div>
                             <select value={pCategoryFilter} onChange={e => setPCategoryFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none text-[10px] w-full font-bold">
                                <option value="الكل">الكل</option>
                                {uniqueCategories.map(cat => (
                                   <option key={cat as string} value={cat as string}>{cat as string}</option>
                                ))}
                             </select>
                          </th>
                          <th className="p-3 border-l min-w-[150px]">
                             <div className="font-black mb-1">البائع / المتجر</div>
                             <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1 flex items-center justify-between">
                                <input type="text" value={pVendorSearch} onChange={e => setPVendorSearch(e.target.value)} placeholder="بحث" className="bg-transparent outline-none w-full text-[10px]" />
                                <span className="material-symbols-rounded text-[14px]">search</span>
                             </div>
                          </th>
                          <th className="p-3 border-l">
                             <div className="font-black mb-1">المخزون</div>
                          </th>
                          <th className="p-3 border-l">
                             <div className="font-black mb-1">السعر</div>
                          </th>
                          <th className="p-3 border-l min-w-[120px]">
                             <div className="font-black mb-1">الحالة</div>
                             <select value={pStatusFilter} onChange={e => setPStatusFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none text-[10px] w-full font-bold">
                                <option value="الكل">الكل</option>
                                <option value="APPROVED">نشط</option>
                                <option value="PENDING">بانتظار الموافقة</option>
                                <option value="REJECTED">مرفوض</option>
                             </select>
                          </th>
                          <th className="p-3 border-l">
                             <div className="font-black mb-1">الإجراءات</div>
                          </th>
                          <th className="p-3 font-black">ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredInventoryArray.map(p => {
                          const statusConfig: any = {
                            'APPROVED': { label: 'نشط', color: 'bg-green-500', icon: 'check_circle' },
                            'PENDING': { label: 'قيد المراجعة', color: 'bg-yellow-500', icon: 'schedule' },
                            'REJECTED': { label: 'مرفوض', color: 'bg-red-500', icon: 'cancel' },
                          };
                          const s = statusConfig[p.status] || { label: p.status, color: 'bg-gray-400', icon: 'help' };

                          return (
                            <tr key={p.id} className={cn("transition-colors cursor-pointer group", p.status === 'REJECTED' ? 'bg-red-50/50 hover:bg-red-50' : 'bg-white hover:bg-gray-50/50')}>
                              <td className="p-4 border-l text-right flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border flex-shrink-0 group-hover:scale-105 transition-transform">
                                  {p.images && <Image src={p.images.split(",")[0]} alt="" width={48} height={48} className="object-cover w-full h-full" />}
                                </div>
                                <div>
                                  <span className="font-black text-gray-700 block text-sm">{p.title}</span>
                                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.id.slice(-8).toUpperCase()}</span>
                                </div>
                              </td>
                              <td className="p-4 border-l">
                                 <span className="bg-gray-50 text-gray-500 px-3 py-1 rounded-lg font-bold text-[10px] border border-gray-100">
                                   {p.category?.name || '—'}
                                 </span>
                              </td>
                              <td className="p-4 border-l text-[#1089A4] font-black text-sm">
                                {p.vendor?.storeName || '—'}
                              </td>
                              <td className="p-4 border-l">
                                <div className="flex flex-col items-center">
                                  <span className={cn("px-2.5 py-1 rounded-lg font-black text-xs shadow-sm border", p.stock < 10 ? "bg-red-50 text-red-600 border-red-100" : "bg-gray-50 text-gray-700 border-gray-100")}>
                                    {p.stock}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 border-l font-black text-sm text-[#021D24]">
                                {p.price?.toLocaleString()} <span className="text-[10px] opacity-40">ج.س</span>
                              </td>
                              <td className="p-4 border-l">
                                 <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white font-black text-[9px] shadow-sm", s.color)}>
                                   <span className="material-symbols-rounded text-xs">{s.icon}</span>
                                   {s.label}
                                 </div>
                              </td>
                              <td className="p-4 border-l">
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={(e) => { e.stopPropagation(); openEditProduct(p); }} className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm">
                                    <span className="material-symbols-rounded text-sm">edit</span>
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteProduct(p.id); }} className="w-8 h-8 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                    <span className="material-symbols-rounded text-sm">delete</span>
                                  </button>
                                </div>
                              </td>
                              <td className="p-4 font-mono text-gray-300 text-[10px]">#{p.id.slice(-6).toUpperCase()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── 16. ATTRIBUTES (المنتجات المتغيرة) ── */}
            {activeTab === "attributes" && (
              <motion.div key="attributes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
                  <h3 className="font-black text-[#021D24] text-lg">إضافة متغير جديد (ألوان، مقاسات...)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-400">اسم المتغير</label>
                       <input
                        type="text"
                        placeholder="مثلاً: الألوان، الرام، المقاس"
                        className="input-mersal"
                        value={newAttribute.name}
                        onChange={e => setNewAttribute({ ...newAttribute, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-400">الخيارات (افصل بينها بفاصلة ,)</label>
                       <input
                        type="text"
                        placeholder="أحمر, أخضر, أزرق..."
                        className="input-mersal"
                        value={newAttribute.options}
                        onChange={e => setNewAttribute({ ...newAttribute, options: e.target.value })}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddAttribute}
                    disabled={actionLoading === "attr"}
                    className="btn-primary w-full py-3"
                  >
                    {actionLoading === "attr" ? "جاري الحفظ..." : "حفظ المتغير والخيارات"}
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b font-black text-[#021D24]">قائمة المتغيرات المتاحة</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {attributes.map(attr => (
                      <div key={attr.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 relative group">
                        <button 
                          onClick={() => handleDeleteAttribute(attr.id)}
                          className="absolute top-4 left-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <span className="material-symbols-rounded text-sm">delete</span>
                        </button>
                        <div>
                          <h4 className="font-black text-[#021D24] text-lg mb-2">{attr.name}</h4>
                          <div className="flex flex-wrap gap-2">
                            {attr.options?.map((opt: any) => (
                              <span key={opt.id} className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-xs font-bold text-gray-600 shadow-sm">
                                {opt.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    {attributes.length === 0 && (
                      <div className="col-span-full text-center py-12 text-gray-400 font-bold">لا توجد متغيرات مسجلة حالياً</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── 14. DRIVERS ── */}
            {activeTab === "drivers" && (
              <motion.div key="drivers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
                  <h3 className="font-black text-[#021D24] text-lg">إضافة مندوب جديد</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="اسم المندوب"
                      className="input-mersal"
                      value={newDriver.name}
                      onChange={e => setNewDriver({ ...newDriver, name: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="رقم الهاتف"
                      className="input-mersal"
                      value={newDriver.phone}
                      onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })}
                    />
                    <select
                      className="input-mersal"
                      value={newDriver.vehicleType}
                      onChange={e => setNewDriver({ ...newDriver, vehicleType: e.target.value })}
                    >
                      <option value="مواتر (دباب)">مواتر (دباب)</option>
                      <option value="سيارة صغيرة">سيارة صغيرة</option>
                      <option value="بوكس / ترحيل">بوكس / ترحيل</option>
                      <option value="دفار">دفار</option>
                    </select>
                  </div>
                  <button
                    onClick={handleAddDriver}
                    disabled={actionLoading === "driver"}
                    className="btn-primary w-full py-3"
                  >
                    {actionLoading === "driver" ? "جاري الإضافة..." : "حفظ بيانات المندوب"}
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b font-black text-[#021D24]">قائمة المناديب المسجلين</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
                        <tr>
                          <th className="px-6 py-4">المندوب</th>
                          <th className="px-6 py-4">رقم الهاتف</th>
                          <th className="px-6 py-4">المركبة</th>
                          <th className="px-6 py-4">طلبات نشطة</th>
                          <th className="px-6 py-4">رابط التوصيل</th>
                          <th className="px-6 py-4 text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {drivers.map(d => (
                          <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-[#021D24]">{d.name}</div>
                              <div className="text-[10px] text-gray-400 font-mono">{d.id}</div>
                            </td>
                            <td className="px-6 py-4 font-mono">{d.phone}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 font-bold">{d.vehicleType}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-black text-[#1089A4]">{d._count?.orders || 0}</span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => {
                                  const url = `${window.location.origin}/delivery/${d.id}`;
                                  navigator.clipboard.writeText(url);
                                  alert("تم نسخ رابط المندوب! يمكنك إرساله له الآن.");
                                }}
                                className="text-[#1089A4] hover:underline flex items-center gap-1 font-bold"
                              >
                                <span className="material-symbols-rounded text-sm">content_copy</span>
                                نسخ الرابط
                              </button>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => { if(confirm("حذف المندوب؟")) handleDeleteDriver(d.id) }}
                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                              >
                                <span className="material-symbols-rounded">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {drivers.length === 0 && (
                      <div className="text-center py-12 text-gray-400 font-bold">لا يوجد مناديب مسجلين حالياً</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* ── Live Tracking Modal (Radar View) ── */}
          <AnimatePresence>
            {trackingOrder && (
              <div className="fixed inset-0 z-[550] flex items-center justify-center p-4 bg-[#021D24]/90 backdrop-blur-md">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                  animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20"
                >
                  <div className="bg-[#021D24] p-6 text-white relative">
                    <button 
                      onClick={() => setTrackingOrder(null)}
                      className="absolute left-6 top-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                    >
                      <span className="material-symbols-rounded">close</span>
                    </button>
                    
                    <div className="flex flex-col items-center text-center pt-4">
                      <div className="w-16 h-16 bg-[#F29124]/20 rounded-full flex items-center justify-center mb-4 relative">
                        <span className="material-symbols-rounded text-4xl text-[#F29124] animate-pulse">radar</span>
                        <span className="absolute inset-0 rounded-full border-2 border-[#F29124] animate-ping opacity-20"></span>
                      </div>
                      <h2 className="text-2xl font-black italic uppercase tracking-tighter">رادار المتابعة الحية</h2>
                      <p className="text-[#1089A4] text-xs font-bold mt-1 uppercase tracking-widest">Live Delivery Intelligence</p>
                    </div>
                  </div>

                  <div className="p-1 bg-gray-100">
                    {trackingOrder.trackingLat && trackingOrder.trackingLng ? (
                      <div className="relative h-[400px] w-full rounded-[2rem] overflow-hidden bg-gray-200">
                        <iframe 
                          title="Driver Location"
                          width="100%" 
                          height="100%" 
                          frameBorder="0" 
                          scrolling="no" 
                          marginHeight={0} 
                          marginWidth={0} 
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${trackingOrder.trackingLng - 0.005}%2C${trackingOrder.trackingLat - 0.005}%2C${trackingOrder.trackingLng + 0.005}%2C${trackingOrder.trackingLat + 0.005}&layer=mapnik&marker=${trackingOrder.trackingLat}%2C${trackingOrder.trackingLng}`}
                        ></iframe>
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#1089A4] rounded-xl flex items-center justify-center text-white">
                            <span className="material-symbols-rounded">local_shipping</span>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">المندوب حالياً في</p>
                            <p className="text-sm font-black text-[#021D24]">{trackingOrder.city} — {trackingOrder.district}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[400px] flex flex-col items-center justify-center text-center p-10 bg-gray-50 rounded-[2rem]">
                        <span className="material-symbols-rounded text-7xl text-gray-200 mb-4 animate-bounce">location_off</span>
                        <h3 className="text-xl font-bold text-gray-400">لا توجد إشارة GPS حالياً</h3>
                        <p className="text-sm text-gray-300 mt-2">المندوب لم يقم بتفعيل بث الموقع من هاتفه بعد، أو قد يكون في منطقة تغطية ضعيفة.</p>
                      </div>
                    )}
                  </div>

                  <div className="p-8 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border text-[#021D24]">
                        <span className="material-symbols-rounded">person</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold">اسم المندوب</p>
                        <p className="font-black text-[#021D24]">{trackingOrder.driver?.name || "مندوب مرسال"}</p>
                      </div>
                    </div>

                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${trackingOrder.trackingLat},${trackingOrder.trackingLng}`}
                      target="_blank"
                      className="px-6 py-3 bg-[#021D24] text-white rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-[#1089A4] transition shadow-xl shadow-[#021D24]/20"
                    >
                      <span className="material-symbols-rounded text-sm">map</span>
                      Google Maps ↗
                    </a>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ── Driver Assignment Modal ── */}
          <AnimatePresence>
            {assigningDriver && (
              <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                  <div className="bg-[#021D24] p-6 text-white text-center">
                    <span className="material-symbols-rounded text-5xl text-[#F29124] mb-2">sports_motorsports</span>
                    <h2 className="text-xl font-black">تعيين مندوب للتوصيل</h2>
                    <p className="text-white/60 text-sm mt-1">اختر المندوب الذي سيقوم بتوصيل الطلب رقم: {assigningDriver.orderId.slice(-8)}</p>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 block px-1">اختر المندوب المتاح</label>
                      <select 
                        className="input-mersal w-full"
                        value={selectedDriverId}
                        onChange={e => setSelectedDriverId(e.target.value)}
                      >
                        <option value="">-- اختر المندوب --</option>
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.vehicleType})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 block px-1">سعر التوصيل (ج.س)</label>
                        <input 
                          type="number"
                          className="input-mersal w-full"
                          value={deliveryPrice}
                          onChange={e => setDeliveryPrice(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 block px-1">أيام التوصيل المتوقعة</label>
                        <input 
                          type="number"
                          className="input-mersal w-full"
                          value={deliveryDays}
                          onChange={e => setDeliveryDays(e.target.value)}
                          placeholder="3"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 block px-1">رابط تتبع خارجي (اختياري)</label>
                      <input 
                        type="url"
                        className="input-mersal w-full"
                        value={manualTrackingLink}
                        onChange={e => setManualTrackingLink(e.target.value)}
                        placeholder="https://track.link/..."
                      />
                    </div>

                    {drivers.length === 0 && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs text-center font-bold">
                        تنبيه: لا يوجد مناديب مسجلين. توجه لتبويب "المناديب" لإضافة مندوب أولاً.
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => { setAssigningDriver(null); setSelectedDriverId(""); }}
                        className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition"
                      >
                        إلغاء
                      </button>
                      <button 
                        disabled={!selectedDriverId || actionLoading === assigningDriver.orderId}
                        onClick={submitDriverAssignment}
                        className="flex-1 py-3 bg-[#F29124] text-white font-black rounded-xl shadow-lg shadow-[#F29124]/20 hover:bg-[#d98120] transition disabled:opacity-50"
                      >
                        {actionLoading === assigningDriver.orderId ? "جاري الحفظ..." : "تأكيد الشحن"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
            {/* ── Admin Add Vendor Modal ── */}
            {vendorModal === "add" && (
              <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setVendorModal(null)} />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl z-10 overflow-hidden">
                  <div className="bg-[#021D24] text-white px-6 py-4 flex items-center justify-between">
                    <h3 className="font-black text-lg">إضافة متجر جديد (تاجر)</h3>
                    <button onClick={() => setVendorModal(null)} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20">
                      <span className="material-symbols-rounded text-sm">close</span>
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">اسم المتجر <span className="text-red-500">*</span></label>
                          <input value={vendorForm.storeName} onChange={e => setVendorForm(v => ({...v, storeName: e.target.value}))} placeholder="مثال: مرسال فون" className="input-mersal" />
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">المدينة</label>
                          <select value={vendorForm.location} onChange={e => setVendorForm(v => ({...v, location: e.target.value}))} className="input-mersal">
                             <option>الخرطوم</option>
                             <option>أمدرمان</option>
                             <option>بحري</option>
                             <option>بورتسودان</option>
                             <option>عطبرة</option>
                          </select>
                       </div>
                    </div>

                    <div className="h-px bg-gray-100 my-2" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">اسم المالك <span className="text-red-500">*</span></label>
                          <input value={vendorForm.ownerName} onChange={e => setVendorForm(v => ({...v, ownerName: e.target.value}))} placeholder="أحمد محمد" className="input-mersal" />
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">رقم الهاتف</label>
                          <input value={vendorForm.phone} onChange={e => setVendorForm(v => ({...v, phone: e.target.value}))} placeholder="09xxxxxxx" className="input-mersal" />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">البريد الإلكتروني <span className="text-red-500">*</span></label>
                          <input value={vendorForm.ownerEmail} onChange={e => setVendorForm(v => ({...v, ownerEmail: e.target.value}))} placeholder="owner@store.com" className="input-mersal" />
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">كلمة المرور المؤقتة <span className="text-red-500">*</span></label>
                          <input type="password" value={vendorForm.ownerPassword} onChange={e => setVendorForm(v => ({...v, ownerPassword: e.target.value}))} placeholder="••••••••" className="input-mersal" />
                       </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start gap-2">
                       <span className="material-symbols-rounded text-blue-600 text-sm">info</span>
                       <p className="text-[10px] text-blue-700 leading-relaxed font-bold">
                          عند الحفظ، سيتم إنشاء حساب مستخدم بالبريد المذكور ومنحه صلاحية "تاجر" وربط المتجر الجديد به تلقائياً.
                       </p>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 flex gap-3">
                    <button onClick={() => setVendorModal(null)} className="flex-1 py-3 text-sm font-black text-gray-500 border border-gray-200 rounded-xl hover:bg-white transition">إلغاء</button>
                    <button disabled={vendorFormLoading} onClick={handleSaveVendor} className="flex-[2] py-3 text-sm font-black text-white bg-[#1089A4] rounded-xl shadow-lg shadow-[#1089A4]/20 hover:bg-[#0d6e84] transition disabled:opacity-50">
                       {vendorFormLoading ? "جاري الإنشاء..." : "إنشاء المتجر الآن"}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ── Admin Add Banner Modal ── */}
          {bannerModal && (
            <div className="fixed inset-0 z-[650] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-[#021D24]/80 backdrop-blur-md" onClick={() => setBannerModal(null)} />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md z-10 overflow-hidden border border-white/20">
                <div className="bg-[#1089A4] p-6 text-white text-center">
                  <span className="material-symbols-rounded text-4xl mb-2">add_photo_alternate</span>
                  <h3 className="font-black text-xl">إضافة بانر جديد</h3>
                  <p className="text-white/60 text-xs mt-1">سيتم عرض هذا البانر في {bannerModal.type === 'HOME_HERO' ? 'الرئيسية' : 'قسم خاص'}</p>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <label className="group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#1089A4] hover:bg-gray-50 transition-all overflow-hidden">
                      {actionLoading === "uploading_banner" ? (
                         <span className="w-8 h-8 border-3 border-[#1089A4] border-t-transparent rounded-full animate-spin" />
                      ) : bannerModal.imageUrl ? (
                         <Image src={bannerModal.imageUrl} alt="" fill className="object-cover" />
                      ) : (
                        <>
                          <span className="material-symbols-rounded text-4xl text-gray-200 mb-2">cloud_upload</span>
                          <span className="text-xs font-bold text-gray-400">اختر صورة البانر</span>
                        </>
                      )}
                      <input type="file" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setActionLoading("uploading_banner");
                        const fd = new FormData(); fd.append("file", file);
                        const res = await fetch("/api/upload", { method: "POST", body: fd });
                        const data = await res.json();
                        if (res.ok) setBannerModal({...bannerModal, imageUrl: data.url});
                        setActionLoading(null);
                      }} />
                    </label>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">رابط التوجيه (اختياري)</label>
                      <input type="text" placeholder="https://..." value={bannerModal.link || ""} onChange={e => setBannerModal({...bannerModal, link: e.target.value})} className="input-mersal" dir="ltr" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                     <button onClick={() => setBannerModal(null)} className="flex-1 py-3 text-sm font-black text-gray-400 border border-gray-100 rounded-xl hover:bg-gray-50 transition">إلغاء</button>
                     <button 
                      disabled={!bannerModal.imageUrl || actionLoading === "banner"} 
                      onClick={() => handleSaveBanner(bannerModal.imageUrl, bannerModal.type, bannerModal.targetId)}
                      className="flex-[2] py-3 text-sm font-black text-white bg-[#F29124] rounded-xl shadow-lg shadow-[#F29124]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                     >
                        {actionLoading === "banner" ? "جاري الحفظ..." : "نشر البانر الآن"}
                     </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>

      {/* ── Mobile Nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[200] bg-[#021D24]/95 backdrop-blur-xl border-t border-white/10 pb-safe">
        <div className="flex items-center justify-around h-16 px-2 overflow-x-auto">
          {NAV_ITEMS.slice(0, 6).map(item => {
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className="flex flex-col items-center gap-0.5 min-w-0 px-2">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", isActive ? "bg-[#1089A4] text-white" : "text-white/30")}>
                  <span className="material-symbols-rounded text-lg">{item.icon}</span>
                </div>
                {isActive && <span className="text-[8px] text-[#1089A4] font-black">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
