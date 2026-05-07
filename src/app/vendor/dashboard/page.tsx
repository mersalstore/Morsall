"use client"

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import AddProductModal from "@/components/AddProductModal";
import Image from "next/image";
import { useRouter } from "next/navigation";

import VendorStoreSettings from "@/components/VendorStoreSettings";
import StoreAnalytics from "@/components/StoreAnalytics";
import VendorCoupons from "@/components/VendorCoupons";
import VendorReviews from "@/components/VendorReviews";
import VendorSidebar from "@/components/VendorSidebar";

export default function VendorDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [statsData, setStatsData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [productSearch, setProductSearch] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  const toggleProductSelection = (id: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedProducts(newSelected);
  };

  const toggleAllProducts = () => {
    if (selectedProducts.size === filteredProducts.length) setSelectedProducts(new Set());
    else setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
  };

  const toggleOrderSelection = (id: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedOrders(newSelected);
  };

  const toggleAllOrders = () => {
    if (selectedOrders.size === filteredOrders.length) setSelectedOrders(new Set());
    else setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
  };

  const handleExportExcel = async (type: "products" | "orders" = "products") => {
    try {
      const { exportToExcel } = await import("@/lib/excel");
      
      if (type === "products") {
        const dataToExport = selectedProducts.size > 0 
          ? products.filter(p => selectedProducts.has(p.id))
          : products;

        const exportData = dataToExport.map((p: any) => ({
          "معرف المنتج (ID)": p.id,
          "اسم المنتج": p.title,
          "السعر": p.price,
          "المخزون": p.stock,
          "الحالة": p.status === "APPROVED" ? "نشط" : "قيد المراجعة",
          "القسم": p.category?.name || "—",
          "SKU": p.sku || "—",
          "الوصف": p.shortDescription || "—"
        }));
        exportToExcel(exportData, `مخزون_${statsData?.storeName || "متجري"}`);
      } else {
        const dataToExport = selectedOrders.size > 0 
          ? orders.filter(o => selectedOrders.has(o.id))
          : orders;

        const exportData = dataToExport.map((o: any) => ({
          "رقم الطلب": o.id,
          "العميل": o.customerName,
          "التاريخ": new Date(o.createdAt).toLocaleDateString("ar-EG"),
          "الصافي": o.totalAmount,
          "الحالة": o.status,
          "المدينة": o.city || "—",
          "الهاتف": o.phone || "—"
        }));
        exportToExcel(exportData, `طلبات_${statsData?.storeName || "متجري"}`);
      }
    } catch (err) {
      alert("حدث خطأ أثناء التصدير");
    }
  };

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [sRes, pRes, oRes, wRes] = await Promise.all([
          fetch("/api/vendor/stats"),
          fetch("/api/vendor/products"),
          fetch("/api/vendor/orders"),
          fetch("/api/vendor/withdrawals")
        ]);

        if (sRes.ok) setStatsData(await sRes.json());
        if (pRes.ok) setProducts(await pRes.json());
        if (oRes.ok) setOrders(await oRes.json());
        if (wRes.ok) setWithdrawals(await wRes.json());
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      const res = await fetch(`/api/vendor/products/${id}`, { method: "DELETE" });
      if (res.ok) setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert("فشل حذف المنتج");
    }
  };

  const handleWithdrawalRequest = async () => {
    if (!statsData?.netProfit || statsData.netProfit < 1000) {
      alert("عذراً، يجب أن يكون رصيدك 1000 ج.س على الأقل للسحب.");
      return;
    }

    if (!confirm(`هل ترغب في سحب رصيدك المتاح بالكامل (${statsData.netProfit.toLocaleString()} ج.س)؟`)) return;

    setActionLoading("withdrawal");
    try {
      const res = await fetch("/api/vendor/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: statsData.netProfit })
      });

      if (res.ok) {
        const newWithdrawal = await res.json();
        setWithdrawals(prev => [newWithdrawal, ...prev]);
        const sRes = await fetch("/api/vendor/stats");
        if (sRes.ok) setStatsData(await sRes.json());
        alert("تم إرسال طلب السحب بنجاح! سيتم مراجعته من قبل الإدارة.");
      } else {
        const err = await res.json();
        alert(err.error || "فشل إرسال الطلب");
      }
    } catch (err) {
      alert("خطأ في الاتصال بالخادم");
    }
    setActionLoading(null);
  };

  const [importPreview, setImportPreview] = useState<{ data: any[], errors: any[] } | null>(null);

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setActionLoading("import");
    try {
      const { importFromExcel } = await import("@/lib/excel");
      const { validateProductRow } = await import("@/lib/validation");
      const data = await importFromExcel(file);
      
      const formattedData: any[] = [];
      const allErrors: any[] = [];

      data.forEach((row: any, index: number) => {
        const product = {
          title: row["اسم المنتج"],
          price: row["السعر"],
          stock: row["المخزون"],
          images: row["روابط الصور"] || row["images"],
          sku: row["SKU"],
          shortDescription: row["وصف مصغر"]
        };

        const errors = validateProductRow(product, index);
        if (errors.length > 0) allErrors.push(...errors);
        formattedData.push(product);
      });

      setImportPreview({ data: formattedData, errors: allErrors });
      setActionLoading(null);
    } catch (err) {
      alert("فشل قراءة الملف.");
      setActionLoading(null);
    }
    e.target.value = '';
  };

  const confirmImport = async () => {
    if (!importPreview) return;
    const validData = importPreview.data.filter((_, idx) => 
      !importPreview.errors.some(e => e.row === idx + 1)
    );

    if (validData.length === 0) return alert("لا توجد بيانات صالحة للاستيراد");

    setActionLoading("import_confirm");
    const res = await fetch("/api/vendor/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: validData })
    });

    if (res.ok) {
      alert("تم إرسال المنتجات للمراجعة بنجاح!");
      setImportPreview(null);
      router.refresh();
    } else {
      alert("حدث خطأ أثناء الاستيراد.");
    }
    setActionLoading(null);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(productSearch.toLowerCase()) || 
                         p.sku?.toLowerCase().includes(productSearch.toLowerCase());
    const matchesStatus = productStatusFilter === "all" || 
                         (productStatusFilter === "published" && p.status === "APPROVED") ||
                         (productStatusFilter === "pending" && p.status === "PENDING");
    return matchesSearch && matchesStatus;
  });

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) || 
                         o.id.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: "إجمالي المبيعات", value: `${statsData?.totalSales?.toLocaleString() || 0} ج.س`, icon: "payments", color: "bg-blue-50 text-blue-600" },
    { label: "صافي الأرباح", value: `${statsData?.netProfit?.toLocaleString() || 0} ج.س`, icon: "account_balance_wallet", color: "bg-green-50 text-green-600" },
    { label: "الطلبات النشطة", value: statsData?.activeOrdersCount || 0, icon: "local_shipping", color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <VendorSidebar 
        activeTab={activeTab} 
        setActiveTab={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} 
        slug={statsData?.slug} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-grow p-3 md:p-10 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-12">
          
          <header className="flex flex-row items-center justify-between gap-3">
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[#021D24] shadow-sm shrink-0"
                >
                   <span className="material-symbols-rounded text-xl">menu</span>
                </button>
                <div className="min-w-0">
                   <h1 className="text-lg md:text-3xl font-black text-[#021D24] truncate">مرحباً 👋</h1>
                   <p className="text-[9px] md:text-sm text-gray-400 font-bold mt-0.5 truncate">ملخص أداء متجرك اليوم.</p>
                </div>
             </div>
             <button onClick={() => setIsModalOpen(true)} className="bg-[#1089A4] text-white px-4 md:px-8 py-2 md:py-3 rounded-xl font-black text-[10px] md:text-sm shadow-lg shadow-[#1089A4]/20 hover:scale-105 transition-all shrink-0">
                إضافة منتج
             </button>
          </header>

          {activeTab === "overview" && (
            <>
              {/* Plan Info Card */}
              <div className="bg-[#021D24] p-6 md:p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
                 <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-right gap-4">
                    <div className="bg-white/10 px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                       <span className="text-[10px] font-black uppercase tracking-widest">{statsData?.planName || "باقة مرسال الأساسية"}</span>
                    </div>
                    <div>
                       <h2 className="text-2xl md:text-4xl font-black mb-2">إحصائيات متجرك</h2>
                       <p className="text-white/60 text-xs md:text-sm font-bold">
                         {statsData?.commissionType === 'PERCENTAGE' 
                           ? `عمولة المنصة الحالية: ${statsData?.commissionRate}%` 
                           : `عمولة المنصة الحالية: ${statsData?.commissionRate} ج.س/قطعة`}
                       </p>
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                    {statsData?.subscriptionEndsAt && (
                       <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center min-w-[140px]">
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">ينتهي الاشتراك في</p>
                          <p className="text-sm font-black text-white">{new Date(statsData.subscriptionEndsAt).toLocaleDateString("ar-EG")}</p>
                       </div>
                    )}
                    <button onClick={() => setActiveTab("promotion")} className="bg-[#1089A4] hover:bg-[#0d6e84] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-black/20 hover:scale-105">
                       ترقية المتجر 🚀
                    </button>
                 </div>
                 
                 <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#1089A4]/20 rounded-full blur-[100px]" />
                 <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-[100px]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-border shadow-sm flex items-center gap-4 md:gap-6 group hover:border-[#1089A4] transition-all">
                    <div className={cn("w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", stat.color)}>
                       <span className="material-symbols-rounded text-2xl md:text-3xl">{stat.icon}</span>
                    </div>
                    <div className="min-w-0">
                       <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest truncate">{stat.label}</p>
                       <p className="text-lg md:text-2xl font-black text-[#021D24] mt-0.5 truncate">{loading ? "..." : stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl md:rounded-3xl border border-border overflow-hidden shadow-sm">
                <div className="px-5 py-4 md:px-8 md:py-6 border-b flex items-center justify-between">
                   <h3 className="font-black text-[#021D24] text-base md:text-xl">آخر المبيعات</h3>
                   <button onClick={() => setActiveTab("orders")} className="text-[10px] md:text-sm font-bold text-[#1089A4] hover:underline">عرض الكل</button>
                </div>
                <div className="overflow-x-auto no-scrollbar">
                   <table className="w-full text-right min-w-[600px] md:min-w-0">
                      <thead>
                         <tr className="bg-gray-50/50 text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest border-b">
                            <th className="px-5 py-3 md:px-8 md:py-4">رقم الطلب</th>
                            <th className="px-5 py-3 md:px-8 md:py-4">العميل</th>
                            <th className="px-5 py-3 md:px-8 md:py-4">التاريخ</th>
                            <th className="px-5 py-3 md:px-8 md:py-4">الصافي</th>
                            <th className="px-5 py-3 md:px-8 md:py-4 text-center">الحالة</th>
                         </tr>
                      </thead>
                      <tbody>
                         {orders.length > 0 ? orders.slice(0, 5).map(order => (
                            <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                               <td className="px-5 py-4 md:px-8 md:py-5 font-black text-[#1089A4] text-xs md:text-sm">#{order.id.slice(-6)}</td>
                               <td className="px-5 py-4 md:px-8 md:py-5 font-black text-[#021D24] text-xs md:text-sm">{order.customerName}</td>
                               <td className="px-5 py-4 md:px-8 md:py-5 text-gray-400 text-[10px] md:text-sm">{new Date(order.createdAt).toLocaleDateString("ar-EG")}</td>
                               <td className="px-5 py-4 md:px-8 md:py-5 font-black text-xs md:text-sm">{order.totalAmount.toLocaleString()} ج.س</td>
                               <td className="px-5 py-4 md:px-8 md:py-5 text-center">
                                  <span className={cn(
                                    "px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-[8px] md:text-[10px] font-black uppercase whitespace-nowrap",
                                    order.status === "DELIVERED" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                                  )}>
                                     {order.status}
                                  </span>
                               </td>
                            </tr>
                         )) : (
                           <tr>
                             <td colSpan={5} className="px-8 py-10 text-center text-gray-300 font-bold text-xs">لا توجد طلبات حالياً</td>
                           </tr>
                         )}
                      </tbody>
                   </table>
                </div>
              </div>
            </>
          )}

          {activeTab === "analytics" && <StoreAnalytics stats={statsData} />}
          {activeTab === "coupons" && <VendorCoupons />}
          {activeTab === "reviews" && <VendorReviews />}
          {activeTab === "settings" && <VendorStoreSettings />}

          {activeTab === "products" && (
            <div className="space-y-6">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg md:text-2xl font-black text-[#021D24]">إدارة المنتجات</h3>
                    <p className="text-[10px] md:text-sm text-gray-400 font-bold mt-1">عرض وتعديل مخزون متجرك</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                     <button onClick={() => handleExportExcel("products")} className="w-full sm:w-auto justify-center bg-white border border-border px-4 py-2 rounded-xl text-[10px] md:text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <span className="material-symbols-rounded text-base">download</span>
                        تصدير Excel {selectedProducts.size > 0 && `(${selectedProducts.size})`}
                     </button>
                     <label className="w-full sm:w-auto justify-center bg-[#F29124] text-white px-4 py-2 rounded-xl text-[10px] md:text-sm font-bold shadow-lg shadow-[#F29124]/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-2">
                        <span className="material-symbols-rounded text-base">upload_file</span>
                        استيراد Excel
                        <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleImportExcel} disabled={actionLoading === "import"} />
                     </label>
                     <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto justify-center bg-[#1089A4] text-white px-4 py-2 rounded-xl text-[10px] md:text-sm font-bold shadow-lg shadow-[#1089A4]/20 hover:scale-105 transition-all flex items-center gap-2">
                        <span className="material-symbols-rounded text-base">add</span>
                        أضف منتج
                     </button>
                  </div>
               </div>

               {/* Status Tabs & Search */}
               <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-border shadow-sm space-y-4 md:space-y-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                     <div className="flex bg-gray-50 p-1 rounded-xl overflow-x-auto no-scrollbar w-full md:w-auto">
                        {[
                          { id: "all", label: "الكل", count: products.length },
                          { id: "published", label: "المنشورة", count: products.filter(p => p.status === 'APPROVED').length },
                          { id: "pending", label: "قيد المراجعة", count: products.filter(p => p.status === 'PENDING').length },
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setProductStatusFilter(tab.id)}
                            className={cn(
                              "px-4 md:px-6 py-2 rounded-lg text-[10px] md:text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap",
                              productStatusFilter === tab.id ? "bg-white text-[#1089A4] shadow-sm" : "text-gray-400 hover:text-gray-600"
                            )}
                          >
                            {tab.label}
                            <span className={cn("px-1.5 py-0.5 rounded-md text-[8px]", productStatusFilter === tab.id ? "bg-[#1089A4]/10 text-[#1089A4]" : "bg-gray-200 text-gray-400")}>
                               {tab.count}
                            </span>
                          </button>
                        ))}
                     </div>
                     <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 flex items-center gap-3 w-full md:w-80 focus-within:bg-white focus-within:border-[#1089A4] transition-all">
                        <span className="material-symbols-rounded text-gray-400 text-lg">search</span>
                        <input
                          type="text"
                          value={productSearch}
                          onChange={e => setProductSearch(e.target.value)}
                          placeholder="بحث بالاسم أو الـ SKU..."
                          className="bg-transparent outline-none text-[10px] md:text-xs font-bold w-full"
                        />
                     </div>
                  </div>

                  <div className="overflow-x-auto no-scrollbar">
                     <table className="w-full text-right min-w-[700px] md:min-w-0">
                        <thead>
                           <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                              <th className="pb-4 pr-2">المنتج</th>
                              <th className="pb-4">القسم</th>
                              <th className="pb-4">المخزون</th>
                              <th className="pb-4">السعر</th>
                              <th className="pb-4 text-center">الحالة</th>
                              <th className="pb-4 text-center">الإجراءات</th>
                           </tr>
                        </thead>
                        <tbody>
                           {filteredProducts.map(p => (
                              <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50/30 transition-colors group">
                                 <td className="py-4 pr-2 flex items-center gap-3">
                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                                       <Image src={p.images?.split(",")[0] || "/placeholder.png"} alt={p.title} fill className="object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                       <p className="font-black text-[#021D24] text-xs leading-none group-hover:text-[#1089A4] transition-colors truncate">{p.title}</p>
                                       <p className="text-[9px] text-gray-400 mt-1 font-bold">ID: {p.id.slice(-6).toUpperCase()}</p>
                                    </div>
                                 </td>
                                 <td className="py-4">
                                    <span className="text-[10px] font-bold text-gray-500">{p.category?.name || "—"}</span>
                                 </td>
                                 <td className="py-4">
                                    <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black", p.stock < 10 ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-700")}>
                                       {p.stock} قطعة
                                    </span>
                                 </td>
                                 <td className="py-4">
                                    <p className="font-black text-xs text-[#021D24]">{p.price.toLocaleString()} <span className="text-[9px]">ج.س</span></p>
                                 </td>
                                 <td className="py-4 text-center">
                                    <span className={cn(
                                      "px-2 py-0.5 rounded-full text-[8px] font-black uppercase border",
                                      p.status === "APPROVED" ? "bg-green-50 text-green-600 border-green-100" : "bg-orange-50 text-orange-500 border-orange-100"
                                    )}>
                                      {p.status === "APPROVED" ? "منشور" : "مراجعة"}
                                    </span>
                                 </td>
                                 <td className="py-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                       <button className="w-7 h-7 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-[#1089A4]/10 hover:text-[#1089A4] transition-all">
                                          <span className="material-symbols-rounded text-sm">visibility</span>
                                       </button>
                                       <button className="w-7 h-7 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-blue-500/10 hover:text-blue-500 transition-all">
                                          <span className="material-symbols-rounded text-sm">edit</span>
                                       </button>
                                       <button onClick={() => handleDeleteProduct(p.id)} className="w-7 h-7 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all">
                                          <span className="material-symbols-rounded text-sm">delete</span>
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg md:text-2xl font-black text-[#021D24]">إدارة الطلبات</h3>
                    <p className="text-[10px] md:text-sm text-gray-400 font-bold mt-1">تتبع وتنفيذ طلبات عملائك</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                     <button className="w-full sm:w-auto justify-center bg-white border border-border px-6 py-2.5 rounded-xl text-[10px] md:text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">تصدير التقارير</button>
                     <button className="w-full sm:w-auto justify-center bg-[#021D24] text-white px-6 py-2.5 rounded-xl text-[10px] md:text-sm font-bold shadow-lg shadow-[#021D24]/20 hover:scale-105 transition-all">طباعة البوليصات</button>
                  </div>
               </div>

               {/* Order Status Tabs & Search */}
               <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-border shadow-sm space-y-4 md:space-y-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                     <div className="flex bg-gray-50 p-1 rounded-xl overflow-x-auto no-scrollbar w-full md:w-auto">
                        {[
                          { id: "all", label: "الكل", count: orders.length },
                          { id: "PENDING", label: "معلقة", count: orders.filter(o => o.status === 'PENDING').length },
                          { id: "PROCESSING", label: "قيد التنفيذ", count: orders.filter(o => o.status === 'PROCESSING').length },
                          { id: "SHIPPED", label: "تم الشحن", count: orders.filter(o => o.status === 'SHIPPED').length },
                          { id: "DELIVERED", label: "مكتملة", count: orders.filter(o => o.status === 'DELIVERED').length },
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setOrderStatusFilter(tab.id)}
                            className={cn(
                              "px-4 md:px-6 py-2 rounded-lg text-[10px] md:text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap",
                              orderStatusFilter === tab.id ? "bg-white text-[#1089A4] shadow-sm" : "text-gray-400 hover:text-gray-600"
                            )}
                          >
                            {tab.label}
                            <span className={cn("px-1.5 py-0.5 rounded-md text-[8px]", orderStatusFilter === tab.id ? "bg-[#1089A4]/10 text-[#1089A4]" : "bg-gray-200 text-gray-400")}>
                               {tab.count}
                            </span>
                          </button>
                        ))}
                     </div>
                     <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 flex items-center gap-3 w-full md:w-80 focus-within:bg-white focus-within:border-[#1089A4] transition-all">
                        <span className="material-symbols-rounded text-gray-400 text-lg">search</span>
                        <input
                          type="text"
                          value={orderSearch}
                          onChange={e => setOrderSearch(e.target.value)}
                          placeholder="بحث برقم الطلب أو العميل..."
                          className="bg-transparent outline-none text-[10px] md:text-xs font-bold w-full"
                        />
                     </div>
                  </div>

                  <div className="overflow-x-auto no-scrollbar">
                     <table className="w-full text-right min-w-[800px] md:min-w-0">
                        <thead>
                           <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                              <th className="pb-4 pr-2">رقم الطلب</th>
                              <th className="pb-4">العميل</th>
                              <th className="pb-4">التاريخ</th>
                              <th className="pb-4">الصافي</th>
                              <th className="pb-4 text-center">حالة الطلب</th>
                              <th className="pb-4 text-center">الإجراءات</th>
                           </tr>
                        </thead>
                        <tbody>
                           {filteredOrders.map(order => {
                             const sColor = order.status === "DELIVERED" ? "bg-green-50 text-green-600 border-green-100" : 
                                           order.status === "SHIPPED" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                           order.status === "PENDING" ? "bg-yellow-50 text-yellow-600 border-yellow-100" :
                                           "bg-orange-50 text-orange-600 border-orange-100";
                             return (
                               <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50/30 transition-colors group">
                                  <td className="py-4 pr-2">
                                     <p className="font-black text-[#1089A4] text-xs md:text-sm leading-none">#{order.id.slice(-6).toUpperCase()}</p>
                                     <p className="text-[9px] text-gray-400 mt-1 font-bold">ID: {order.id.slice(0, 6)}</p>
                                  </td>
                                  <td className="py-4">
                                     <p className="font-black text-[#021D24] text-xs leading-none">{order.customerName}</p>
                                     <p className="text-[9px] text-gray-400 mt-1 font-bold">{order.city}</p>
                                  </td>
                                  <td className="py-4">
                                     <span className="text-[10px] font-bold text-gray-500">{new Date(order.createdAt).toLocaleDateString("ar-EG")}</span>
                                  </td>
                                  <td className="py-4">
                                     <p className="font-black text-xs text-[#021D24]">{order.totalAmount.toLocaleString()} <span className="text-[9px]">ج.س</span></p>
                                  </td>
                                  <td className="py-4 text-center">
                                     <span className={cn("px-2.5 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase border", sColor)}>
                                        {order.status}
                                     </span>
                                  </td>
                                  <td className="py-4 text-center">
                                     <div className="flex items-center justify-center gap-1.5">
                                        <button className="w-7 h-7 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-[#1089A4]/10 hover:text-[#1089A4] transition-all">
                                           <span className="material-symbols-rounded text-sm">visibility</span>
                                        </button>
                                        <button className="w-7 h-7 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-green-500/10 hover:text-green-600 transition-all">
                                           <span className="material-symbols-rounded text-sm">download</span>
                                        </button>
                                     </div>
                                  </td>
                               </tr>
                             )
                           })}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          )}

          {activeTab === "finance" && (
            <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#021D24] p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                     <div className="relative z-10">
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">الرصيد القابل للسحب</p>
                        <p className="text-4xl font-black">{statsData?.netProfit?.toLocaleString() || 0} <span className="text-sm">ج.س</span></p>
                        <button 
                           onClick={handleWithdrawalRequest}
                           disabled={actionLoading === "withdrawal"}
                           className="mt-8 bg-[#1089A4] text-white w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#0d6e84] transition-all shadow-xl shadow-[#1089A4]/20 disabled:opacity-50"
                        >
                           {actionLoading === "withdrawal" ? "جاري الإرسال..." : "طلب سحب الأرباح"}
                        </button>
                     </div>
                     <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                  </div>
                  
                  <div className="bg-white p-8 rounded-[2rem] border shadow-sm flex flex-col justify-center">
                     <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">إجمالي المبيعات</p>
                     <p className="text-3xl font-black text-[#021D24]">{statsData?.totalSales?.toLocaleString() || 0} <span className="text-sm font-bold opacity-40">ج.س</span></p>
                     <div className="mt-4 flex items-center gap-2 text-green-500 bg-green-50 w-fit px-2 py-1 rounded-lg">
                        <span className="material-symbols-rounded text-sm">trending_up</span>
                        <span className="text-[10px] font-black">+12% هذا الشهر</span>
                     </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2rem] border shadow-sm flex flex-col justify-center">
                     <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">العمولات المدفوعة</p>
                     <p className="text-3xl font-black text-[#F29124]">{(statsData?.totalSales - (statsData?.netProfit + (statsData?.totalWithdrawn || 0)))?.toLocaleString() || 0} <span className="text-sm font-bold opacity-40">ج.س</span></p>
                     <p className="text-[10px] text-gray-400 font-bold mt-2">بناءً على نسبة عمولة 10%</p>
                  </div>
               </div>

               <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
                  <div className="px-8 py-6 border-b flex items-center justify-between">
                     <h3 className="font-black text-[#021D24] text-xl">سجل السحوبات</h3>
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">آخر 10 عمليات</span>
                  </div>
                  
                  {withdrawals.length > 0 ? (
                    <div className="overflow-x-auto">
                       <table className="w-full text-right">
                          <thead>
                             <tr className="bg-gray-50 border-b">
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">التاريخ</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">المبلغ</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">الحالة</th>
                             </tr>
                          </thead>
                          <tbody>
                             {withdrawals.map((w) => (
                                <tr key={w.id} className="border-b hover:bg-gray-50/50 transition-colors">
                                   <td className="px-8 py-6">
                                      <p className="text-sm font-bold text-[#021D24]">{new Date(w.createdAt).toLocaleDateString("ar-EG")}</p>
                                   </td>
                                   <td className="px-8 py-6">
                                      <p className="text-sm font-black text-[#1089A4]">{w.amount.toLocaleString()} ج.س</p>
                                   </td>
                                   <td className="px-8 py-6">
                                      <span className={cn(
                                         "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                                         w.status === "PENDING" ? "bg-amber-100 text-amber-600" :
                                         w.status === "APPROVED" ? "bg-green-100 text-green-600" :
                                         "bg-red-100 text-red-600"
                                      )}>
                                         {w.status === "PENDING" ? "قيد المراجعة" :
                                          w.status === "APPROVED" ? "تم التحويل" : "مرفوض"}
                                      </span>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                       <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                          <span className="material-symbols-rounded text-3xl text-gray-300">receipt_long</span>
                       </div>
                       <p className="text-gray-400 font-bold">لا يوجد سجل سحوبات حالياً</p>
                       <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-widest">تظهر هنا العمليات بعد اكتمال أول طلب سحب</p>
                    </div>
                  )}
               </div>
            </div>
          )}

          {activeTab === "promotion" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "الباقة الأساسية", desc: "ظهور في أعلى قسم 'وصل حديثاً' لمدة 3 أيام", price: "5,000 ج.س", color: "from-[#1089A4] to-[#086F85]" },
                { title: "الباقة الفضية", desc: "ظهور في قسم 'الأكثر مبيعاً' مع شريط مميز لمدة أسبوع", price: "12,000 ج.س", color: "from-[#F29124] to-[#D47B1E]" },
                { title: "الباقة الذهبية", desc: "إعلان بانر في الصفحة الرئيسية وظهور مميز لمدة شهر", price: "35,000 ج.س", color: "from-[#021D24] to-[#010E12]" },
              ].map((pkg, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-border shadow-sm flex flex-col justify-between gap-8 group hover:border-[#1089A4] transition-all">
                  <div>
                    <h4 className="text-xl font-black text-[#021D24] mb-2">{pkg.title}</h4>
                    <p className="text-gray-400 font-bold text-sm leading-relaxed">{pkg.desc}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#1089A4] mb-4">{pkg.price}</p>
                    <button className="w-full bg-[#021D24] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#1089A4] transition-colors">طلب الباقة</button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      {/* ── Import Preview Modal ── */}
      {importPreview && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setImportPreview(null)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl z-10 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="bg-[#1089A4] text-white p-6 flex items-center justify-between shrink-0">
               <div>
                  <h3 className="text-xl font-black">معاينة استيراد المنتجات</h3>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">تأكد من صحة البيانات قبل التأكيد النهائي</p>
               </div>
               <button onClick={() => setImportPreview(null)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all">
                  <span className="material-symbols-rounded">close</span>
               </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6">
               {importPreview.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                     <p className="text-red-600 font-black text-xs flex items-center gap-2 mb-3">
                        <span className="material-symbols-rounded text-sm">warning</span>
                        تنبيهات (سيتم تجاهل هذه الصفوف):
                     </p>
                     <div className="grid grid-cols-2 gap-2">
                        {importPreview.errors.map((err, i) => (
                           <div key={i} className="text-[10px] font-bold text-red-500 bg-white border border-red-50 p-2 rounded-lg">
                              صف #{err.row}: {err.field} - {err.message}
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                     <thead className="bg-gray-50 border-b text-[10px] font-black text-gray-400">
                        <tr>
                           <th className="px-4 py-3">المنتج</th>
                           <th className="px-4 py-3">السعر</th>
                           <th className="px-4 py-3">المخزون</th>
                           <th className="px-4 py-3">الحالة</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y">
                        {importPreview.data.map((p, i) => {
                           const hasError = importPreview.errors.some(e => e.row === i + 1);
                           return (
                              <tr key={i} className={cn(hasError ? "bg-red-50/50" : "")}>
                                 <td className="px-4 py-3 font-bold">{p.title}</td>
                                 <td className="px-4 py-3 font-black text-[#1089A4]">{p.price} ج.س</td>
                                 <td className="px-4 py-3">{p.stock}</td>
                                 <td className="px-4 py-3 font-black text-[9px] uppercase">
                                    {hasError ? <span className="text-red-500">مرفوض</span> : <span className="text-green-600">جاهز</span>}
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex items-center justify-between shrink-0">
               <p className="text-xs font-bold text-gray-400">الصفوف الصالحة: <span className="text-[#1089A4]">{importPreview.data.length - importPreview.errors.length}</span></p>
               <div className="flex gap-3">
                  <button onClick={() => setImportPreview(null)} className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-xs">إلغاء</button>
                  <button onClick={confirmImport} disabled={actionLoading === "import_confirm"} className="px-8 py-2.5 bg-[#1089A4] text-white rounded-xl font-black text-xs shadow-lg shadow-[#1089A4]/20 disabled:opacity-50">
                     {actionLoading === "import_confirm" ? "جاري الاستيراد..." : "✅ استيراد المنتجات الصالحة"}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      <AddProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
