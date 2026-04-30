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

export default function VendorDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [statsData, setStatsData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [productSearch, setProductSearch] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [sRes, pRes, oRes] = await Promise.all([
          fetch("/api/vendor/stats"),
          fetch("/api/vendor/products"),
          fetch("/api/vendor/orders")
        ]);

        if (sRes.ok) setStatsData(await sRes.json());
        if (pRes.ok) setProducts(await pRes.json());
        if (oRes.ok) setOrders(await oRes.json());
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
    <div className="min-h-screen bg-gray-50/50 flex font-sans pt-20">
      {/* Sidebar - Original Mersal Look */}
      <aside className="w-72 bg-white border-l border-border fixed right-0 top-20 bottom-0 z-20 flex flex-col overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-50 p-1.5 border">
               <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <div>
              <p className="font-black text-[#021D24] text-lg leading-none">مرسال</p>
              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">لوحة التاجر</p>
            </div>
          </div>

          <nav className="space-y-1">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4 px-3">الرئيسية</p>
            <NavItem active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon="dashboard" label="لوحة التحكم" />
            <NavItem active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} icon="monitoring" label="التحليلات" />
            
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest my-6 px-3">إدارة المتجر</p>
            <NavItem active={activeTab === "products"} onClick={() => setActiveTab("products")} icon="inventory_2" label="المنتجات" />
            <NavItem active={activeTab === "orders"} onClick={() => setActiveTab("orders")} icon="shopping_basket" label="الطلبات" />
            <NavItem active={activeTab === "coupons"} onClick={() => setActiveTab("coupons")} icon="sell" label="الكوبونات" />
            
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest my-6 px-3">التواصل</p>
            <NavItem active={activeTab === "reviews"} onClick={() => setActiveTab("reviews")} icon="rate_review" label="التقييمات" />
            <NavItem active={activeTab === "promotion"} onClick={() => setActiveTab("promotion")} icon="campaign" label="الترويج" />
            
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest my-6 px-3">الإعدادات</p>
            <NavItem active={activeTab === "finance"} onClick={() => setActiveTab("finance")} icon="account_balance" label="المالية" />
            <NavItem active={activeTab === "settings"} onClick={() => setActiveTab("settings")} icon="settings" label="إعدادات النشر" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t">
           <a href={`/store/${statsData?.slug}`} target="_blank" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div className="w-10 h-10 bg-[#1089A4]/10 text-[#1089A4] rounded-lg flex items-center justify-center">
                 <span className="material-symbols-rounded">storefront</span>
              </div>
              <div>
                 <p className="text-xs font-black text-[#021D24]">زيارة متجرك</p>
                 <p className="text-[10px] font-bold text-gray-400">عرض الواجهة العامة</p>
              </div>
           </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow mr-72 p-10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <header className="flex items-center justify-between">
             <div>
                <h1 className="text-3xl font-black text-[#021D24]">مرحباً بك مجدداً 👋</h1>
                <p className="text-gray-400 font-bold mt-1">إليك ملخص أداء متجرك اليوم.</p>
             </div>
             <button onClick={() => setIsModalOpen(true)} className="bg-[#1089A4] text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-[#1089A4]/20 hover:scale-105 transition-all">
                إضافة منتج جديد
             </button>
          </header>

          {activeTab === "overview" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-3xl border border-border shadow-sm flex items-center gap-6">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", stat.color)}>
                       <span className="material-symbols-rounded text-3xl">{stat.icon}</span>
                    </div>
                    <div>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                       <p className="text-2xl font-black text-[#021D24] mt-1">{loading ? "..." : stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b flex items-center justify-between">
                   <h3 className="font-black text-[#021D24] text-xl">آخر المبيعات</h3>
                   <button onClick={() => setActiveTab("orders")} className="text-sm font-bold text-[#1089A4] hover:underline">عرض الكل</button>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-right">
                      <thead>
                         <tr className="bg-gray-50/50 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b">
                            <th className="px-8 py-4">رقم الطلب</th>
                            <th className="px-8 py-4">العميل</th>
                            <th className="px-8 py-4">التاريخ</th>
                            <th className="px-8 py-4">الصافي</th>
                            <th className="px-8 py-4">الحالة</th>
                         </tr>
                      </thead>
                      <tbody>
                         {orders.slice(0, 5).map(order => (
                            <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                               <td className="px-8 py-5 font-black text-[#1089A4]">#{order.id.slice(-6)}</td>
                               <td className="px-8 py-5 font-black text-[#021D24]">{order.customerName}</td>
                               <td className="px-8 py-5 text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString("ar-EG")}</td>
                               <td className="px-8 py-5 font-black">{order.totalAmount.toLocaleString()} ج.س</td>
                               <td className="px-8 py-5">
                                  <span className={cn(
                                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase",
                                    order.status === "DELIVERED" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                                  )}>
                                     {order.status}
                                  </span>
                               </td>
                            </tr>
                         ))}
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
               <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-[#021D24]">إدارة المنتجات</h3>
                    <p className="text-sm text-gray-400 font-bold mt-1">عرض وتعديل مخزون متجرك</p>
                  </div>
                  <div className="flex gap-3">
                     <button className="bg-white border border-border px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">تصدير Excel</button>
                     <button onClick={() => setIsModalOpen(true)} className="bg-[#1089A4] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#1089A4]/20 hover:scale-105 transition-all">أضف منتج جديد</button>
                  </div>
               </div>

               {/* Status Tabs & Search */}
               <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                     <div className="flex bg-gray-50 p-1 rounded-xl">
                        {[
                          { id: "all", label: "الكل", count: products.length },
                          { id: "published", label: "المنشورة", count: products.filter(p => p.status === 'APPROVED').length },
                          { id: "pending", label: "قيد المراجعة", count: products.filter(p => p.status === 'PENDING').length },
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setProductStatusFilter(tab.id)}
                            className={cn(
                              "px-6 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2",
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
                          className="bg-transparent outline-none text-xs font-bold w-full"
                        />
                     </div>
                  </div>

                  <div className="overflow-x-auto">
                     <table className="w-full text-right">
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
                                 <td className="py-5 pr-2 flex items-center gap-4">
                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                                       <Image src={p.images?.split(",")[0] || "/placeholder.png"} alt={p.title} fill className="object-cover" />
                                    </div>
                                    <div>
                                       <p className="font-black text-[#021D24] text-sm leading-none group-hover:text-[#1089A4] transition-colors">{p.title}</p>
                                       <p className="text-[10px] text-gray-400 mt-1 font-bold">SKU: {p.id.slice(-8).toUpperCase()}</p>
                                    </div>
                                 </td>
                                 <td className="py-5">
                                    <span className="text-xs font-bold text-gray-500">{p.category?.name || "بدون تصنيف"}</span>
                                 </td>
                                 <td className="py-5">
                                    <span className={cn("px-2 py-1 rounded-lg text-[10px] font-black", p.stock < 10 ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-700")}>
                                       {p.stock} قطعة
                                    </span>
                                 </td>
                                 <td className="py-5">
                                    <p className="font-black text-sm text-[#021D24]">{p.price.toLocaleString()} <span className="text-[10px]">ج.س</span></p>
                                 </td>
                                 <td className="py-5 text-center">
                                    <span className={cn(
                                      "px-2.5 py-1 rounded-full text-[9px] font-black uppercase border",
                                      p.status === "APPROVED" ? "bg-green-50 text-green-600 border-green-100" : "bg-orange-50 text-orange-500 border-orange-100"
                                    )}>
                                      {p.status === "APPROVED" ? "منشور" : "قيد المراجعة"}
                                    </span>
                                 </td>
                                 <td className="py-5 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                       <button className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-[#1089A4]/10 hover:text-[#1089A4] transition-all">
                                          <span className="material-symbols-rounded text-sm">visibility</span>
                                       </button>
                                       <button className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-blue-500/10 hover:text-blue-500 transition-all">
                                          <span className="material-symbols-rounded text-sm">edit</span>
                                       </button>
                                       <button onClick={() => handleDeleteProduct(p.id)} className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all">
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
               <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-[#021D24]">إدارة الطلبات</h3>
                    <p className="text-sm text-gray-400 font-bold mt-1">تتبع وتنفيذ طلبات عملائك</p>
                  </div>
                  <div className="flex gap-3">
                     <button className="bg-white border border-border px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">تصدير التقارير</button>
                     <button className="bg-[#021D24] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#021D24]/20 hover:scale-105 transition-all">طباعة بوليصات الشحن</button>
                  </div>
               </div>

               {/* Order Status Tabs & Search */}
               <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                     <div className="flex bg-gray-50 p-1 rounded-xl overflow-x-auto no-scrollbar">
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
                              "px-6 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap",
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
                          className="bg-transparent outline-none text-xs font-bold w-full"
                        />
                     </div>
                  </div>

                  <div className="overflow-x-auto">
                     <table className="w-full text-right">
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
                                  <td className="py-6 pr-2">
                                     <p className="font-black text-[#1089A4] text-sm leading-none">#{order.id.slice(-6).toUpperCase()}</p>
                                     <p className="text-[10px] text-gray-400 mt-1 font-bold">معرف: {order.id.slice(0, 8)}</p>
                                  </td>
                                  <td className="py-6">
                                     <p className="font-black text-[#021D24] text-sm leading-none">{order.customerName}</p>
                                     <p className="text-[10px] text-gray-400 mt-1 font-bold">{order.city}</p>
                                  </td>
                                  <td className="py-6">
                                     <span className="text-xs font-bold text-gray-500">{new Date(order.createdAt).toLocaleDateString("ar-EG")}</span>
                                  </td>
                                  <td className="py-6">
                                     <p className="font-black text-sm text-[#021D24]">{order.totalAmount.toLocaleString()} <span className="text-[10px]">ج.س</span></p>
                                  </td>
                                  <td className="py-6 text-center">
                                     <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase border", sColor)}>
                                        {order.status}
                                     </span>
                                  </td>
                                  <td className="py-6 text-center">
                                     <div className="flex items-center justify-center gap-2">
                                        <button className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-[#1089A4]/10 hover:text-[#1089A4] transition-all">
                                           <span className="material-symbols-rounded text-sm">visibility</span>
                                        </button>
                                        <button className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-green-500/10 hover:text-green-600 transition-all">
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
                        <button className="mt-8 bg-[#1089A4] text-white w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#0d6e84] transition-all shadow-xl shadow-[#1089A4]/20">
                           طلب سحب الأرباح
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
                     <p className="text-3xl font-black text-[#F29124]">{(statsData?.totalSales - statsData?.netProfit)?.toLocaleString() || 0} <span className="text-sm font-bold opacity-40">ج.س</span></p>
                     <p className="text-[10px] text-gray-400 font-bold mt-2">بناءً على نسبة عمولة 10%</p>
                  </div>
               </div>

               <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
                  <div className="px-8 py-6 border-b flex items-center justify-between">
                     <h3 className="font-black text-[#021D24] text-xl">سجل السحوبات</h3>
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">آخر 10 عمليات</span>
                  </div>
                  <div className="p-12 text-center">
                     <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                        <span className="material-symbols-rounded text-3xl text-gray-300">receipt_long</span>
                     </div>
                     <p className="text-gray-400 font-bold">لا يوجد سجل سحوبات حالياً</p>
                     <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-widest">تظهر هنا العمليات بعد اكتمال أول طلب سحب</p>
                  </div>
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

      <AddProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: string, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-sm transition-all group",
        active ? "bg-[#1089A4] text-white shadow-lg shadow-[#1089A4]/20" : "text-gray-500 hover:bg-gray-50"
      )}
    >
      <span className={cn("material-symbols-rounded text-xl", active ? "text-white" : "text-gray-400 group-hover:text-[#1089A4]")}>{icon}</span>
      {label}
    </button>
  );
}
