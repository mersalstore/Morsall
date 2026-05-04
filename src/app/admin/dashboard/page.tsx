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
import AddProductModal from "@/components/admin/AddProductModal";
import EditOrderModal from "@/components/admin/EditOrderModal";
import PrintInvoiceModal from "@/components/admin/PrintInvoiceModal";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const ORDER_STATUSES: any = {
  PENDING: { label: "معلق", cls: "badge-pending", icon: "schedule" },
  PROCESSING: { label: "قيد التجهيز", cls: "badge-active", icon: "package" },
  SHIPPED: { label: "قيد التوصيل", cls: "badge-active", icon: "local_shipping" },
  DELIVERED: { label: "تم التوصيل", cls: "badge-active", icon: "check_circle" },
  RETURNED: { label: "مرتجع", cls: "badge-pending", icon: "keyboard_return" },
  REJECTED: { label: "ملغاة", cls: "badge-pending", icon: "cancel" },
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
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [printingOrder, setPrintingOrder] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resOrders, resProducts, resStats, resPending, resUsers, resVendors] = await Promise.all([
        fetch("/api/admin/orders"),
        fetch("/api/admin/inventory"),
        fetch("/api/admin/stats"),
        fetch("/api/admin/approvals"),
        fetch("/api/admin/users"),
        fetch("/api/admin/vendors"),
      ]);
      if (resOrders.ok) setOrders(await resOrders.json());
      if (resProducts.ok) setInventoryProducts(await resProducts.json());
      if (resStats.ok) {
        const d = await resStats.json();
        setStats(d.stats || []);
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

  const handleVendorAction = async (id: string, status: string) => {
    setActionLoading(id);
    await fetch("/api/admin/vendors/action", { method: "POST", body: JSON.stringify({ id, status }) });
    fetchData();
    setActionLoading(null);
  };

  const handleProductAction = async (id: string, status: string) => {
    setActionLoading(id);
    await fetch("/api/admin/products/action", { method: "POST", body: JSON.stringify({ id, status }) });
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
              className="lg:hidden w-14 h-14 shrink-0 bg-[#021D24] text-white rounded-[1.2rem] shadow-xl flex items-center justify-center hover:bg-[#1089A4] transition-all"
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
              نظام مرسال المتكامل لإدارة اللوجستيات
            </p>
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
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {stats.map((s: any, i: number) => (
                    <div 
                      key={i} 
                      onClick={() => {
                        if (s.label.includes("المتاجر")) setActiveTab("vendors");
                        if (s.label.includes("مبيعات")) setActiveTab("orders");
                      }}
                      className={cn(classes.card, "p-10 group hover:scale-[1.02] active:scale-95 cursor-pointer")}
                    >
                       <div className="flex items-center justify-between mb-6">
                          <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500 group-hover:rotate-12", s.color)}>
                            <span className="material-symbols-rounded text-3xl">{s.icon}</span>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#F29124]/10 group-hover:text-[#F29124] transition-colors">
                             <span className="material-symbols-rounded text-lg">arrow_outward</span>
                          </div>
                       </div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">{s.label}</p>
                       <div className="flex items-end gap-3">
                         <p className="text-4xl font-black text-[#021D24] tracking-tighter">{s.value}</p>
                         <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-lg mb-2">+12%</span>
                       </div>
                    </div>
                  ))}
                </div>
                
                <div className={cn(classes.card, "p-14 bg-gradient-to-br from-[#021D24] to-[#0D3B47] text-white relative overflow-hidden group")}>
                   <div className="relative z-10 max-w-2xl">
                      <span className="bg-[#F29124] text-[9px] font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-full mb-6 inline-block shadow-lg shadow-[#F29124]/20">Mersall Intelligent Engine</span>
                      <h2 className="text-4xl font-black mb-4 leading-tight">تحليلات الأداء المتقدمة <br/> لمنصة مرسال</h2>
                      <p className="text-white/50 text-sm font-medium mb-10 leading-relaxed">
                        نظام مرسال يوفر لك رؤية كاملة لجميع العمليات اللوجستية، المبيعات، وأداء الموردين في مكان واحد وبأعلى دقة ممكنة.
                      </p>
                      <button className="bg-white text-[#021D24] px-10 py-5 rounded-3xl font-black text-sm shadow-2xl hover:bg-[#F29124] hover:text-white transition-all duration-500">
                        عرض التقارير التفصيلية
                      </button>
                   </div>
                   <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
                   <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#1089A4]/20 blur-[100px] rounded-full group-hover:scale-150 transition-all duration-1000" />
                   <span className="absolute -bottom-10 -right-10 material-symbols-rounded text-[240px] text-white/5 rotate-12 transition-transform duration-1000 group-hover:rotate-45">insights</span>
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
                  onClose={() => {
                    setIsAddProductOpen(false);
                    setEditingProduct(null);
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
            {activeTab === "vendors" && <UsersVendorsTab type="vendors" data={vendors} classes={classes} fetchData={fetchData} />}
            {activeTab === "appearance" && <AppearanceSettings />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
