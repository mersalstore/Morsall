"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { paymentDisplay } from "@/lib/payment";

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
  showToast?: (message: string, type?: "info" | "error" | "success") => void;
  onPrint?: (order: any) => void;
  onPrintBulk?: (orders: any[]) => void;
  onEdit?: (order: any) => void;

  logisticsDateRange?: string;
  setLogisticsDateRange?: (val: string) => void;
  logisticsCustomFrom?: string;
  setLogisticsCustomFrom?: (val: string) => void;
  logisticsCustomTo?: string;
  setLogisticsCustomTo?: (val: string) => void;
  onCustomDateApply?: () => void;
}

export default function LogisticsTab({
  orders, users, vendors, fetchData: parentFetchData, ORDER_STATUSES, classes, showToast, onPrint, onPrintBulk, onEdit,
  logisticsDateRange, setLogisticsDateRange, logisticsCustomFrom, setLogisticsCustomFrom,
  logisticsCustomTo, setLogisticsCustomTo, onCustomDateApply
}: LogisticsTabProps = {}) {
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

  // Bulk selection + assignment of active shipments
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<Set<string>>(new Set());
  const [bulkAssigning, setBulkAssigning] = useState(false);
  const [dispatchStatusFilter, setDispatchStatusFilter] = useState<string>("ACTIVE");
  // V2 §3: In-Header dynamic filters (city, courier, branch, sender, payment)
  const [colFilters, setColFilters] = useState<{ city: string; driver: string; branch: string; sender: string; payment: string }>({
    city: "", driver: "", branch: "", sender: "", payment: "",
  });

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

  // Tracking timeline states
  const [trackingTimelineOrder, setTrackingTimelineOrder] = useState<any | null>(null);
  const [trackingTimelineOpen, setTrackingTimelineOpen] = useState(false);

  const handleOpenTrackingTimeline = (order: any) => {
    setTrackingTimelineOrder(order);
    setTrackingTimelineOpen(true);
  };

  const parseNotesTimeline = (notesStr: string) => {
    if (!notesStr) return [];
    const lines = notesStr.split("\n").map(l => l.trim()).filter(Boolean);
    const parsed = [];
    for (const line of lines) {
      const match = line.match(/^\[([^\]\-]+)\s*-\s*([^\]]+)\]:\s*(.*)$/);
      if (match) {
        parsed.push({
          title: match[1].trim(),
          timestamp: match[2].trim(),
          message: match[3].trim()
        });
      } else {
        parsed.push({
          title: "ملاحظة / تحديث",
          timestamp: "",
          message: line
        });
      }
    }
    return parsed;
  };

  const renderHeaderFilter = (key: keyof typeof colFilters, options: string[]) => {
    return (
      <select
        value={colFilters[key] || ""}
        onChange={(e) => {
          setColFilters((p) => ({ ...p, [key]: e.target.value }));
          setSelectedShipmentIds(new Set());
        }}
        className={cn(
          "mr-1 bg-transparent border-0 font-bold text-[10px] text-gray-400 hover:text-slate-800 cursor-pointer outline-none max-w-[80px]",
          colFilters[key] && "text-[#C5A021]"
        )}
      >
        <option value="">(الكل)</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  };
  
  const [bulkReconcileModalOpen, setBulkReconcileModalOpen] = useState(false);
  const [submittingBulk, setSubmittingBulk] = useState(false);
  
  const [addBranchModalOpen, setAddBranchModalOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchLocation, setNewBranchLocation] = useState("");
  const [newBranchPhone, setNewBranchPhone] = useState("");
  const [submittingBranch, setSubmittingBranch] = useState(false);

  // Leaflet Live Map states and refs
  const [employees, setEmployees] = useState<any[]>([]);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Custom assignment modal states
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTargetOrderIds, setAssignTargetOrderIds] = useState<string[]>([]);
  const [assignSearchQuery, setAssignSearchQuery] = useState("");
  const [assignActiveTab, setAssignActiveTab] = useState<"DRIVER" | "BRANCH">("DRIVER");

  // V2 §2.1/§2.2: استلام الرجيع من المندوب (تحديد الفرع + احتساب محاولة)
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnOrder, setReturnOrder] = useState<any | null>(null);
  const [returnBranchId, setReturnBranchId] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    fetchData();
  }, [orders]);

  // Background polling for logistics data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup Leaflet map instance when LogisticsTab unmounts
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {}
        mapRef.current = null;
      }
    };
  }, []);

  // Inject Leaflet CSS & JS dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  // Leaflet map initialization and updates
  useEffect(() => {
    if (!leafletLoaded || typeof window === "undefined" || !(window as any).L) return;
    const L = (window as any).L;

    if (activeSubTab !== "fleet") {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {}
        mapRef.current = null;
      }
      return;
    }

    const mapContainer = document.getElementById("logistics-leaflet-map");
    if (!mapContainer) return;

    if (!mapRef.current) {
      const map = L.map("logistics-leaflet-map", {
        zoomControl: true,
        attributionControl: false
      }).setView([15.5007, 32.5599], 12);

      // Render Google Maps styled Road Map tiles via Leaflet
      L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"]
      }).addTo(map);

      mapRef.current = map;
    }

    const mapInstance = mapRef.current;

    // Clear old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Helper for stable offsets based on ID (deterministic)
    const getStableCoords = (id: string, latBase = 15.5007, lngBase = 32.5599) => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
      }
      const latOffset = ((hash % 100) / 1000) * 0.08 - 0.04;
      const lngOffset = (((hash >> 8) % 100) / 1000) * 0.08 - 0.04;
      return [latBase + latOffset, lngBase + lngOffset];
    };

    // Add Driver Markers (Online/Offline)
    drivers.forEach(driver => {
      const isOnline = driver.isOnline;
      const coords = (driver as any).lat && (driver as any).lng 
        ? [(driver as any).lat, (driver as any).lng]
        : getStableCoords(driver.id);

      const colorClass = isOnline ? "bg-green-500 shadow-[0_0_15px_#22c55e]" : "bg-gray-500 shadow-[0_0_10px_rgba(0,0,0,0.5)]";
      const markerHtml = `
        <div class="relative group">
          <div class="w-9 h-9 rounded-2xl flex items-center justify-center text-white transition-all duration-300 scale-100 hover:scale-110 ${colorClass}">
            🚗
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-leaflet-icon",
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const popupHtml = `
        <div class="text-right font-black text-xs space-y-1" dir="rtl">
          <p class="font-extrabold text-[#0F172A]">${driver.name}</p>
          <p class="text-gray-500 text-[10px]">${driver.vehicleType} • ${driver.phone}</p>
          <p class="text-[9px] ${isOnline ? "text-green-500" : "text-gray-400"}">${isOnline ? "متصل الآن" : "غير متصل"}</p>
        </div>
      `;

      const marker = L.marker(coords, { icon: customIcon })
        .addTo(mapInstance)
        .bindPopup(popupHtml);

      markersRef.current.push(marker);
    });

    // Add Employee Markers (Workers)
    employees.forEach(emp => {
      const isActive = emp.isActive;
      if (!isActive) return;

      const coords = getStableCoords(emp.id, 15.5100, 32.5400); // slight shift

      const colorClass = "bg-blue-600 shadow-[0_0_12px_#2563eb]";
      const markerHtml = `
        <div class="relative group">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-300 scale-100 hover:scale-110 ${colorClass}">
            👷
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-leaflet-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const roleLabel = emp.role === "SHIPPING" ? "مشرف شحن" : emp.role === "PACKING" ? "مسؤول تجهيز" : "موظف";
      const popupHtml = `
        <div class="text-right font-black text-xs space-y-1" dir="rtl">
          <p class="font-extrabold text-blue-600">${emp.name}</p>
          <p class="text-gray-500 text-[10px]">${roleLabel} • ${emp.email}</p>
          <p class="text-[9px] text-green-500">نشط في المقر</p>
        </div>
      `;

      const marker = L.marker(coords, { icon: customIcon })
        .addTo(mapInstance)
        .bindPopup(popupHtml);

      markersRef.current.push(marker);
    });

  }, [leafletLoaded, activeSubTab, drivers, employees]);

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

      // Fetch employees/workers
      try {
        const empRes = await fetch("/api/admin/employees");
        if (empRes.ok) {
          setEmployees(await empRes.json());
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
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

  // V2 §2.3: طباعة التقرير المالي المباشر لعهدة المندوب (A4 / رول حراري)
  const handlePrintSettlement = (printFormat: "a4" | "thermal" = "a4") => {
    if (!selectedDriver) return;
    const fmt = (n: number) => (n || 0).toLocaleString("ar-EG");
    const count = driverOrders.length;
    const grossCash = driverOrders.reduce((s, o: any) => s + (o.totalAmount || 0), 0);
    const deliveryFees = driverOrders.reduce((s, o: any) => s + (o.shippingCost || 0), 0);
    const netValue = grossCash - deliveryFees;
    const now = new Date().toLocaleString("ar-EG");
    const rows = driverOrders
      .map(
        (o: any, i: number) => `
        <tr>
          <td>${i + 1}</td>
          <td>#${o.id.slice(-6).toUpperCase()}</td>
          <td>${new Date(o.createdAt).toLocaleDateString("ar-EG")}</td>
          <td>${o.status}</td>
          <td style="text-align:left">${fmt(o.shippingCost || 0)}</td>
          <td style="text-align:left">${fmt(o.totalAmount || 0)}</td>
        </tr>`
      )
      .join("");

    // Thermal layout: compact 80mm roll (no cards, smaller fonts, page = 80mm auto)
    const thermalStyle = `
      * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; margin: 0; padding: 4px; color: #000; width: 80mm; }
      h1 { font-size: 12px; margin: 0; text-align: center; }
      .sub { font-size: 9px; color: #555; text-align: center; margin-bottom: 4px; }
      .driver { font-size: 10px; font-weight: 800; text-align: center; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 3px 0; margin: 4px 0; }
      .stats { font-size: 10px; margin-bottom: 4px; }
      .stats div { display: flex; justify-content: space-between; padding: 1px 0; }
      table { width: 100%; border-collapse: collapse; font-size: 8px; }
      th, td { border: 0.5px solid #888; padding: 2px 3px; text-align: right; }
      thead th { background: #000; color: #fff; }
      tfoot td { font-weight: 800; }
      .sign { margin-top: 10px; display: flex; justify-content: space-between; font-size: 9px; }
      .sign div { width: 45%; border-top: 1px dashed #888; padding-top: 3px; text-align: center; }
      @page { size: 80mm auto; margin: 2mm; }
    `;

    // A4 layout: full-page, cards summary, full table
    const a4Style = `
      * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; margin: 0; padding: 16px; color: #0F172A; }
      h1 { font-size: 18px; margin: 0; }
      .muted { color: #64748b; font-size: 11px; }
      .head { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #0F172A; padding-bottom:10px; margin-bottom:14px; }
      .cards { display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap; }
      .card { flex:1; min-width:110px; border:1px solid #e2e8f0; border-radius:10px; padding:10px; }
      .card .label { font-size:10px; color:#64748b; }
      .card .value { font-size:16px; font-weight:800; margin-top:4px; }
      table { width:100%; border-collapse:collapse; font-size:11px; }
      th, td { border:1px solid #e2e8f0; padding:6px 8px; text-align:right; }
      thead th { background:#0F172A; color:#fff; }
      tfoot td { font-weight:800; background:#f8fafc; }
      .sign { margin-top:28px; display:flex; justify-content:space-between; font-size:12px; }
      .sign div { width:45%; border-top:1px dashed #94a3b8; padding-top:6px; text-align:center; color:#475569; }
      @page { size: A4; margin: 12mm; }
    `;

    const isThermal = printFormat === "thermal";
    const bodyContent = isThermal ? `
      <h1>مخالصة مالية - مرسال</h1>
      <div class="sub">${now}</div>
      <div class="driver">المندوب: ${selectedDriver.name} | ${selectedDriver.phone || ""}</div>
      <div class="stats">
        <div><span>عدد الشحنات:</span><span>${count}</span></div>
        <div><span>رسوم التوصيل:</span><span>${fmt(deliveryFees)} ج.س</span></div>
        <div><span>إجمالي الكاش:</span><span>${fmt(grossCash)} ج.س</span></div>
        <div><strong><span>صافي المطلوب:</span><span>${fmt(netValue)} ج.س</span></strong></div>
      </div>
      <table>
        <thead><tr><th>#</th><th>الطلب</th><th>التاريخ</th><th>التوصيل</th><th>القيمة</th></tr></thead>
        <tbody>${driverOrders.map((o: any, i: number) => `<tr><td>${i+1}</td><td>#${o.id.slice(-6).toUpperCase()}</td><td>${new Date(o.createdAt).toLocaleDateString("ar-EG")}</td><td>${fmt(o.shippingCost || 0)}</td><td>${fmt(o.totalAmount || 0)}</td></tr>`).join("") || `<tr><td colspan="5" style="text-align:center">لا توجد</td></tr>`}</tbody>
        <tfoot><tr><td colspan="3">الإجمالي</td><td>${fmt(deliveryFees)}</td><td>${fmt(grossCash)}</td></tr></tfoot>
      </table>
      <div class="sign"><div>توقيع المندوب</div><div>توقيع المحاسب</div></div>
    ` : `
      <div class="head">
        <div><h1>تقرير المخالصة المالية اليومية</h1><div class="muted">مرسال للخدمات اللوجستية</div></div>
        <div style="text-align:left"><div><strong>المندوب:</strong> ${selectedDriver.name}</div><div class="muted">${selectedDriver.phone || ""}</div><div class="muted">${now}</div></div>
      </div>
      <div class="cards">
        <div class="card"><div class="label">عدد الشحنات الموصلة</div><div class="value">${count}</div></div>
        <div class="card"><div class="label">صافي قيمة الشحنات</div><div class="value">${fmt(netValue)} ج.س</div></div>
        <div class="card"><div class="label">رسوم التوصيل المحتسبة</div><div class="value">${fmt(deliveryFees)} ج.س</div></div>
        <div class="card"><div class="label">إجمالي الكاش المحصّل</div><div class="value">${fmt(grossCash)} ج.س</div></div>
      </div>
      <table>
        <thead><tr><th>#</th><th>رقم الطلب</th><th>التاريخ</th><th>الحالة</th><th>رسوم التوصيل</th><th>القيمة المحصّلة</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="6" style="text-align:center;color:#94a3b8">لا توجد شحنات</td></tr>`}</tbody>
        <tfoot><tr><td colspan="4">الإجمالي</td><td style="text-align:left">${fmt(deliveryFees)}</td><td style="text-align:left">${fmt(grossCash)}</td></tr></tfoot>
      </table>
      <div class="sign"><div>توقيع المندوب</div><div>توقيع المحاسب</div></div>
    `;

    const html = `
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8" />
          <title>تقرير عهدة المندوب - ${selectedDriver.name}</title>
          <style>${isThermal ? thermalStyle : a4Style}</style>
        </head>
        <body>
          ${bodyContent}
          <script>
            window.onload = function(){ setTimeout(function(){ window.print(); window.close(); }, 400); };
          <\/script>
        </body>
      </html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
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
      } else {
        alert("فشل تحديث توجيه الشحنة");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء التحديث");
    }
  };

  // V2 §2.1/§2.2: تأكيد استلام الرجيع — تحويل العهدة للفرع واحتساب محاولة توصيل
  const openReturnModal = (order: any) => {
    setReturnOrder(order);
    setReturnBranchId(order.branchId || branches[0]?.id || "");
    setReturnReason("");
    setReturnModalOpen(true);
  };

  const handleReceiveReturn = async () => {
    if (!returnOrder) return;
    if (!returnBranchId) {
      alert("يرجى تحديد الفرع (المستودع المستهدف) لاستلام الرجيع");
      return;
    }
    setSubmittingReturn(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: returnOrder.id,
          receiveReturn: true,
          branchId: returnBranchId,
          failureReason: returnReason || undefined,
        }),
      });
      if (res.ok) {
        const branchName = branches.find((b) => b.id === returnBranchId)?.name || "الفرع";
        setReturnModalOpen(false);
        setReturnOrder(null);
        if (parentFetchData) await parentFetchData();
        await fetchData();
        showToast?.(`تم استلام الرجيع وتحويل العهدة إلى ${branchName}`, "success");
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "فشل استلام الرجيع");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء استلام الرجيع");
    } finally {
      setSubmittingReturn(false);
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

  // Shipments shown in the dispatch table, filtered by the selected status view.
  // "ACTIVE" = in transit / at branch / awaiting pickup; "ALL" = every shipment
  // (including imported & cancelled); otherwise filter by a specific status.
  const ACTIVE_DISPATCH_STATUSES = ["PENDING_PICKUP", "AT_BRANCH", "SHIPPED"];
  const activeShipments = (orders || []).filter((o: any) => {
    if (dispatchStatusFilter === "ALL") return true;
    if (dispatchStatusFilter === "ACTIVE") return ACTIVE_DISPATCH_STATUSES.includes(o.status);
    return o.status === dispatchStatusFilter;
  });

  // V2 §3: sender name resolver (المرسل/المورد) consistent with the table cell
  const senderOf = (o: any) => o.items?.[0]?.vendor?.storeName || o.createdBy || "";
  // Distinct, sorted option lists for the In-Header dropdown filters
  const uniqSorted = (vals: any[]) =>
    Array.from(new Set(vals.map((v) => String(v ?? "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "ar"));
  const cityOptions = uniqSorted(activeShipments.map((o: any) => o.city));
  const senderOptions = uniqSorted(activeShipments.map(senderOf));
  const driverOptions = uniqSorted(activeShipments.map((o: any) => o.driver?.name));
  const branchOptions = uniqSorted(
    activeShipments.map((o: any) => branches.find((b) => b.id === o.branchId)?.name)
  );
  const paymentOptions = uniqSorted(activeShipments.map((o: any) => o.paymentMethod));

  // Apply the In-Header filters on top of the status view
  const displayedShipments = activeShipments.filter((o: any) => {
    if (colFilters.city && String(o.city ?? "").trim() !== colFilters.city) return false;
    if (colFilters.sender && senderOf(o) !== colFilters.sender) return false;
    if (colFilters.driver && (o.driver?.name ?? "") !== colFilters.driver) return false;
    if (colFilters.branch && (branches.find((b) => b.id === o.branchId)?.name ?? "") !== colFilters.branch) return false;
    if (colFilters.payment && String(o.paymentMethod ?? "").trim() !== colFilters.payment) return false;
    return true;
  });
  const activeColFilterCount = Object.values(colFilters).filter(Boolean).length;

  const allActiveSelected =
    displayedShipments.length > 0 && displayedShipments.every((o: any) => selectedShipmentIds.has(o.id));

  const toggleSelectShipment = (id: string) => {
    setSelectedShipmentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllShipments = () => {
    setSelectedShipmentIds(allActiveSelected ? new Set() : new Set(displayedShipments.map((o: any) => o.id)));
  };

  // Bulk assign all selected shipments to a driver (drv_<id>) or a branch (br_<id>)
  const handleBulkAssign = async (val: string) => {
    if (!val || selectedShipmentIds.size === 0) return;
    const isDriver = val.startsWith("drv_");
    const targetId = val.replace(/^drv_|^br_/, "");
    const count = selectedShipmentIds.size;
    setBulkAssigning(true);
    try {
      await Promise.all(
        Array.from(selectedShipmentIds).map((orderId) => {
          const payload: any = { id: orderId };
          if (isDriver) {
            payload.driverId = targetId;
            payload.branchId = null;
            payload.status = "SHIPPED";
          } else {
            payload.branchId = targetId;
            payload.driverId = null;
            payload.status = "AT_BRANCH";
          }
          return fetch("/api/admin/orders", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        })
      );
      if (parentFetchData) await parentFetchData();
      await fetchData();
      setSelectedShipmentIds(new Set());
      alert(`تم إسناد ${count} شحنة بنجاح`);
    } catch (err) {
      console.error(err);
      alert("فشل الإسناد الجماعي لبعض الشحنات");
    } finally {
      setBulkAssigning(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 font-black" dir="rtl">
      {/* Sub-Navigation */}
      <div className="flex flex-wrap gap-2 md:gap-4 bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border border-white w-full md:w-fit mx-auto shadow-xl justify-center">
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
               "flex items-center justify-center gap-2 px-3 py-2.5 md:px-8 md:py-3 rounded-xl md:rounded-2xl transition-all text-xs flex-1 md:flex-initial whitespace-nowrap",
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

      {/* Date Filter */}
      <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.02)] flex flex-wrap gap-3 items-center max-w-4xl mx-auto">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">الفترة:</span>
        {[
          { key: "today", label: "اليوم" },
          { key: "week",  label: "آخر 7 أيام" },
          { key: "month", label: "آخر 30 يوم" },
          { key: "all",   label: "الكل" },
          { key: "custom", label: "مخصص" },
        ].map(r => (
          <button
            key={r.key}
            onClick={() => {
              if (setLogisticsDateRange) {
                setLogisticsDateRange(r.key);
                if (r.key !== "custom" && parentFetchData) {
                  setTimeout(() => parentFetchData(), 50);
                }
              }
            }}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs font-bold transition-all",
              logisticsDateRange === r.key ? "bg-[#C5A021] text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-200/50"
            )}
          >{r.label}</button>
        ))}
        {logisticsDateRange === "custom" && (
          <div className="flex items-center gap-2 mr-2">
            <input
              type="date"
              value={logisticsCustomFrom || ""}
              onChange={e => setLogisticsCustomFrom && setLogisticsCustomFrom(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
            />
            <span className="text-slate-400">←</span>
            <input
              type="date"
              value={logisticsCustomTo || ""}
              onChange={e => setLogisticsCustomTo && setLogisticsCustomTo(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
            />
            <button
              onClick={() => onCustomDateApply && onCustomDateApply()}
              className="bg-[#C5A021] text-white px-4 py-2 rounded-xl text-xs font-bold"
            >
              تطبيق
            </button>
          </div>
        )}
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
                <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] shadow-2xl relative overflow-hidden min-h-[500px]">
                    {/* Leaflet Map Div */}
                    <div id="logistics-leaflet-map" className="absolute inset-0 w-full h-full z-0"></div>
                    
                    {/* Layered UI Headers */}
                    <div className="absolute top-4 right-4 left-4 z-10 flex flex-col sm:flex-row justify-between items-start gap-3 pointer-events-none">
                       <div className="bg-slate-950/85 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/10 shadow-2xl pointer-events-auto w-full sm:w-auto">
                          <h3 className="text-sm sm:text-lg text-white font-black">مركز القيادة اللوجستي</h3>
                          <p className="text-[#C5A021] text-[9px] uppercase tracking-[0.3em] mt-1 font-bold">Live Fleet & Staff Map</p>
                       </div>
                       <div className="bg-slate-950/85 backdrop-blur-md px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl border border-white/10 flex items-center gap-2.5 pointer-events-auto shadow-2xl w-full sm:w-auto justify-center sm:justify-start">
                          <span className={cn("w-2.5 h-2.5 rounded-full animate-pulse", drivers.some(d => d.isOnline) ? "bg-green-500" : "bg-orange-500")} />
                          <span className="text-[9px] sm:text-[10px] font-black text-white/80">
                            نشط حالياً: {drivers.filter(d => d.isOnline).length} مناديب • {employees.filter(e => e.isActive).length} موظفين
                          </span>
                       </div>
                    </div>

                    {!leafletLoaded && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-20 flex items-center justify-center text-white gap-3 font-bold text-sm">
                        <Loader2 className="animate-spin text-[#C5A021]" size={20} />
                        <span>جاري تحميل خريطة جوجل...</span>
                      </div>
                    )}
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
                <div className="p-4 md:p-8 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base md:text-lg font-black text-[#0F172A]">شحنات اللوجستيات</h3>
                    <p className="text-[11px] md:text-xs text-gray-400 mt-1">استخدم الفلتر لعرض الشحنات النشطة أو كل الشحنات (بما فيها المستوردة والملغاة).</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <select
                      value={dispatchStatusFilter}
                      onChange={(e) => { setDispatchStatusFilter(e.target.value); setSelectedShipmentIds(new Set()); }}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-black outline-none text-slate-700 w-full sm:w-auto"
                    >
                      <option value="ACTIVE">النشطة فقط</option>
                      <option value="ALL">كل الشحنات ({orders?.length || 0})</option>
                      {Object.entries(ORDER_STATUSES).map(([key, s]: any) => (
                        <option key={key} value={key}>{s.label}</option>
                      ))}
                    </select>
                    <span className="px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-orange-50 text-orange-600 text-[10px] md:text-xs font-black">
                      بانتظار الاستلام: {orders?.filter(o => o.status === "PENDING_PICKUP").length || 0}
                    </span>
                    <span className="px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-purple-50 text-purple-600 text-[10px] md:text-xs font-black">
                      في الفرع: {orders?.filter(o => o.status === "AT_BRANCH").length || 0}
                    </span>
                    <span className="px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-blue-50 text-blue-600 text-[10px] md:text-xs font-black">
                      قيد التوصيل: {orders?.filter(o => o.status === "SHIPPED").length || 0}
                    </span>
                  </div>
                </div>

                {/* V2 §3: In-Header dynamic filters (المدينة، المندوب، الفرع، المرسل، طريقة الدفع) */}
                <div className="px-8 py-4 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center gap-2.5">
                  <span className="material-symbols-rounded text-slate-400 text-base">filter_list</span>
                  {([
                    { key: "city", label: "المدينة", opts: cityOptions },
                    { key: "driver", label: "المندوب", opts: driverOptions },
                    { key: "branch", label: "الفرع", opts: branchOptions },
                    { key: "sender", label: "المرسل", opts: senderOptions },
                    { key: "payment", label: "طريقة الدفع", opts: paymentOptions },
                  ] as const).map((f) => (
                    <select
                      key={f.key}
                      value={(colFilters as any)[f.key]}
                      onChange={(e) => { setColFilters((p) => ({ ...p, [f.key]: e.target.value })); setSelectedShipmentIds(new Set()); }}
                      className={cn(
                        "bg-white border rounded-xl px-3 py-2 text-[11px] font-black outline-none transition-all",
                        (colFilters as any)[f.key] ? "border-[#C5A021] text-[#0F172A]" : "border-slate-200 text-slate-500"
                      )}
                    >
                      <option value="">{f.label}: الكل</option>
                      {f.opts.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ))}
                  {activeColFilterCount > 0 && (
                    <button
                      onClick={() => { setColFilters({ city: "", driver: "", branch: "", sender: "", payment: "" }); setSelectedShipmentIds(new Set()); }}
                      className="text-[11px] font-black text-rose-500 hover:text-rose-600 flex items-center gap-1"
                    >
                      <X size={12} /> مسح الفلاتر ({activeColFilterCount})
                    </button>
                  )}
                  <span className="mr-auto text-[11px] font-black text-slate-400">
                    عرض {displayedShipments.length} من {activeShipments.length} شحنة
                  </span>
                </div>

                {/* Bulk selection & assignment toolbar */}
                {selectedShipmentIds.size > 0 && (
                  <div className="px-8 py-4 bg-[#0F172A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-white text-xs font-black flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-[#C5A021]" />
                      تم تحديد {selectedShipmentIds.size} شحنة للإسناد الجماعي
                    </span>
                    <div className="flex items-center gap-2">
                      {onPrintBulk && (
                        <button
                          onClick={() => {
                            const selectedOrders = (orders || []).filter(o => selectedShipmentIds.has(o.id));
                            onPrintBulk(selectedOrders);
                          }}
                          className="bg-[#C5A021] text-white rounded-xl px-3 py-2 text-[11px] font-black hover:brightness-110 transition-all flex items-center gap-1.5"
                        >
                          <span className="material-symbols-rounded text-sm">print</span>
                          طباعة البوالص ({selectedShipmentIds.size})
                        </button>
                      )}
                      <button
                        disabled={bulkAssigning}
                        onClick={() => {
                          setAssignTargetOrderIds(Array.from(selectedShipmentIds));
                          setAssignActiveTab("DRIVER");
                          setAssignSearchQuery("");
                          setAssignModalOpen(true);
                        }}
                        className="bg-white text-slate-800 rounded-xl px-3 py-2 text-[11px] font-black border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1.5 disabled:opacity-60"
                      >
                        <span className="material-symbols-rounded text-sm">person_add</span>
                        إسناد المحدد إلى...
                      </button>
                      {bulkAssigning && <Loader2 size={14} className="animate-spin text-white" />}
                      <button
                        onClick={() => setSelectedShipmentIds(new Set())}
                        className="text-white/70 hover:text-white text-[11px] font-black px-2"
                      >
                        إلغاء التحديد
                      </button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-right">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black text-gray-400 whitespace-nowrap">
                        <th className="p-4 w-10">
                          <input
                            type="checkbox"
                            checked={allActiveSelected}
                            onChange={toggleSelectAllShipments}
                            className="w-4 h-4 rounded border-gray-300 accent-[#C5A021] cursor-pointer"
                          />
                        </th>
                        <th className="p-4 font-black text-[#0F172A]">باركود الشحنة</th>
                        <th className="p-4 font-black text-[#0F172A]">مصدر الطرد</th>
                        <th className="p-4 font-black text-[#0F172A]">اسم المستلم</th>
                        <th className="p-4 font-black text-[#0F172A]">هاتف المستلم</th>
                        <th className="p-4 font-black text-[#0F172A]">
                          <div className="flex items-center gap-1">المدينة {renderHeaderFilter("city", cityOptions)}</div>
                        </th>
                        <th className="p-4 font-black text-[#0F172A]">الحي</th>
                        <th className="p-4 font-black text-[#0F172A]">الشارع</th>
                        <th className="p-4 font-black text-[#0F172A]">تاريخ الانشاء</th>
                        <th className="p-4 font-black text-[#0F172A]">السعر (سعر التوصيل)</th>
                        <th className="p-4 font-black text-[#0F172A]">رسوم أخرى</th>
                        <th className="p-4 font-black text-[#0F172A]">قيمة الشحنة</th>
                        <th className="p-4 font-black text-[#0F172A]">رقم الإرسالية</th>
                        <th className="p-4 font-black text-[#0F172A]">الملاحظات</th>
                        <th className="p-4 font-black text-[#0F172A]">
                          <div className="flex items-center gap-1">طريقة الدفع {renderHeaderFilter("payment", paymentOptions)}</div>
                        </th>
                        <th className="p-4 font-black text-[#0F172A]">الحالة</th>
                        <th className="p-4 font-black text-[#0F172A]">محتوى الطرد</th>
                        <th className="p-4 font-black text-[#0F172A]">الكمية</th>
                        <th className="p-4 font-black text-[#0F172A]">
                          <div className="flex items-center gap-1">إسم المرسل {renderHeaderFilter("sender", senderOptions)}</div>
                        </th>
                        <th className="p-4 font-black text-[#0F172A]">الوزن</th>
                        <th className="p-4 font-black text-[#0F172A]">رقم ارسالية المزود</th>
                        <th className="p-4 font-black text-[#0F172A]">رقم المرجع للعميل</th>
                        <th className="p-4 font-black text-[#0F172A]">عدد محاولات التوصيل</th>
                        <th className="p-4 font-black text-[#0F172A]">نوع الشحنة</th>
                        <th className="p-4 font-black text-[#0F172A]">رسوم إضافية</th>
                        <th className="p-4 font-black text-[#0F172A]">
                          <div className="flex items-center gap-1">المندوب {renderHeaderFilter("driver", driverOptions)}</div>
                        </th>
                        <th className="p-4 font-black text-[#0F172A]">
                          <div className="flex items-center gap-1">الفرع {renderHeaderFilter("branch", branchOptions)}</div>
                        </th>
                        <th className="p-4 font-black text-[#0F172A]">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedShipments.length === 0 ? (
                        <tr>
                          <td colSpan={28} className="p-12 text-center text-gray-400 font-bold">
                            {activeShipments.length > 0 && activeColFilterCount > 0
                              ? "لا توجد شحنات مطابقة للفلاتر المحددة"
                              : "لا توجد شحنات نشطة حالياً"}
                          </td>
                        </tr>
                      ) : (
                        displayedShipments.map((o: any) => {
                          const qty = (o.items?.reduce((s: number, i: any) => s + (i.quantity || 0), 0)) || o.quantity || 0;
                          const content = o.packageContent
                            || (o.items?.map((i: any) => i.product?.title).filter(Boolean).join("، "))
                            || "—";
                          const isSelected = selectedShipmentIds.has(o.id);
                          const currentBranch = branches.find(b => b.id === o.branchId)?.name;
                          const senderName = o.items?.[0]?.vendor?.storeName || o.createdBy || "—";
                          const isNew = o.status === "PENDING_PICKUP" && !o.driverId && !o.branchId;
                          return (
                          <tr key={o.id} className={cn("hover:bg-slate-50/50 transition-all text-[11px] font-black align-top whitespace-nowrap", isSelected && "bg-[#C5A021]/5", isNew && "border-r-4 border-r-orange-400")}>

                            <td className="p-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectShipment(o.id)}
                                className="w-4 h-4 rounded border-gray-300 accent-[#C5A021] cursor-pointer"
                              />
                            </td>
                            {/* 1. باركود الشحنة */}
                            <td className="p-4 font-mono text-slate-800">
                              <div className="flex items-center gap-1.5">
                                {o.status === "PENDING_PICKUP" && !o.driverId && !o.branchId && (
                                  <span className="inline-block w-2 h-2 rounded-full bg-orange-400 animate-pulse flex-shrink-0" title="جديدة - تحتاج إسناد" />
                                )}
                                <button
                                  onClick={() => handleOpenTrackingTimeline(o)}
                                  className="font-mono text-slate-800 hover:text-[#C5A021] transition-colors text-right"
                                  title="عرض سجل الشحنة"
                                >
                                  {o.trackingNumber || `#${o.id.slice(-8).toUpperCase()}`}
                                </button>
                              </div>
                            </td>
                            {/* 2. مصدر الطرد */}
                            <td className="p-4 text-slate-700">
                              {o.source || "—"}
                            </td>
                            {/* 3. اسم المستلم */}
                            <td className="p-4 text-slate-800">
                              {o.customerName || o.customer?.name || "—"}
                            </td>
                            {/* 4. هاتف المستلم */}
                            <td className="p-4 font-mono text-slate-700" dir="ltr">
                              {o.phone || o.customer?.phone || "—"}
                            </td>
                            {/* 5. المدينة */}
                            <td className="p-4 text-slate-700">
                              {o.city || "—"}
                            </td>
                            {/* 6. الحي */}
                            <td className="p-4 text-slate-700">
                              {o.district || "—"}
                            </td>
                            {/* 7. الشارع */}
                            <td className="p-4 text-slate-700 max-w-[200px] truncate" title={o.street}>
                              {o.street || "—"}
                            </td>
                            {/* 8. تاريخ الانشاء */}
                            <td className="p-4 text-gray-500 font-bold">
                              {new Date(o.createdAt).toLocaleDateString("ar-EG")} {new Date(o.createdAt).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            {/* 9. السعر (سعر التوصيل) */}
                            <td className="p-4 text-slate-700">
                              {(o.shippingCost || 0).toLocaleString()} <span className="text-[9px] text-gray-400">ج.س</span>
                            </td>
                            {/* 10. رسوم أخرى */}
                            <td className="p-4 text-slate-700">
                              {(o.otherFees || 0).toLocaleString()} <span className="text-[9px] text-gray-400">ج.س</span>
                            </td>
                            {/* 11. قيمة الشحنة */}
                            <td className="p-4 text-slate-800">
                              {(o.totalAmount || 0).toLocaleString()} <span className="text-[9px] text-gray-400">ج.س</span>
                            </td>
                            {/* 12. رقم الإرسالية */}
                            <td className="p-4 font-mono text-slate-700">
                              {o.consignmentNumber || "—"}
                            </td>
                            {/* 13. الملاحظات */}
                            <td className="p-4 text-slate-600 max-w-[200px] truncate" title={o.notes}>
                              {o.notes || "—"}
                            </td>
                            {/* 14. طريقة الدفع */}
                            <td className="p-4">
                              {(() => {
                                const pay = paymentDisplay(o.paymentMethod, o.paymentVerified, o.shipmentType);
                                return (
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-full text-[10px] whitespace-nowrap",
                                    pay.tone === "green" && "bg-green-50 text-green-600",
                                    pay.tone === "amber" && "bg-amber-50 text-amber-600",
                                    pay.tone === "blue" && "bg-blue-50 text-blue-600",
                                    pay.tone === "slate" && "bg-slate-100 text-slate-500"
                                  )}>
                                    {pay.label}
                                  </span>
                                );
                              })()}
                            </td>
                            {/* 15. الحالة */}
                            <td className="p-4">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] whitespace-nowrap border block text-center w-24",
                                o.status === "PENDING_PICKUP" ? "bg-orange-50 text-orange-600 border-orange-100"
                                  : o.status === "AT_BRANCH" ? "bg-purple-50 text-purple-600 border-purple-100"
                                  : o.status === "SHIPPED" ? "bg-blue-50 text-blue-600 border-blue-100"
                                  : o.status === "DELIVERED" ? "bg-green-50 text-green-600 border-green-100"
                                  : o.status === "CANCELLED" ? "bg-red-50 text-red-600 border-red-100 font-bold"
                                  : o.status === "RETURNED" ? "bg-rose-50 text-rose-600 border-rose-100 font-bold"
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                              )}>
                                {ORDER_STATUSES[o.status]?.label || o.status}
                              </span>
                            </td>
                            {/* 16. محتوى الطرد */}
                            <td className="p-4 text-slate-700 max-w-[200px] truncate" title={content}>
                              {content}
                            </td>
                            {/* 17. الكمية */}
                            <td className="p-4 text-slate-700">
                              {qty}
                            </td>
                            {/* 18. إسم المرسل (المورد) */}
                            <td className="p-4 text-teal-600">
                              {senderName}
                            </td>
                            {/* 19. الوزن */}
                            <td className="p-4 text-slate-700">
                              {o.weight ? `${o.weight} كجم` : "—"}
                            </td>
                            {/* 20. رقم ارسالية المزود */}
                            <td className="p-4 font-mono text-slate-700">
                              {o.providerConsignmentNumber || "—"}
                            </td>
                            {/* 21. رقم المرجع للعميل */}
                            <td className="p-4 font-mono text-slate-700">
                              {o.customerReference || "—"}
                            </td>
                            {/* 22. عدد محاولات التوصيل (يُحتسب تلقائياً عند استلام الرجيع) */}
                            <td className="p-4 text-center">
                              {(() => {
                                const attempts = o.attemptCounter || o.pendingAttempts || 0;
                                return (
                                  <span className={cn(
                                    "inline-block min-w-[1.5rem] px-2 py-0.5 rounded-full text-[11px]",
                                    attempts > 0 ? "bg-rose-50 text-rose-600" : "text-slate-400"
                                  )}>
                                    {attempts}
                                  </span>
                                );
                              })()}
                            </td>
                            {/* 23. نوع الشحنة */}
                            <td className="p-4 text-slate-700">
                              {o.shipmentType || "—"}
                            </td>
                            {/* 24. رسوم إضافية */}
                            <td className="p-4 text-slate-700">
                              {(o.additionalFees || 0).toLocaleString()} <span className="text-[9px] text-gray-400">ج.س</span>
                            </td>
                            {/* 25. المندوب */}
                            <td className="p-4 text-gray-500 whitespace-nowrap">
                              {o.driver?.name ? `🚗 ${o.driver.name}` : "—"}
                            </td>
                            {/* 25b. الفرع */}
                            <td className="p-4 text-gray-500 whitespace-nowrap">
                              {currentBranch ? `🏢 ${currentBranch}` : "—"}
                            </td>
                            {/* 26. إسناد إلى */}
                            <td className="p-4">
                              <div className="flex gap-2 items-center">
                                <button
                                  onClick={() => {
                                    setAssignTargetOrderIds([o.id]);
                                    setAssignActiveTab(o.branchId ? "BRANCH" : "DRIVER");
                                    setAssignSearchQuery("");
                                    setAssignModalOpen(true);
                                  }}
                                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none text-[10px] hover:bg-slate-100 transition-all flex items-center gap-1"
                                >
                                  <span className="material-symbols-rounded text-[12px]">person_add</span>
                                  إسناد...
                                </button>
                                {onEdit && (
                                  <button
                                    onClick={() => onEdit(o)}
                                    className="p-1 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                                    title="تعديل الشحنة"
                                  >
                                    <span className="material-symbols-rounded text-base">edit</span>
                                  </button>
                                )}
                                {onPrint && (
                                  <button
                                    onClick={() => onPrint(o)}
                                    className="p-1 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                                    title="طباعة البوليصة"
                                  >
                                    <span className="material-symbols-rounded text-base">print</span>
                                  </button>
                                )}
                                {(o.driverId || o.status === "SHIPPED") && (
                                  <button
                                    onClick={() => openReturnModal(o)}
                                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                                    title="استلام رجيع من المندوب"
                                  >
                                    <span className="material-symbols-rounded text-base">assignment_return</span>
                                  </button>
                                )}
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
                          );
                        })
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
                  onClick={() => handlePrintSettlement("a4")}
                  disabled={loadingOrders}
                  className="px-4 py-2.5 bg-white border border-[#0F172A] text-[#0F172A] hover:bg-slate-100 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-60"
                  title="طباعة A4"
                >
                  <span className="material-symbols-rounded text-sm">description</span>
                  A4
                </button>
                <button
                  onClick={() => handlePrintSettlement("thermal")}
                  disabled={loadingOrders}
                  className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-60"
                  title="طباعة حراري 80mm"
                >
                  <span className="material-symbols-rounded text-sm">receipt_long</span>
                  حراري
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

      {/* Custom Assign Driver / Branch Modal */}
      <AnimatePresence>
        {assignModalOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 font-black" dir="rtl">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAssignModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col z-10 border border-slate-100 overflow-hidden font-black text-right"
            >
              {/* Header */}
              <div className="p-6 bg-[#0F172A] text-white flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black">إسناد الشحنات المحددة ({assignTargetOrderIds.length})</h3>
                  <p className="text-white/60 text-[10px] font-bold mt-1">اختر المندوب أو الفرع لإسناد الطلبيات وتعديل حالتها تلقائياً</p>
                </div>
                <button
                  onClick={() => setAssignModalOpen(false)}
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search & Tabs */}
              <div className="p-6 border-b border-slate-100 space-y-4">
                {/* Search */}
                <div className="relative flex items-center bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-1">
                  <Search size={16} className="text-gray-400 ml-2" />
                  <input
                    type="text"
                    placeholder={assignActiveTab === "DRIVER" ? "البحث باسم المندوب أو الهاتف أو نوع المركبة..." : "البحث باسم الفرع أو العنوان..."}
                    value={assignSearchQuery}
                    onChange={(e) => setAssignSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none py-3 text-xs font-black text-slate-800 placeholder:text-slate-400"
                  />
                  {assignSearchQuery && (
                    <button onClick={() => setAssignSearchQuery("")} className="p-1 hover:bg-slate-200 rounded-full mr-auto">
                      <X size={14} className="text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
                  <button
                    onClick={() => { setAssignActiveTab("DRIVER"); setAssignSearchQuery(""); }}
                    className={cn("px-6 py-2.5 rounded-xl text-xs font-black transition-all", assignActiveTab === "DRIVER" ? "bg-[#0F172A] text-white shadow-sm" : "text-gray-400 hover:text-slate-700")}
                  >
                    🚗 المناديب ({drivers.length})
                  </button>
                  <button
                    onClick={() => { setAssignActiveTab("BRANCH"); setAssignSearchQuery(""); }}
                    className={cn("px-6 py-2.5 rounded-xl text-xs font-black transition-all", assignActiveTab === "BRANCH" ? "bg-[#0F172A] text-white shadow-sm" : "text-gray-400 hover:text-slate-700")}
                  >
                    🏢 الفروع ({branches.length})
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="p-6 overflow-y-auto max-h-[350px] space-y-3 custom-scrollbar">
                {assignActiveTab === "DRIVER" ? (
                  // Drivers Grid
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {drivers.filter(d => 
                      d.name.toLowerCase().includes(assignSearchQuery.toLowerCase()) ||
                      d.phone.includes(assignSearchQuery) ||
                      d.vehicleType.toLowerCase().includes(assignSearchQuery.toLowerCase())
                    ).length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-8 col-span-2">لا يوجد مناديب مطابقين للبحث</p>
                    ) : (
                      drivers.filter(d => 
                        d.name.toLowerCase().includes(assignSearchQuery.toLowerCase()) ||
                        d.phone.includes(assignSearchQuery) ||
                        d.vehicleType.toLowerCase().includes(assignSearchQuery.toLowerCase())
                      ).map(d => (
                        <div
                          key={d.id}
                          onClick={async () => {
                            setAssignModalOpen(false);
                            setBulkAssigning(true);
                            try {
                              await Promise.all(
                                assignTargetOrderIds.map(orderId => handleRouteOrder(orderId, "DRIVER", d.id))
                              );
                              setSelectedShipmentIds(new Set());
                              if (showToast) showToast(`تم إسناد الشحنات بنجاح للمندوب: ${d.name}`, "success");
                            } catch (err) {
                              alert("فشل الإسناد للمندوب");
                            } finally {
                              setBulkAssigning(false);
                            }
                          }}
                          className="border border-slate-100 hover:border-[#C5A021] bg-white rounded-3xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all"
                        >
                          {/* Driver Avatar */}
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0",
                            d.isOnline ? "bg-green-500 animate-pulse" : "bg-slate-100 text-[#C5A021]"
                          )}>
                            {d.name[0]}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-xs font-black text-[#0F172A] truncate">{d.name}</p>
                            <p className="text-[9px] text-gray-400 mt-1">{d.vehicleType} • {d.phone}</p>
                          </div>
                          <div className="text-left shrink-0">
                            <span className={cn(
                              "w-2.5 h-2.5 rounded-full inline-block",
                              d.isOnline ? "bg-green-500" : "bg-gray-300"
                            )} />
                            <p className="text-[9px] text-[#C5A021] font-black mt-1">{(d.balance).toLocaleString()} ج.س</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  // Branches Grid
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {branches.filter(b => 
                      b.name.toLowerCase().includes(assignSearchQuery.toLowerCase()) ||
                      b.location.toLowerCase().includes(assignSearchQuery.toLowerCase())
                    ).length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-8 col-span-2">لا توجد فروع مطابقة للبحث</p>
                    ) : (
                      branches.filter(b => 
                        b.name.toLowerCase().includes(assignSearchQuery.toLowerCase()) ||
                        b.location.toLowerCase().includes(assignSearchQuery.toLowerCase())
                      ).map(b => (
                        <div
                          key={b.id}
                          onClick={async () => {
                            setAssignModalOpen(false);
                            setBulkAssigning(true);
                            try {
                              await Promise.all(
                                assignTargetOrderIds.map(orderId => handleRouteOrder(orderId, "BRANCH", b.id))
                              );
                              setSelectedShipmentIds(new Set());
                              if (showToast) showToast(`تم توجيه الشحنات بنجاح للفرع: ${b.name}`, "success");
                            } catch (err) {
                              alert("فشل التوجيه للفرع");
                            } finally {
                              setBulkAssigning(false);
                            }
                          }}
                          className="border border-slate-100 hover:border-[#C5A021] bg-white rounded-3xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                            <Building2 size={20} />
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-xs font-black text-[#0F172A] truncate">{b.name}</p>
                            <p className="text-[9px] text-gray-400 mt-1">{b.location}</p>
                          </div>
                          <div className="shrink-0">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[8px] font-black",
                              b.isActive ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"
                            )}>
                              {b.isActive ? "نشط" : "معطل"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t bg-slate-50 flex items-center justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* V2 §2.1/§2.2: Receive Return from Courier Modal */}
      <AnimatePresence>
        {returnModalOpen && returnOrder && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReturnModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl flex flex-col z-10 border border-slate-100 overflow-hidden font-black"
            >
              <div className="p-6 bg-[#0F172A] text-white flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black">استلام رجيع من المندوب</h3>
                  <p className="text-white/60 text-[10px] font-bold mt-1">
                    شحنة #{(returnOrder.trackingNumber || returnOrder.id.slice(-8)).toString().toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setReturnModalOpen(false)}
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-[11px] text-amber-700 leading-relaxed font-bold">
                  سيتم تحويل عهدة الشحنة (المالية والفيزيائية) من المندوب
                  <span className="text-amber-900"> {returnOrder.driver?.name || ""} </span>
                  إلى الفرع المحدد، واحتساب محاولة توصيل جديدة تلقائياً
                  (المحاولة رقم {(returnOrder.attemptCounter || returnOrder.pendingAttempts || 0) + 1}).
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400">الفرع المستهدف (المستودع) *</label>
                  <select
                    value={returnBranchId}
                    onChange={(e) => setReturnBranchId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-800 outline-none focus:border-[#C5A021]"
                  >
                    <option value="">-- اختر الفرع --</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  {branches.length === 0 && (
                    <p className="text-[9px] font-black text-rose-500 mt-1">لا توجد فروع — أضف فرعاً من تبويب الفروع أولاً.</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400">سبب الإرجاع (اختياري)</label>
                  <input
                    type="text"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="مثال: العميل لم يرد / عنوان غير صحيح"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-800 outline-none focus:border-[#C5A021]"
                  />
                </div>
              </div>

              <div className="p-6 border-t bg-slate-50 flex items-center justify-end gap-3 shrink-0">
                <button
                  onClick={() => setReturnModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleReceiveReturn}
                  disabled={submittingReturn || !returnBranchId}
                  className="px-6 py-2.5 bg-[#0F172A] text-white hover:bg-[#C5A021] rounded-xl text-xs flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submittingReturn && <Loader2 size={12} className="animate-spin" />}
                  تأكيد استلام الرجيع
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* V2 §3: Visual Order Tracking Timeline Modal */}
      <AnimatePresence>
        {trackingTimelineOpen && trackingTimelineOrder && (
          <div className="fixed inset-0 z-[700] flex items-center justify-center p-4" dir="rtl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTrackingTimelineOpen(false)}
              className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl flex flex-col z-10 border border-slate-100 overflow-hidden font-black"
            >
              {/* Header */}
              <div className="p-5 bg-[#0F172A] text-white flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black">سجل تتبع الشحنة</h3>
                  <p className="text-white/50 text-[10px] font-bold mt-0.5">
                    {trackingTimelineOrder.trackingNumber || `#${trackingTimelineOrder.id?.slice(-8).toUpperCase()}`}
                    {trackingTimelineOrder.customerName ? ` · ${trackingTimelineOrder.customerName}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => setTrackingTimelineOpen(false)}
                  className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status badge row */}
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] border",
                  trackingTimelineOrder.status === "PENDING_PICKUP" ? "bg-orange-50 text-orange-600 border-orange-100"
                    : trackingTimelineOrder.status === "AT_BRANCH" ? "bg-purple-50 text-purple-600 border-purple-100"
                    : trackingTimelineOrder.status === "SHIPPED" ? "bg-blue-50 text-blue-600 border-blue-100"
                    : trackingTimelineOrder.status === "DELIVERED" ? "bg-green-50 text-green-600 border-green-100"
                    : trackingTimelineOrder.status === "CANCELLED" ? "bg-red-50 text-red-600 border-red-100"
                    : trackingTimelineOrder.status === "RETURNED" ? "bg-rose-50 text-rose-600 border-rose-100"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                )}>
                  {ORDER_STATUSES?.[trackingTimelineOrder.status]?.label || trackingTimelineOrder.status}
                </span>
                {trackingTimelineOrder.driver?.name && (
                  <span className="text-[10px] text-gray-500">🚗 {trackingTimelineOrder.driver.name}</span>
                )}
                {trackingTimelineOrder.city && (
                  <span className="text-[10px] text-gray-400">📍 {trackingTimelineOrder.city}</span>
                )}
              </div>

              {/* Timeline */}
              <div className="p-6 overflow-y-auto max-h-[420px] space-y-0">
                {(() => {
                  const events = parseNotesTimeline(trackingTimelineOrder.notes || "");
                  if (events.length === 0) {
                    return (
                      <div className="text-center py-10 text-gray-400">
                        <span className="material-symbols-rounded text-4xl block mb-2">timeline</span>
                        <p className="text-xs font-bold">لا يوجد سجل أحداث لهذه الشحنة بعد</p>
                        <p className="text-[10px] mt-1 text-gray-300">ستظهر الأحداث تلقائياً عند تحديث حالة الشحنة</p>
                      </div>
                    );
                  }
                  return events.map((ev, idx) => (
                    <div key={idx} className="flex gap-4 relative">
                      {/* Vertical line */}
                      {idx < events.length - 1 && (
                        <div className="absolute right-[19px] top-8 bottom-0 w-0.5 bg-slate-100" />
                      )}
                      {/* Dot */}
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm shrink-0 z-10",
                        idx === 0 ? "bg-[#C5A021]" : "bg-slate-200 text-slate-500"
                      )}>
                        <span className="material-symbols-rounded text-base">
                          {idx === 0 ? "radio_button_checked"
                            : ev.title.includes("توصيل") ? "local_shipping"
                            : ev.title.includes("فرع") || ev.title.includes("استلام") ? "store"
                            : ev.title.includes("مندوب") ? "person_pin"
                            : ev.title.includes("رجيع") || ev.title.includes("إرجاع") ? "assignment_return"
                            : "history"}
                        </span>
                      </div>
                      {/* Content */}
                      <div className="pb-6 flex-1 min-w-0">
                        <p className={cn("text-[11px] font-black", idx === 0 ? "text-[#C5A021]" : "text-slate-700")}>
                          {ev.title}
                        </p>
                        {ev.message && (
                          <p className="text-[10px] text-gray-500 font-bold mt-0.5 leading-relaxed">{ev.message}</p>
                        )}
                        {ev.timestamp && (
                          <p className="text-[9px] text-gray-300 font-bold mt-1">{ev.timestamp}</p>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">
                  تاريخ الإنشاء: {new Date(trackingTimelineOrder.createdAt).toLocaleString("ar-EG")}
                </span>
                <button
                  onClick={() => setTrackingTimelineOpen(false)}
                  className="px-5 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-black hover:bg-[#C5A021] transition-all"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    </div>
  );
}
