"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import AdminSidebar from "@/components/AdminSidebar";
import AppearanceSettings from "@/components/AppearanceSettings";
import OrdersTable from "@/components/admin/OrdersTable";
import InventoryTable from "@/components/admin/InventoryTable";
import ApprovalsTab from "@/components/admin/ApprovalsTab";
import UsersVendorsTab from "@/components/admin/UsersVendorsTab";
import CategoriesTab from "@/components/admin/CategoriesTab";
import AttributesTab from "@/components/admin/AttributesTab";
import DeliveryZonesTab from "@/components/admin/DeliveryZonesTab";
import FinanceTab from "@/components/admin/FinanceTab";
import PersonnelTab from "@/components/admin/PersonnelTab";
import GlobalSettingsTab from "@/components/admin/GlobalSettingsTab";
import SubscriptionsTab from "@/components/admin/SubscriptionsTab";
import OffersAdsTab from "@/components/admin/OffersAdsTab";
import AddProductModal from "@/components/admin/AddProductModal";
import EditOrderModal from "@/components/admin/EditOrderModal";
import PrintInvoiceModal from "@/components/admin/PrintInvoiceModal";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const ORDER_STATUSES: any = {
  PENDING:          { label: "معلق",                    cls: "badge-pending", icon: "schedule",          color: "from-gray-400 to-gray-600" },
  PENDING_CONFIRM:  { label: "جاري تأكيد الطلب",        cls: "badge-pending", icon: "hourglass_top",     color: "from-yellow-400 to-yellow-600" },
  CONFIRMED:        { label: "تم استلام الطلب",          cls: "badge-active",  icon: "task_alt",          color: "from-blue-400 to-blue-600" },
  PROCESSING:       { label: "جاري التجهيز",             cls: "badge-active",  icon: "inventory_2",       color: "from-indigo-400 to-indigo-600" },
  PENDING_PICKUP:   { label: "في انتظار التحميل",       cls: "badge-pending", icon: "local_shipping",    color: "from-orange-400 to-orange-600" },
  AT_BRANCH:        { label: "في الفرع",                 cls: "badge-active",  icon: "store",             color: "from-cyan-400 to-cyan-600" },
  SHIPPED:          { label: "جاري التوصيل",             cls: "badge-active",  icon: "delivery_dining",   color: "from-[#1089A4] to-[#021D24]" },
  DELIVERED:        { label: "تم التسليم",               cls: "badge-active",  icon: "check_circle",      color: "from-green-400 to-green-600" },
  CANCELLED:        { label: "ملغي",                     cls: "badge-pending", icon: "cancel",            color: "from-red-400 to-red-600" },
  RETURNED:         { label: "مرجع",                     cls: "badge-pending", icon: "keyboard_return",   color: "from-pink-400 to-pink-600" },
  NO_ANSWER:        { label: "لم يتم الرد",              cls: "badge-pending", icon: "phone_missed",      color: "from-amber-400 to-amber-600" },
  POSTPONED:        { label: "مؤجل",                     cls: "badge-pending", icon: "event_repeat",      color: "from-purple-400 to-purple-600" },
};

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<any>("overview");
  const [orders, setOrders] = useState<any[]>([]);
  const [inventoryProducts, setInventoryProducts] = useState<any[]>([]);
  const [pendingVendors, setPendingVendors] = useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<Record<string,number>>({});
  const [deliveryByCity, setDeliveryByCity] = useState<any[]>([]);
  const [activeDrivers, setActiveDrivers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [initialVendorId, setInitialVendorId] = useState<string | undefined>(undefined);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [printingOrder, setPrintingOrder] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState("all"); // today, week, month, all, custom
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const classes = {
    card: "bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-gray-200/40 border border-white/20 overflow-hidden transition-all duration-500",
    tableHeader: "bg-[#021D24] text-white/40 text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/5",
    tableRow: "hover:bg-gray-50/80 transition-all duration-300 group cursor-pointer border-b border-gray-100/50 last:border-0",
    input: "w-full bg-white/50 backdrop-blur-md border border-gray-100 rounded-3xl px-6 py-5 text-sm font-bold outline-none focus:border-[#1089A4] focus:bg-white transition-all shadow-xl shadow-gray-100/20",
    btnPrimary: "bg-gradient-to-r from-[#1089A4] to-[#021D24] text-white px-10 py-5 rounded-3xl font-black text-sm transition-all duration-500 shadow-2xl shadow-[#1089A4]/20 hover:scale-[1.02] active:scale-95",
    badge: "px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (range?: string, from?: string, to?: string) => {
    setLoading(true);
    try {
      const r = range || dateRange;
      let statsUrl = `/api/admin/stats?range=${r}`;
      if (r === "custom" && from && to) statsUrl += `&from=${from}&to=${to}`;

      const [resOrders, resProducts, resStats, resPending, resUsers, resVendors] = await Promise.all([
        fetch("/api/admin/orders"),
        fetch("/api/admin/inventory"),
        fetch(statsUrl),
        fetch("/api/admin/approvals"),
        fetch("/api/admin/users"),
        fetch("/api/admin/vendors"),
      ]);
      if (resOrders.ok) setOrders(await resOrders.json());
      if (resProducts.ok) setInventoryProducts(await resProducts.json());
      if (resStats.ok) {
        const d = await resStats.json();
        setStats(d.stats || []);
        setOrderStatuses(d.orderStatuses || {});
        setDeliveryByCity(d.deliveryByCity || []);
        setActiveDrivers(d.activeDrivers || 0);
      }
      if (resUsers.ok) setUsers(await resUsers.json());
      if (resVendors.ok) setVendors(await resVendors.json());
      if (resPending?.ok) {
        const d = await resPending.json();
        setPendingVendors(d.vendors || []);
        setPendingProducts(d.products || []);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleVendorAction = async (id: string, action: string) => {
    setActionLoading(id);
    await fetch("/api/admin/vendors", { 
      method: "PATCH", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }) 
    });
    fetchData();
    setActionLoading(null);
  };

  const handleProductAction = async (id: string, action: string) => {
    setActionLoading(id);
    await fetch("/api/admin/products", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }) 
    });
    fetchData();
    setActionLoading(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-[#1089A4] border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-[#021D24] uppercase tracking-widest text-xs text-center">جاري التجهيز...</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FDFEFE] relative overflow-hidden" dir="rtl">
      {/* Abstract Background Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#1089A4]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F29124]/5 blur-[120px] rounded-full pointer-events-none" />

      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }} 
        userRole={(session?.user as any)?.role || "ADMIN"} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 p-8 md:p-16 overflow-y-auto relative z-10 custom-scrollbar w-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 md:mb-16 gap-6 w-full relative z-20">
          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-14 h-14 shrink-0 bg-[#021D24] text-white rounded-[1.2rem] shadow-xl flex items-center justify-center hover:bg-[#1089A4] active:scale-95 transition-all z-30"
              aria-label="فتح القائمة"
            >
              <span className="material-symbols-rounded text-2xl">menu</span>
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
               <span className="hidden md:block w-8 h-1.5 bg-[#F29124] rounded-full" />
               <h1 className="text-2xl md:text-4xl font-black text-[#021D24] tracking-tight">
                 {activeTab === "overview" ? "لوحة القيادة" : 
                  activeTab === "orders" ? "إدارة الطلبيات" :
                  activeTab === "inventory" ? "المخزون المركزي" :
                  activeTab === "users" ? "قاعدة العملاء" :
                  activeTab === "vendors" ? "شبكة الموردين" : "الإعدادات"}
               </h1>
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              نظام مبهورون المتكامل لإدارة اللوجستيات
            </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 bg-white/80 backdrop-blur-xl p-3 pr-6 rounded-[2rem] border border-white shadow-xl shadow-gray-200/50 w-full md:w-auto justify-between md:justify-start">
             <div className="text-right">
                <p className="font-black text-[#021D24] text-sm leading-tight">{session?.user?.name || "مدير النظام"}</p>
                <p className="text-[9px] text-[#F29124] font-black uppercase tracking-widest mt-1">Super Admin Account</p>
             </div>
             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1089A4] to-[#021D24] text-white flex items-center justify-center font-black text-xl shadow-lg shadow-[#1089A4]/20">
                {(session?.user?.name?.[0] || "M").toUpperCase()}
             </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Date Filter */}
                <div className="bg-white rounded-[2rem] p-4 border border-gray-100 shadow-xl flex flex-wrap gap-3 items-center">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">الفترة:</span>
                  {[
                    { key: "today", label: "اليوم" },
                    { key: "week",  label: "آخر 7 أيام" },
                    { key: "month", label: "آخر 30 يوم" },
                    { key: "all",   label: "الكل" },
                    { key: "custom", label: "مخصص" },
                  ].map(r => (
                    <button
                      key={r.key}
                      onClick={() => { setDateRange(r.key); fetchData(r.key); }}
                      className={cn(
                        "px-4 py-2 rounded-2xl text-xs font-black transition-all",
                        dateRange === r.key ? "bg-[#1089A4] text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                      )}
                    >{r.label}</button>
                  ))}
                  {dateRange === "custom" && (
                    <div className="flex items-center gap-2 mr-2">
                      <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                      <span className="text-gray-400">←</span>
                      <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                      <button onClick={() => fetchData("custom", customFrom, customTo)} className="bg-[#1089A4] text-white px-4 py-2 rounded-xl text-xs font-black">تطبيق</button>
                    </div>
                  )}
                </div>

                {/* Main Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                  {stats.map((s: any, i: number) => (
                    <div
                      key={i}
                      onClick={() => s.tab && setActiveTab(s.tab)}
                      className={cn(classes.card, "p-6 md:p-10 group hover:scale-[1.02] active:scale-95 cursor-pointer")}
                    >
                       <div className="flex items-center justify-between mb-4">
                          <div className={cn("w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500 group-hover:rotate-12", s.color)}>
                            <span className="material-symbols-rounded text-2xl md:text-3xl">{s.icon}</span>
                          </div>
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#F29124]/10 group-hover:text-[#F29124] transition-colors">
                             <span className="material-symbols-rounded text-base md:text-lg">arrow_outward</span>
                          </div>
                       </div>
                       <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">{s.label}</p>
                       <p className="text-2xl md:text-3xl font-black text-[#021D24] tracking-tighter">{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Order Statuses Grid - Click to filter */}
                <div>
                  <h3 className="text-lg font-black text-[#021D24] mb-4 flex items-center gap-3">
                    <span className="w-8 h-1.5 bg-[#F29124] rounded-full"/>
                    حالات الطلبات
                    <button onClick={() => { setStatusFilter(null); setActiveTab("orders"); }} className="text-[10px] font-black text-[#1089A4] bg-[#1089A4]/10 px-3 py-1 rounded-xl mr-2">عرض الكل</button>
                  </h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {Object.entries(ORDER_STATUSES).map(([key, s]: any) => (
                      <button
                        key={key}
                        onClick={() => { setStatusFilter(key); setActiveTab("orders"); }}
                        className="bg-white rounded-[1.5rem] p-4 border border-gray-100 shadow-md hover:shadow-xl hover:border-[#1089A4]/30 transition-all text-center group"
                      >
                        <div className={cn("w-10 h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform", s.color)}>
                          <span className="material-symbols-rounded text-lg">{s.icon}</span>
                        </div>
                        <p className="text-[11px] font-black text-[#021D24] leading-tight">{s.label}</p>
                        <p className="text-xl font-black text-[#1089A4] mt-1">{orderStatuses[key] || 0}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery by City + Active Drivers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={cn(classes.card, "p-8")}>
                    <h4 className="text-base font-black text-[#021D24] mb-6 flex items-center gap-3">
                      <span className="material-symbols-rounded text-[#1089A4]">map</span>
                      التوصيل حسب المنطقة
                    </h4>
                    <div className="space-y-4">
                      {deliveryByCity.slice(0,6).map((d: any) => (
                        <div key={d.city} className="flex items-center gap-4">
                          <div className="flex-grow">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-black text-[#021D24]">{d.city}</span>
                              <span className="text-xs font-black text-gray-400">{d.count} طلب</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#1089A4] to-[#F29124] rounded-full transition-all"
                                style={{ width: `${Math.min((d.count / Math.max(...deliveryByCity.map((x:any)=>x.count), 1)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {deliveryByCity.length === 0 && <p className="text-gray-300 text-sm font-black text-center py-8">لا توجد بيانات</p>}
                    </div>
                  </div>

                  <div className={cn(classes.card, "p-8")}>
                    <h4 className="text-base font-black text-[#021D24] mb-6 flex items-center gap-3">
                      <span className="material-symbols-rounded text-[#1089A4]">delivery_dining</span>
                      السائقون
                    </h4>
                    <div className="flex flex-col items-center justify-center h-32">
                      <p className="text-6xl font-black text-[#021D24]">{activeDrivers}</p>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-2">سائق نشط</p>
                    </div>
                    <button onClick={() => setActiveTab("drivers")} className="w-full mt-4 py-3 rounded-2xl bg-[#1089A4]/10 text-[#1089A4] font-black text-sm hover:bg-[#1089A4] hover:text-white transition-all">
                      إدارة المناديب
                    </button>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "approvals" && <ApprovalsTab pendingVendors={pendingVendors} pendingProducts={pendingProducts} onVendorAction={handleVendorAction} onProductAction={handleProductAction} classes={classes} />}
            {activeTab === "orders" && (
              <>
                <OrdersTable 
                  orders={orders} 
                  onEdit={setEditingOrder} 
                  onPrint={setPrintingOrder} 
                  classes={classes} 
                  ORDER_STATUSES={ORDER_STATUSES}
                  defaultStatusFilter={statusFilter}
                />
                <EditOrderModal
                  isOpen={!!editingOrder}
                  order={editingOrder}
                  onClose={() => setEditingOrder(null)}
                  onSuccess={fetchData}
                  ORDER_STATUSES={ORDER_STATUSES}
                />
                <PrintInvoiceModal
                  isOpen={!!printingOrder}
                  order={printingOrder}
                  onClose={() => setPrintingOrder(null)}
                />
              </>
            )}
            {activeTab === "inventory" && (
              <>
                <InventoryTable 
                  products={inventoryProducts} 
                  onEdit={setEditingProduct} 
                  onAdd={() => setIsAddProductOpen(true)} 
                  classes={classes} 
                />
                <AddProductModal 
                  isOpen={isAddProductOpen || !!editingProduct} 
                  editingProduct={editingProduct}
                  initialVendorId={initialVendorId}
                  onClose={() => {
                    setIsAddProductOpen(false);
                    setEditingProduct(null);
                    setInitialVendorId(undefined);
                  }} 
                  onSuccess={fetchData} 
                />
              </>
            )}
            {activeTab === "attributes" && <AttributesTab />}
            {activeTab === "delivery" && <DeliveryZonesTab />}
            {activeTab === "finance" && <FinanceTab />}
            {activeTab === "employees" && <PersonnelTab type="employees" />}
            {activeTab === "drivers" && <PersonnelTab type="drivers" />}
            {activeTab === "subscriptions" && <SubscriptionsTab />}
            {activeTab === "globalSettings" && <GlobalSettingsTab />}
            {activeTab === "categories" && <CategoriesTab />}
            {activeTab === "users" && <UsersVendorsTab type="users" data={users} classes={classes} fetchData={fetchData} />}
            {activeTab === "vendors" && <UsersVendorsTab type="vendors" data={vendors} classes={classes} fetchData={fetchData} onAddProduct={(vId) => { setInitialVendorId(vId); setIsAddProductOpen(true); setActiveTab("inventory"); }} />}
            {activeTab === "appearance" && <AppearanceSettings />}
            {activeTab === "offersAds" && <OffersAdsTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
