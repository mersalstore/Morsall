"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Timer, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Search,
  ChevronRight,
  Activity,
  Package,
  Globe,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  Settings2,
  DollarSign,
  Plus,
  Phone,
  RefreshCw,
  X,
  Loader2,
  QrCode
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  isActive: boolean;
  isOnline: boolean;
  balance: number;
  unsettledCash: number;
}

interface Branch {
  id: string;
  name: string;
  location: string;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
}

interface SettlementLog {
  id: string;
  driverId: string;
  totalCash: number;
  actualCash: number;
  difference: number;
  notes?: string | null;
  settledBy?: string | null;
  orderIds: string;
  status: string;
  createdAt: string;
}

interface UnsettledOrder {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface LogisticsTabProps {
  orders?: any[];
  users?: any[];
  vendors?: any[];
  fetchData?: any;
  ORDER_STATUSES?: any;
  classes?: any;
}

export default function LogisticsTab({ orders, users, vendors, fetchData: parentFetchData, ORDER_STATUSES, classes }: LogisticsTabProps = {}) {
  const [activeSubTab, setActiveSubTab] = useState<"fleet" | "financials" | "branches" | "dispatch">("fleet");
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [history, setHistory] = useState<SettlementLog[]>([]);
  
  // Dispatch states
  const [dispatchMode, setDispatchMode] = useState<"DRIVER" | "BRANCH">("DRIVER");
  const [activeDispatchDriverId, setActiveDispatchDriverId] = useState<string>("");
  const [activeDispatchBranchId, setActiveDispatchBranchId] = useState<string>("");
  const [dispatchBarcode, setDispatchBarcode] = useState<string>("");

  // Dynamic stats
  const [unsettledOrdersCount, setUnsettledOrdersCount] = useState(0);
  const [shippingProfitToday, setShippingProfitToday] = useState(0);
  const [pendingVendorDues, setPendingVendorDues] = useState(0);
  
  // Search state
  const [driverSearch, setDriverSearch] = useState("");
  
  // Modals state
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverOrders, setDriverOrders] = useState<UnsettledOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [reconcileModalOpen, setReconcileModalOpen] = useState(false);
  const [actualCashInput, setActualCashInput] = useState("");
  const [reconcileNotes, setReconcileNotes] = useState("");
  const [submittingReconcile, setSubmittingReconcile] = useState(false);
  
  const [bulkReconcileModalOpen, setBulkReconcileModalOpen] = useState(false);
  const [submittingBulk, setSubmittingBulk] = useState(false);
  
  const [addBranchModalOpen, setAddBranchModalOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchLocation, setNewBranchLocation] = useState("");
  const [newBranchPhone, setNewBranchPhone] = useState("");
  const [submittingBranch, setSubmittingBranch] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch settlements data (vendors, drivers, stats)
      const setRes = await fetch("/api/admin/settlements");
      if (setRes.ok) {
        const data = await setRes.json();
        setDrivers(data.drivers || []);
        setUnsettledOrdersCount(data.unsettledOrdersCount || 0);
        setShippingProfitToday(data.shippingProfitToday || 0);
        
        // Sum vendor balances for pending dues
        const vendors = data.vendors || [];
        const dues = vendors.reduce((sum: number, v: any) => sum + (v.walletBalance || 0), 0);
        setPendingVendorDues(dues);
      }

      // Fetch branches
      const branchRes = await fetch("/api/admin/branches");
      if (branchRes.ok) {
        setBranches(await branchRes.json());
      }

      // Fetch settlement history log
      const histRes = await fetch("/api/admin/settlements?history=true");
      if (histRes.ok) {
        setHistory(await histRes.json());
      }
    } catch (err) {
      console.error("Error loading logistics data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReconcile = async (driver: Driver) => {
    setSelectedDriver(driver);
    setActualCashInput(driver.unsettledCash.toString());
    setReconcileNotes("");
    setReconcileModalOpen(true);
    setLoadingOrders(true);
    
    try {
      const res = await fetch(`/api/admin/settlements?driverId=${driver.id}`);
      if (res.ok) {
        setDriverOrders(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleConfirmReconcile = async () => {
    if (!selectedDriver) return;
    setSubmittingReconcile(true);
    try {
      const orderIds = driverOrders.map(o => o.id);
      const res = await fetch("/api/admin/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "DRIVER_RECONCILIATION",
          id: selectedDriver.id,
          amount: selectedDriver.unsettledCash,
          actualCash: parseFloat(actualCashInput) || 0,
          orderIds,
          notes: reconcileNotes
        })
      });

      if (res.ok) {
        setReconcileModalOpen(false);
        setSelectedDriver(null);
        await fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "فشلت عملية التسوية");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء عملية التسوية");
    } finally {
      setSubmittingReconcile(false);
    }
  };

  const handleConfirmBulkReconcile = async () => {
    setSubmittingBulk(true);
    try {
      const res = await fetch("/api/admin/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "BULK_DRIVER_RECONCILIATION"
        })
      });

      if (res.ok) {
        const data = await res.json();
        setBulkReconcileModalOpen(false);
        alert(`تمت التسوية الجماعية بنجاح لعدد ${data.settledCount} شحنة بقيمة إجمالية ${data.totalAmount.toLocaleString()} ج.س`);
        await fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "فشلت التسوية الجماعية");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء التسوية الجماعية");
    } finally {
      setSubmittingBulk(false);
    }
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName || !newBranchLocation) return;
    setSubmittingBranch(true);
    try {
      const res = await fetch("/api/admin/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBranchName,
          location: newBranchLocation,
          phone: newBranchPhone
        })
      });

      if (res.ok) {
        setAddBranchModalOpen(false);
        setNewBranchName("");
        setNewBranchLocation("");
        setNewBranchPhone("");
        await fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "فشل إضافة الفرع");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إضافة الفرع");
    } finally {
      setSubmittingBranch(false);
    }
  };

  // Generate premium map coords based on ID hashes to keep drivers distributed but stable
  const getDriverCoords = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const x = 15 + Math.abs((hash % 70)); // 15% to 85% width
    const y = 25 + Math.abs(((hash >> 8) % 50)); // 25% to 75% height
    return { x: `${x}%`, y: `${y}%` };
  };

  // Calculate sum of COD debt
  const totalUnsettledCash = drivers.reduce((sum, d) => sum + d.unsettledCash, 0);

  const stats = [
    { label: "طلبات بانتظار التوصيل", value: unsettledOrdersCount.toString(), icon: <Package size={20} />, color: "bg-orange-500" },
    { label: "مناديب تحت التوصيل", value: drivers.filter(d => d.isActive).length.toString(), icon: <Truck size={20} />, color: "bg-[#C5A021]" },
    { label: "تحصيلات اليوم (COD)", value: `${(totalUnsettledCash / 1000).toFixed(1)}K`, icon: <Wallet size={20} />, color: "bg-green-500" },
    { label: "فروع نشطة", value: branches.length.toString(), icon: <Building2 size={20} />, color: "bg-purple-500" },
  ];

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(driverSearch.toLowerCase()) || 
    d.phone.includes(driverSearch)
  );

  const handleRouteOrder = async (orderId: string, type: "DRIVER" | "BRANCH" | "CLEAR", targetId: string) => {
    try {
      const payload: any = { id: orderId };
      if (type === "DRIVER") {
        payload.driverId = targetId;
        payload.branchId = null;
        payload.status = "SHIPPED";
      } else if (type === "BRANCH") {
        payload.branchId = targetId;
        payload.driverId = null;
        payload.status = "AT_BRANCH";
      } else {
        payload.driverId = null;
        payload.branchId = null;
        payload.status = "PENDING_PICKUP";
      }

      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (parentFetchData) await parentFetchData();
        await fetchData();
        alert("تم تحديث توجيه الشحنة بنجاح!");
      } else {
        alert("فشل تحديث توجيه الشحنة");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء التحديث");
    }
  };

  const handleDispatchBarcodeScan = async (val: string) => {
    if (!val) return;

    const matchedDriver = drivers.find(d => 
      d.id.toLowerCase() === val.toLowerCase() || 
      d.phone?.includes(val) || 
      d.name.toLowerCase().includes(val.toLowerCase()) ||
      (val.toLowerCase().startsWith("drv-") && d.id.toLowerCase().endsWith(val.toLowerCase().replace("drv-", "")))
    );

    if (matchedDriver) {
      setActiveDispatchDriverId(matchedDriver.id);
      setDispatchMode("DRIVER");
      alert(`تم تحديد المندوب النشط: ${matchedDriver.name}`);
      return;
    }

    const matchedBranch = branches.find(b => 
      b.id.toLowerCase() === val.toLowerCase() || 
      b.name.toLowerCase().includes(val.toLowerCase())
    );

    if (matchedBranch) {
      setActiveDispatchBranchId(matchedBranch.id);
      setDispatchMode("BRANCH");
      alert(`تم تحديد الفرع النشط: ${matchedBranch.name}`);
      return;
    }

    const matchedOrder = orders?.find(o => 
      o.id.toLowerCase() === val.toLowerCase() || 
      o.trackingNumber?.toLowerCase() === val.toLowerCase() ||
      o.id.toLowerCase().endsWith(val.toLowerCase().replace('#', ''))
    );

    if (matchedOrder) {
      if (dispatchMode === "DRIVER") {
        if (!activeDispatchDriverId) {
          alert("يرجى تحديد سائق نشط أولاً أو مسح باركود السائق");
          return;
        }
        await handleRouteOrder(matchedOrder.id, "DRIVER", activeDispatchDriverId);
      } else {
        if (!activeDispatchBranchId) {
          alert("يرجى تحديد فرع نشط أولاً أو مسح باركود الفرع");
          return;
        }
        await handleRouteOrder(matchedOrder.id, "BRANCH", activeDispatchBranchId);
      }
    } else {
      alert("لم يتم العثور على شحنة أو مندوب أو فرع بهذا الباركود");
    }
  };

  return (
    <div className="space-y-8 pb-20 font-black" dir="rtl">
      {/* Sub-Navigation */}
      <div className="flex gap-4 bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border border-white w-fit mx-auto shadow-xl">
         {[
           { id: "fleet", label: "الأسطول والتتبع", icon: <Truck size={16} /> },
           { id: "financials", label: "التسويات المالية", icon: <DollarSign size={16} /> },
           { id: "branches", label: "الفروع والمستودعات", icon: <Building2 size={16} /> },
           { id: "dispatch", label: "التوجيه والباركود", icon: <QrCode size={16} /> },
         ].map((tab: any) => (
           <button
             key={tab.id}
             onClick={() => setActiveSubTab(tab.id)}
             className={cn(
               "flex items-center gap-2 px-8 py-3 rounded-2xl transition-all text-xs",
               activeSubTab === tab.id 
                 ? "bg-[#0F172A] text-white shadow-lg" 
                 : "text-gray-400 hover:bg-white"
             )}
           >
             {tab.icon}
             {tab.label}
           </button>
         ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeSubTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          {activeSubTab === "fleet" && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40">
                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white mb-4", s.color)}>
                      {s.icon}
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className="text-2xl text-[#0F172A]">{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Map Visualization */}
                <div className="lg:col-span-2 bg-[#0F172A] rounded-[3rem] p-8 shadow-2xl relative overflow-hidden min-h-[500px]">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                       <svg className="w-full h-full" viewBox="0 0 800 500">
                          <path d="M50,50 L750,50 L750,450 L50,450 Z" fill="none" stroke="white" strokeWidth="0.5" />
                          <path d="M50,150 L750,150 M50,300 L750,300 M250,50 L250,450 M500,50 L500,450" fill="none" stroke="white" strokeWidth="0.2" />
                       </svg>
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                       <div className="flex justify-between items-start mb-12">
                          <div>
                             <h3 className="text-2xl text-white">مركز القيادة اللوجستي</h3>
                             <p className="text-[#C5A021] text-[10px] uppercase tracking-[0.3em] mt-1">Live Delivery Map</p>
                          </div>
                          <div className="bg-white/5 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                             <span className={cn("w-2 h-2 rounded-full animate-ping", drivers.some(d => d.isOnline) ? "bg-green-500" : "bg-orange-500")} />
                             <span className="text-[10px] text-white/60">بث حي لموقع {drivers.filter(d => d.isOnline).length} مندوب نشط</span>
                          </div>
                       </div>

                       {/* Map Markers */}
                       <div className="relative flex-grow min-h-[300px]">
                          {drivers.map((driver) => {
                            const coords = getDriverCoords(driver.id);
                            return (
                              <div 
                                key={driver.id} 
                                style={{ top: coords.y, left: coords.x }} 
                                className="absolute group cursor-pointer -translate-x-1/2 -translate-y-1/2"
                              >
                                 <div className={cn(
                                   "w-10 h-10 rounded-2xl flex items-center justify-center text-white transition-all duration-300 scale-100 hover:scale-110",
                                   driver.isOnline 
                                     ? "bg-green-500 shadow-[0_0_15px_#22c55e]" 
                                     : "bg-gray-600 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                 )}>
                                    <Truck size={18} />
                                 </div>
                                 <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-xl text-[9px] text-[#0F172A] shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                                    <p className="font-black">{driver.name}</p>
                                    <p className="text-gray-400 mt-0.5">{driver.vehicleType} • {driver.isOnline ? "متصل الآن" : "غير متصل"}</p>
                                 </div>
                              </div>
                            );
                          })}
                       </div>
                    </div>
                </div>

                {/* Fleet Performance Sidebar */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl flex flex-col">
                    <h3 className="text-base text-[#0F172A] mb-8 flex items-center gap-3">
                      <Activity size={20} className="text-[#C5A021]" />
                      حالة المناديب
                    </h3>
                    <div className="space-y-4 flex-grow overflow-y-auto max-h-[400px] custom-scrollbar">
                       {drivers.length === 0 ? (
                         <div className="text-center py-10 text-gray-400 text-xs">لا يوجد مناديب مسجلين</div>
                       ) : (
                         drivers.map((driver) => (
                           <div key={driver.id} className="flex items-center gap-4 p-4 rounded-3xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg",
                                driver.isOnline ? "bg-green-500" : "bg-slate-100 text-[#C5A021]"
                              )}>
                                 {driver.name[0]}
                              </div>
                              <div className="flex-grow min-w-0">
                                 <p className="text-xs font-black text-[#0F172A] truncate">{driver.name}</p>
                                 <p className="text-[9px] text-gray-400 mt-1">{driver.vehicleType} • {driver.phone}</p>
                              </div>
                              <div className="text-right shrink-0">
                                 <span className={cn(
                                   "px-2 py-0.5 rounded-full text-[8px] font-black",
                                   driver.isOnline ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"
                                 )}>
                                    {driver.isOnline ? "نشط" : "خارج الخدمة"}
                                 </span>
                                 <p className="text-[9px] text-slate-800 font-bold mt-1">{(driver.balance).toLocaleString()} ج.س</p>
                              </div>
                           </div>
                         ))
                       )}
                    </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "financials" && (
            <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#C5A021] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                     <div className="relative z-10">
                        <p className="text-xs font-black text-white/60 mb-2">إجمالي مديونية المناديب (COD)</p>
                        <p className="text-4xl">{totalUnsettledCash.toLocaleString()} <span className="text-sm">SDG</span></p>
                        <button 
                          onClick={() => setBulkReconcileModalOpen(true)}
                          className="mt-8 bg-white text-[#C5A021] px-6 py-3 rounded-2xl text-[10px] font-black hover:bg-[#F29124] hover:text-white transition-all shadow-lg"
                        >
                           بدء تسوية جماعية لكافة المناديب
                        </button>
                     </div>
                     <Wallet className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10" />
                  </div>
                  
                  <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl flex flex-col justify-between">
                     <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">أرباح شركة الشحن اليوم</p>
                        <p className="text-2xl text-[#0F172A]">{shippingProfitToday.toLocaleString()} SDG</p>
                     </div>
                     <div className="flex items-center gap-2 text-green-500 text-[10px] mt-4">
                        <ArrowUpRight size={14} />
                        <span>من شحنات اليوم المكتملة</span>
                     </div>
                  </div>

                  <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl flex flex-col justify-between">
                     <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">مستحقات التجار المعلقة</p>
                        <p className="text-2xl text-[#0F172A]">{pendingVendorDues.toLocaleString()} SDG</p>
                     </div>
                     <button 
                       onClick={() => alert(`مستحقات التجار المعلقة تمثل مجموع أرصدة المحافظ للمتاجر النشطة البالغة قيمتها ${pendingVendorDues.toLocaleString()} ج.س. يمكنك تسويتها من تبويب الحسابات المالية.`)}
                       className="w-full py-3 mt-4 rounded-2xl border border-gray-100 text-[10px] hover:bg-slate-50 transition-all font-black"
                     >
                        تفاصيل أرصدة التجار
                     </button>
                  </div>
               </div>

               {/* Outstanding Driver Cash Settlements */}
               <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden">
                  <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                     <div>
                        <h3 className="text-lg text-[#0F172A] font-black">المناديب المطالبين بالتسوية (COD)</h3>
                        <p className="text-xs text-gray-400 font-bold mt-1">تصفية المديونيات المعلقة للمناديب بعد تسليم الكاش للمقر</p>
                     </div>
                     <div className="flex gap-2">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs">
                          <Search size={14} className="text-gray-400" />
                          <input 
                            type="text" 
                            placeholder="بحث باسم المندوب..."
                            value={driverSearch}
                            onChange={(e) => setDriverSearch(e.target.value)}
                            className="bg-transparent outline-none text-slate-800 w-40 font-bold"
                          />
                        </div>
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-right text-xs">
                        <thead>
                           <tr className="bg-gray-50/50">
                              <th className="p-6 text-[10px] text-gray-400 font-black">المندوب</th>
                              <th className="p-6 text-[10px] text-gray-400 font-black">المديونية الحالية (COD)</th>
                              <th className="p-6 text-[10px] text-gray-400 font-black">الرصيد الإجمالي</th>
                              <th className="p-6 text-[10px] text-gray-400 font-black">رقم الهاتف</th>
                              <th className="p-6 text-[10px] text-gray-400 font-black text-center">الإجراء</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-bold">
                           {filteredDrivers.filter(d => d.unsettledCash > 0).length === 0 ? (
                             <tr>
                               <td colSpan={5} className="p-12 text-center text-gray-400 font-black">
                                 لا توجد مديونيات معلقة حالياً على أي مندوب
                               </td>
                             </tr>
                           ) : (
                             filteredDrivers.filter(d => d.unsettledCash > 0).map((driver) => (
                               <tr key={driver.id} className="hover:bg-gray-50/50 transition-all">
                                 <td className="p-6">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#C5A021] flex items-center justify-center text-xs font-black">
                                         {driver.name[0]}
                                       </div>
                                       <span className="text-xs font-black text-[#0F172A]">{driver.name}</span>
                                    </div>
                                 </td>
                                 <td className="p-6 text-xs text-[#0F172A] font-black">{driver.unsettledCash.toLocaleString()} SDG</td>
                                 <td className="p-6 text-xs text-gray-400 font-bold">{driver.balance.toLocaleString()} SDG</td>
                                 <td className="p-6 text-xs text-gray-400 font-bold">{driver.phone}</td>
                                 <td className="p-6 text-center">
                                    <button 
                                      onClick={() => handleOpenReconcile(driver)}
                                      className="px-4 py-2 bg-[#0F172A] text-white rounded-xl text-[10px] font-black hover:bg-[#C5A021] transition-all shadow-md"
                                    >
                                      تأكيد استلام الكاش
                                    </button>
                                 </td>
                               </tr>
                             ))
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* Historical Settlements Log Table */}
               <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden">
                  <div className="p-8 border-b border-gray-50">
                     <h3 className="text-lg text-[#0F172A] font-black">سجل التسويات والتحصيلات التاريخي</h3>
                     <p className="text-xs text-gray-400 font-bold mt-1">أرشيف محاضر تصفية العهد النقدية والتحصيلات المعتمدة</p>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-right text-xs">
                        <thead>
                           <tr className="bg-gray-50/50">
                              <th className="p-6 text-[10px] text-gray-400 font-black">رقم التسوية</th>
                              <th className="p-6 text-[10px] text-gray-400 font-black">المندوب</th>
                              <th className="p-6 text-[10px] text-gray-400 font-black">المبلغ المفترض</th>
                              <th className="p-6 text-[10px] text-gray-400 font-black">المبلغ المستلم فعلياً</th>
                              <th className="p-6 text-[10px] text-gray-400 font-black">الفرق</th>
                              <th className="p-6 text-[10px] text-gray-400 font-black">تاريخ وتوقيت المحضر</th>
                              <th className="p-6 text-[10px] text-gray-400 font-black">ملاحظات</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-bold">
                           {history.length === 0 ? (
                             <tr>
                               <td colSpan={7} className="p-12 text-center text-gray-400 font-black">
                                 لا توجد محاضر تسوية مسجلة في الأرشيف
                               </td>
                             </tr>
                           ) : (
                             history.map((log) => {
                               const driver = drivers.find(d => d.id === log.driverId);
                               return (
                                 <tr key={log.id} className="hover:bg-gray-50/50 transition-all text-gray-500">
                                   <td className="p-6 font-black text-[#C5A021]">#{log.id.slice(-6).toUpperCase()}</td>
                                   <td className="p-6 text-slate-800 font-black">{driver?.name || "مندوب غير معرف"}</td>
                                   <td className="p-6">{log.totalCash.toLocaleString()} SDG</td>
                                   <td className="p-6 text-slate-800 font-black">{log.actualCash.toLocaleString()} SDG</td>
                                   <td className="p-6">
                                     <span className={cn(
                                       "px-2 py-0.5 rounded-full text-[9px] font-black",
                                       log.difference === 0 
                                         ? "bg-green-50 text-green-600" 
                                         : "bg-red-50 text-red-600"
                                     )}>
                                        {log.difference === 0 ? "طبيعي" : `${log.difference} ج.س`}
                                     </span>
                                   </td>
                                   <td className="p-6 text-xs text-gray-400">
                                     {new Date(log.createdAt).toLocaleDateString("ar-EG")} {new Date(log.createdAt).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}
                                   </td>
                                   <td className="p-6 text-[10px] truncate max-w-xs">{log.notes || "—"}</td>
                                 </tr>
                               );
                             })
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          )}

          {activeSubTab === "branches" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {branches.length === 0 ? (
                   <div className="col-span-full bg-white p-12 text-center text-gray-400 border border-gray-100 rounded-[3rem] shadow-xl font-black">
                     لم يتم تسجيل فروع للمستودعات بعد.
                   </div>
                 ) : (
                   branches.map((branch) => (
                     <div key={branch.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl group hover:scale-[1.02] transition-all relative overflow-hidden">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-[#0F172A] text-white flex items-center justify-center mb-6 shadow-xl group-hover:rotate-6 transition-transform">
                           <Building2 size={32} />
                        </div>
                        <h4 className="text-lg text-[#0F172A] mb-2 font-black">{branch.name}</h4>
                        <p className="text-xs text-gray-400 mb-6 font-bold">{branch.location}</p>
                        
                        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                           <span className={cn(
                             "px-2.5 py-0.5 rounded-full text-[9px] font-black",
                             branch.isActive ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"
                           )}>
                              {branch.isActive ? "نشط ومستمر" : "معطل"}
                           </span>
                           {branch.phone && (
                             <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                               <Phone size={10} />
                               {branch.phone}
                             </p>
                           )}
                        </div>
                     </div>
                   ))
                 )}
                 
                 <button 
                   onClick={() => setAddBranchModalOpen(true)}
                   className="bg-gray-50 p-8 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 hover:bg-white hover:border-[#C5A021] transition-all group min-h-[220px]"
                 >
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-300 group-hover:text-[#C5A021] transition-colors shadow-sm">
                       <Plus size={24} />
                    </div>
                    <p className="text-xs text-gray-400 font-black">إضافة فرع أو مستودع جديد</p>
                 </button>
              </div>
            </div>
          )}

          {activeSubTab === "dispatch" && (
            <div className="space-y-8">
              {/* Quick Assignment & Barcode Dispatch Banner */}
              <div className="bg-gradient-to-r from-[#0F172A] to-[#C5A021] rounded-[2.5rem] p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full w-fit">
                      <span className="w-2 h-2 bg-[#F29124] rounded-full animate-ping" />
                      <span className="text-[10px] font-black tracking-widest uppercase text-[#F29124]">
                        {dispatchMode === "DRIVER" ? "التوجيس اللوجستي السريع (سائق)" : "التوجيه اللوجستي السريع (فرع / مستودع)"}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black tracking-tight">توجيه الشحنات الذكي بالباركود</h3>
                    <p className="text-xs text-white/70 max-w-xl leading-relaxed">
                      اختر وضع التوجيه، ثم حدد السائق أو الفرع كهدف نشط. امسح باركود الشحنة لتسليمها فوراً أو توجيهها للفرع المحدد.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    {/* Mode Selector */}
                    <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/10 text-xs font-black">
                      <button
                        onClick={() => setDispatchMode("DRIVER")}
                        className={cn("px-4 py-2 rounded-xl transition-all", dispatchMode === "DRIVER" ? "bg-[#F29124] text-white" : "text-white/60 hover:text-white")}
                      >
                        توجيه للمناديب
                      </button>
                      <button
                        onClick={() => setDispatchMode("BRANCH")}
                        className={cn("px-4 py-2 rounded-xl transition-all", dispatchMode === "BRANCH" ? "bg-[#F29124] text-white" : "text-white/60 hover:text-white")}
                      >
                        توجيه للفروع
                      </button>
                    </div>

                    {/* Target Selector */}
                    <div className="w-full sm:w-64 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10">
                      <label className="block text-[10px] font-bold text-white/60 px-2 mb-1">
                        {dispatchMode === "DRIVER" ? "السائق النشط:" : "الفرع النشط:"}
                      </label>
                      {dispatchMode === "DRIVER" ? (
                        <select
                          value={activeDispatchDriverId}
                          onChange={(e) => setActiveDispatchDriverId(e.target.value)}
                          className="w-full bg-transparent text-white text-xs font-black px-2 py-1 outline-none [&>option]:text-slate-800"
                        >
                          <option value="">-- اختر سائق --</option>
                          {drivers.map(d => (
                            <option key={d.id} value={d.id}>🚗 {d.name}</option>
                          ))}
                        </select>
                      ) : (
                        <select
                          value={activeDispatchBranchId}
                          onChange={(e) => setActiveDispatchBranchId(e.target.value)}
                          className="w-full bg-transparent text-white text-xs font-black px-2 py-1 outline-none [&>option]:text-slate-800"
                        >
                          <option value="">-- اختر فرع --</option>
                          {branches.map(b => (
                            <option key={b.id} value={b.id}>🏢 {b.name}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Scanner Input */}
                    <div className="w-full sm:w-72 relative">
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-rounded text-[#F29124]">qr_code_scanner</span>
                      <input
                        placeholder="امسح باركود طلب أو سائق أو فرع..."
                        value={dispatchBarcode}
                        onChange={e => setDispatchBarcode(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleDispatchBarcodeScan(dispatchBarcode.trim());
                            setDispatchBarcode("");
                          }
                        }}
                        className="w-full bg-white text-slate-800 pr-12 pl-4 py-4 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-[#F29124]/30 shadow-lg placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Logistics Shipments Table */}
              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-[#0F172A]">شحنات اللوجستيات النشطة</h3>
                    <p className="text-xs text-gray-400 mt-1">قائمة بجميع الطلبيات قيد النقل، التوزيع، أو بانتظار استلام المندوب.</p>
                  </div>
                  <div className="flex gap-4">
                    <span className="px-4 py-2 rounded-2xl bg-orange-50 text-orange-600 text-xs font-black">
                      بانتظار الاستلام: {orders?.filter(o => o.status === "PENDING_PICKUP").length || 0}
                    </span>
                    <span className="px-4 py-2 rounded-2xl bg-purple-50 text-purple-600 text-xs font-black">
                      في الفرع: {orders?.filter(o => o.status === "AT_BRANCH").length || 0}
                    </span>
                    <span className="px-4 py-2 rounded-2xl bg-blue-50 text-blue-600 text-xs font-black">
                      قيد التوصيل: {orders?.filter(o => o.status === "SHIPPED").length || 0}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-right">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-black text-gray-400">
                        <th className="p-6">رقم الشحنة</th>
                        <th className="p-6">العميل والمدينة</th>
                        <th className="p-6">الحالة الحالية</th>
                        <th className="p-6">المندوب الحالي</th>
                        <th className="p-6">الفرع الحالي</th>
                        <th className="p-6">تحديث التوجيه</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(orders || []).filter(o => ["PENDING_PICKUP", "AT_BRANCH", "SHIPPED"].includes(o.status)).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-gray-400 font-bold">لا توجد شحنات نشطة حالياً</td>
                        </tr>
                      ) : (
                        (orders || []).filter(o => ["PENDING_PICKUP", "AT_BRANCH", "SHIPPED"].includes(o.status)).map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50/50 transition-all text-xs font-black">
                            <td className="p-6">
                              <span className="text-slate-800">#{o.id.slice(-8).toUpperCase()}</span>
                              {o.trackingNumber && (
                                <div className="text-[10px] text-gray-400 mt-1 font-mono">{o.trackingNumber}</div>
                              )}
                            </td>
                            <td className="p-6">
                              <div>{o.customerName || o.customer?.name || "عميل"}</div>
                              <div className="text-[10px] text-gray-400 mt-1">{o.city} - {o.district}</div>
                            </td>
                            <td className="p-6">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px]",
                                o.status === "PENDING_PICKUP" && "bg-orange-50 text-orange-600",
                                o.status === "AT_BRANCH" && "bg-purple-50 text-purple-600",
                                o.status === "SHIPPED" && "bg-blue-50 text-blue-600"
                              )}>
                                {ORDER_STATUSES[o.status]?.label || o.status}
                              </span>
                            </td>
                            <td className="p-6 text-gray-500">
                              {o.driver?.name ? `🚗 ${o.driver.name}` : "—"}
                            </td>
                            <td className="p-6 text-gray-500">
                              {branches.find(b => b.id === o.branchId)?.name ? `🏢 ${branches.find(b => b.id === o.branchId)?.name}` : "—"}
                            </td>
                            <td className="p-6">
                              <div className="flex gap-2">
                                <select
                                  onChange={async (e) => {
                                    const val = e.target.value;
                                    if (!val) return;
                                    if (val.startsWith("drv_")) {
                                      await handleRouteOrder(o.id, "DRIVER", val.replace("drv_", ""));
                                    } else if (val.startsWith("br_")) {
                                      await handleRouteOrder(o.id, "BRANCH", val.replace("br_", ""));
                                    }
                                  }}
                                  className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 outline-none text-[10px]"
                                >
                                  <option value="">إسناد إلى...</option>
                                  <optgroup label="المناديب">
                                    {drivers.map(d => (
                                      <option key={d.id} value={`drv_${d.id}`}>{d.name}</option>
                                    ))}
                                  </optgroup>
                                  <optgroup label="الفروع">
                                    {branches.map(b => (
                                      <option key={b.id} value={`br_${b.id}`}>{b.name}</option>
                                    ))}
                                  </optgroup>
                                </select>
                                {(o.driverId || o.branchId) && (
                                  <button
                                    onClick={() => handleRouteOrder(o.id, "CLEAR", "")}
                                    className="p-1 rounded-lg text-red-500 hover:bg-red-50"
                                    title="إلغاء التعيين"
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Driver Reconciliation Modal */}
      <AnimatePresence>
        {reconcileModalOpen && selectedDriver && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReconcileModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col z-10 border border-slate-100 overflow-hidden font-black"
            >
              <div className="p-6 bg-[#0F172A] text-white flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black">تصفية حساب المندوب: {selectedDriver.name}</h3>
                  <p className="text-white/60 text-[10px] font-bold mt-1">تأكيد استلام المبالغ النقدية وتصفية الشحنات</p>
                </div>
                <button
                  onClick={() => setReconcileModalOpen(false)}
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[500px]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] text-gray-400">العهد النقدية المسجلة (COD)</p>
                    <p className="text-xl text-[#0F172A] mt-1">{selectedDriver.unsettledCash.toLocaleString()} SDG</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] text-gray-400">رصيد محفظة المندوب الإجمالي</p>
                    <p className="text-xl text-gray-500 mt-1">{selectedDriver.balance.toLocaleString()} SDG</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400">المبلغ المستلم فعلياً (ج.س)</label>
                    <input
                      type="number"
                      value={actualCashInput}
                      onChange={(e) => setActualCashInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-800 outline-none focus:border-[#C5A021]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400">ملاحظات المحضر</label>
                    <input
                      type="text"
                      placeholder="مثال: تم الاستلام بالكامل بدون فوارق"
                      value={reconcileNotes}
                      onChange={(e) => setReconcileNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-800 outline-none focus:border-[#C5A021]"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] text-slate-400 border-b pb-2">الشحنات المشمولة في التسوية</p>
                  {loadingOrders ? (
                    <div className="py-8 flex justify-center items-center">
                      <Loader2 className="animate-spin text-[#C5A021]" />
                    </div>
                  ) : driverOrders.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">لا توجد تفاصيل شحنات حالية</p>
                  ) : (
                    <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                      <table className="w-full text-right text-[11px] font-bold">
                        <thead className="bg-slate-50 text-slate-400">
                          <tr>
                            <th className="p-3">رمز الطلب</th>
                            <th className="p-3">تاريخ الطلب</th>
                            <th className="p-3">حالة الطلب</th>
                            <th className="p-3">مبلغ COD</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-600">
                          {driverOrders.map(o => (
                            <tr key={o.id}>
                              <td className="p-3 font-black text-[#C5A021]">#{o.id.slice(-6).toUpperCase()}</td>
                              <td className="p-3 text-slate-400 font-bold">{new Date(o.createdAt).toLocaleDateString("ar-EG")}</td>
                              <td className="p-3"><span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[9px]">{o.status}</span></td>
                              <td className="p-3 text-slate-900 font-black">{o.totalAmount.toLocaleString()} SDG</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t bg-slate-50 flex items-center justify-end gap-3 shrink-0">
                <button
                  onClick={() => setReconcileModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleConfirmReconcile}
                  disabled={submittingReconcile || loadingOrders}
                  className="px-6 py-2.5 bg-[#0F172A] text-white hover:bg-[#C5A021] rounded-xl text-xs flex items-center gap-2"
                >
                  {submittingReconcile && <Loader2 size={12} className="animate-spin" />}
                  تأكيد واستلام النقدية
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Reconciliation Modal */}
      <AnimatePresence>
        {bulkReconcileModalOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setBulkReconcileModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-2xl max-w-md w-full space-y-6 z-10 border border-slate-100 text-right font-black"
            >
              <div className="flex items-center gap-2 text-orange-500">
                <AlertCircle size={24} />
                <h4 className="font-black text-[#0F172A] text-base">تسوية جماعية لكافة حسابات المناديب</h4>
              </div>
              <p className="text-xs text-gray-500 font-bold leading-relaxed">
                هل أنت متأكد من تسوية وتصفية كافة الحسابات النقدية المعلقة لجميع المناديب في النظام؟
              </p>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-black">
                <span className="text-gray-400">إجمالي المديونية التي ستُصفى:</span>
                <span className="text-[#C5A021] text-base">{totalUnsettledCash.toLocaleString()} SDG</span>
              </div>

              <div className="text-[10px] text-rose-500 font-black leading-relaxed bg-rose-50 p-4 rounded-xl">
                ⚠️ تنبيه: سيتم تحديث حالة كافة شحنات الدفع عند الاستلام (COD) المعلقة لديهم وتصفية أرصدة عهدهم النقدية بالكامل وتنزيلها من حساباتهم.
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={() => setBulkReconcileModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleConfirmBulkReconcile}
                  disabled={submittingBulk || totalUnsettledCash === 0}
                  className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-black shadow-lg shadow-orange-500/15 flex items-center gap-2"
                >
                  {submittingBulk && <Loader2 size={12} className="animate-spin" />}
                  تأكيد التسوية الجماعية
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Branch Modal */}
      <AnimatePresence>
        {addBranchModalOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddBranchModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-2xl max-w-md w-full space-y-6 z-10 border border-slate-100 text-right font-black"
            >
              <div className="flex items-center gap-2 text-[#0F172A]">
                <Building2 size={24} className="text-[#C5A021]" />
                <h4 className="font-black text-[#0F172A] text-base">إضافة فرع / مستودع جديد</h4>
              </div>
              
              <form onSubmit={handleAddBranch} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400">اسم الفرع / المستودع</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: فرع عطبرة"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-800 outline-none focus:border-[#C5A021]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400">الموقع الجغرافي / العنوان</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: وسط السوق، بالقرب من مبنى التأمين"
                    value={newBranchLocation}
                    onChange={(e) => setNewBranchLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-800 outline-none focus:border-[#C5A021]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400">رقم الهاتف (اختياري)</label>
                  <input
                    type="text"
                    placeholder="مثال: 0912345678"
                    value={newBranchPhone}
                    onChange={(e) => setNewBranchPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-800 outline-none focus:border-[#C5A021]"
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs pt-4">
                  <button
                    type="button"
                    onClick={() => setAddBranchModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submittingBranch}
                    className="px-5 py-2.5 bg-[#0F172A] text-white hover:bg-[#C5A021] rounded-xl font-black flex items-center gap-2"
                  >
                    {submittingBranch && <Loader2 size={12} className="animate-spin" />}
                    حفظ وإضافة الفرع
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    </div>
  );
}
