"use client";

import React, { useState } from "react";
import { Upload, FileSpreadsheet, Plus, AlertCircle, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { importFromExcel } from "@/lib/excel";

interface ImportedOrdersTabProps {
  classes: any;
  vendors: any[];
  showToast?: (message: string, type?: "info" | "error" | "success") => void;
  fetchData?: () => Promise<void> | void;
}

export default function ImportedOrdersTab({ classes, vendors, showToast, fetchData }: ImportedOrdersTabProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [manualOrders, setManualOrders] = useState<any[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; failed: number } | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!selectedVendorId) {
      setImportStatus("error");
      setMessage("يرجى اختيار المورد/التاجر أولاً قبل إسقاط الملف!");
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      setMessage(`تم اختيار الملف: ${selectedFile.name}`);
      try {
        const rows = await importFromExcel(selectedFile, { raw: false, defval: "" });
        const parsed: any[] = [];
        for (const row of rows) {
          if (!row || Object.values(row).every((v) => String(v ?? "").trim() === "")) continue;
          const mapped = buildPayloadFromExcelRow(row);
          parsed.push({
            id: `excel-${Date.now()}-${Math.random()}`,
            customerName: mapped.name,
            phone: mapped.phone,
            city: mapped.city,
            district: mapped.district,
            street: mapped.street,
            productName: mapped.packageContent,
            quantity: mapped.quantity,
            price: mapped.totalAmount,
            shippingCost: mapped.shippingCost,
            otherFees: mapped.otherFees,
            additionalFees: mapped.additionalFees,
            paymentMethod: mapped.paymentMethod,
            status: mapped.status,
            weight: mapped.weight,
            trackingNumber: mapped.trackingNumber,
            consignmentNumber: mapped.consignmentNumber,
            providerConsignmentNumber: mapped.providerConsignmentNumber,
            customerReference: mapped.customerReference,
            pendingAttempts: mapped.pendingAttempts,
            shipmentType: mapped.shipmentType,
            notes: mapped.notes
          });
        }
        setManualOrders(prev => [...prev, ...parsed]);
        setFile(null);
        setImportStatus("success");
        setMessage(`تم استخراج ${parsed.length} شحنة من الملف وهي معروضة بالجدول أدناه للمراجعة والتعديل قبل الإدراج.`);
      } catch (err: any) {
        setImportStatus("error");
        setMessage("حدث خطأ أثناء قراءة ملف الـ Excel: " + err.message);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedVendorId) {
      setImportStatus("error");
      setMessage("يرجى اختيار المورد/التاجر أولاً قبل تحديد الملف!");
      return;
    }
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setMessage(`تم اختيار الملف: ${selectedFile.name}`);
      try {
        const rows = await importFromExcel(selectedFile, { raw: false, defval: "" });
        const parsed: any[] = [];
        for (const row of rows) {
          if (!row || Object.values(row).every((v) => String(v ?? "").trim() === "")) continue;
          const mapped = buildPayloadFromExcelRow(row);
          parsed.push({
            id: `excel-${Date.now()}-${Math.random()}`,
            customerName: mapped.name,
            phone: mapped.phone,
            city: mapped.city,
            district: mapped.district,
            street: mapped.street,
            productName: mapped.packageContent,
            quantity: mapped.quantity,
            price: mapped.totalAmount,
            shippingCost: mapped.shippingCost,
            otherFees: mapped.otherFees,
            additionalFees: mapped.additionalFees,
            paymentMethod: mapped.paymentMethod,
            status: mapped.status,
            weight: mapped.weight,
            trackingNumber: mapped.trackingNumber,
            consignmentNumber: mapped.consignmentNumber,
            providerConsignmentNumber: mapped.providerConsignmentNumber,
            customerReference: mapped.customerReference,
            pendingAttempts: mapped.pendingAttempts,
            shipmentType: mapped.shipmentType,
            notes: mapped.notes
          });
        }
        setManualOrders(prev => [...prev, ...parsed]);
        setFile(null);
        setImportStatus("success");
        setMessage(`تم استخراج ${parsed.length} شحنة من الملف وهي معروضة بالجدول أدناه للمراجعة والتعديل قبل الإدراج.`);
      } catch (err: any) {
        setImportStatus("error");
        setMessage("حدث خطأ أثناء قراءة ملف الـ Excel: " + err.message);
      }
    }
  };

  const addManualRow = () => {
    setManualOrders([
      ...manualOrders,
      {
        id: Date.now().toString(),
        customerName: "",
        phone: "",
        city: "",
        district: "",
        street: "",
        productName: "",
        quantity: 1,
        price: 0,
        shippingCost: 0,
        otherFees: 0,
        additionalFees: 0,
        paymentMethod: "COD",
        status: "AWAITING_PICKUP",
        weight: 0,
        trackingNumber: "",
        consignmentNumber: "",
        providerConsignmentNumber: "",
        customerReference: "",
        pendingAttempts: 0,
        shipmentType: "",
        notes: "",
      },
    ]);
  };

  const updateManualRow = (id: string, field: string, value: any) => {
    setManualOrders(
      manualOrders.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const removeManualRow = (id: string) => {
    setManualOrders(manualOrders.filter((row) => row.id !== id));
  };

  // ── Inline Error Editing (V2) — validate each row before insertion ──
  const isBlank = (v: any) => String(v ?? "").trim() === "";
  const validateRow = (row: any): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (isBlank(row.customerName)) errs.customerName = "اسم المستلم مطلوب";
    const digits = String(row.phone ?? "").replace(/\D/g, "");
    if (isBlank(row.phone)) errs.phone = "رقم الهاتف مطلوب";
    else if (digits.length < 7) errs.phone = "رقم هاتف غير صحيح";
    if (isBlank(row.city)) errs.city = "المدينة مطلوبة";
    const price = Number(String(row.price ?? "").replace(/[^\d.\-]/g, ""));
    if (isBlank(row.price) || isNaN(price)) errs.price = "قيمة مالية غير صحيحة";
    else if (price < 0) errs.price = "القيمة لا يمكن أن تكون سالبة";
    const ship = Number(String(row.shippingCost ?? 0).replace(/[^\d.\-]/g, ""));
    if (isNaN(ship) || ship < 0) errs.shippingCost = "قيمة توصيل غير صحيحة";
    const qty = parseInt(String(row.quantity));
    if (isNaN(qty) || qty < 1) errs.quantity = "الكمية يجب أن تكون 1 أو أكثر";
    return errs;
  };
  // Red highlight for cells that contain a programmatic error (Inline Error Editing)
  const cellClass = (hasErr: boolean) =>
    `w-full rounded-lg px-3 py-2 text-xs font-bold outline-none text-slate-800 border ${
      hasErr
        ? "border-red-400 bg-red-50 focus:border-red-500"
        : "bg-slate-50 border-slate-100 focus:border-[#C5A021]"
    }`;

  const downloadTemplate = () => {
    // Generate a simple CSV template and download it
    const headers = "باركود الشحنة,اسم المستلم,هاتف المستلم,المدينة,الحي,الشارع,قيمة الشحنة,السعر (سعر التوصيل),طريقة الدفع,الحالة,محتوى الطرد,الكمية,الوزن,نوع الشحنة,الملاحظات\n";
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), headers], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "morsall_import_orders_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Column-mapping helpers (supports the far-mile export and the platform template) ──
  const norm = (s: any) => String(s ?? "").replace(/\s+/g, " ").trim();
  const parseNum = (v: any): number => {
    const n = parseFloat(String(v ?? "").replace(/[^\d.\-]/g, ""));
    return isNaN(n) ? 0 : n;
  };
  const getField = (row: any, candidates: string[]): string => {
    const keys = Object.keys(row || {});
    for (const cand of candidates) {
      const target = norm(cand);
      const key = keys.find((k) => norm(k) === target);
      if (key !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
        return String(row[key]).trim();
      }
    }
    return "";
  };
  const mapStatus = (raw: string): string => {
    const s = norm(raw);
    if (!s) return "AWAITING_PICKUP";
    if (/ملغ/.test(s)) return "CANCELLED";
    if (/مسلم|تم التسليم/.test(s)) return "DELIVERED";
    if (/مرتجع|مرجع/.test(s)) return "RETURNED";
    if (/جاري التوصيل|قيد التوصيل/.test(s)) return "SHIPPED";
    if (/في الفرع/.test(s)) return "AT_BRANCH";
    if (/التحميل/.test(s)) return "PENDING_PICKUP";
    if (/لم يتم الرد|لا يرد/.test(s)) return "NO_ANSWER";
    if (/مؤجل/.test(s)) return "POSTPONED";
    return "AWAITING_PICKUP";
  };
  const mapPayment = (raw: string): string => {
    const s = norm(raw);
    if (/كاش|نقد|تحصيل/.test(s)) return "COD";
    if (/حوالة|تحويل|بنك/.test(s)) return "BANK_TRANSFER";
    return raw || "COD";
  };

  const buildPayloadFromExcelRow = (row: any) => {
    const city = getField(row, ["المدينة", "المدينه"]) || "غير محدد";
    const supplier = getField(row, ["إسم المرسل (المورد)", "اسم المرسل (المورد)", "المورد"]);
    const baseNotes = getField(row, ["الملاحظات", "ملاحظات"]);
    return {
      source: "EXTERNAL_IMPORT",
      vendorId: selectedVendorId,
      name: getField(row, ["اسم المستلم", "اسم العميل"]) || "عميل مستورد",
      phone: getField(row, ["هاتف المستلم", "الهاتف", "رقم الهاتف"]) || "0000000000",
      city,
      district: getField(row, ["الحي", "الحى"]) || city,
      street: getField(row, ["الشارع", "العنوان"]) || city,
      totalAmount: parseNum(getField(row, ["قيمة الشحنة", "السعر"])),
      shippingCost: parseNum(getField(row, ["السعر (سعر التوصيل)", "سعر التوصيل", "رسوم التوصيل"])),
      otherFees: parseNum(getField(row, ["رسوم أخرى", "رسوم اخرى"])),
      additionalFees: parseNum(getField(row, ["رسوم إضافية", "رسوم اضافية"])),
      paymentMethod: mapPayment(getField(row, ["طريقة الدفع"])),
      status: mapStatus(getField(row, ["الحالة"])),
      packageContent: getField(row, ["محتوى الطرد", "اسم المنتج", "المنتج"]),
      quantity: parseInt(getField(row, ["الكمية"])) || 1,
      weight: parseNum(getField(row, ["الوزن"])),
      trackingNumber: getField(row, ["باركود الشحنة", "الباركود"]),
      consignmentNumber: getField(row, ["رقم الإرسالية", "رقم الارسالية"]),
      providerConsignmentNumber: getField(row, ["رقم ارسالية المزود", "رقم إرسالية المزود"]),
      customerReference: getField(row, ["رقم المرجع للعميل", "المرجع"]),
      pendingAttempts: parseInt(getField(row, ["عدد محاولات العالق", "محاولات"])) || 0,
      shipmentType: getField(row, ["نوع الشحنة"]),
      notes: [baseNotes, supplier ? `المورد: ${supplier}` : ""].filter(Boolean).join(" | ") || null,
    };
  };

  const buildPayloadFromManualRow = (row: any) => ({
    source: "EXTERNAL_IMPORT",
    vendorId: selectedVendorId,
    name: row.customerName || "عميل مستورد",
    phone: row.phone || "0000000000",
    city: row.city || "غير محدد",
    district: row.city || "غير محدد",
    street: row.city || "غير محدد",
    totalAmount: parseNum(row.price),
    quantity: parseInt(row.quantity) || 1,
    packageContent: row.productName || "",
    paymentMethod: "COD",
    status: "AWAITING_PICKUP",
    notes: row.notes || null,
  });

  const handleProcessImport = async () => {
    if (!selectedVendorId) {
      setImportStatus("error");
      setMessage("يرجى اختيار المورد/التاجر أولاً قبل الاستيراد!");
      return;
    }
    if (manualOrders.length === 0) {
      setImportStatus("error");
      setMessage("يرجى رفع ملف الاستيراد أو إدخال طلبات يدوية!");
      return;
    }

    // Inline Error Editing gate: block insertion while any row has errors
    const errorRows = manualOrders
      .map((r) => ({ id: r.id, errs: validateRow(r) }))
      .filter((r) => Object.keys(r.errs).length > 0);
    if (errorRows.length > 0) {
      const total = errorRows.reduce((s, r) => s + Object.keys(r.errs).length, 0);
      setImportStatus("error");
      setMessage(
        `يوجد ${total} حقل يحتوي على خطأ في ${errorRows.length} شحنة (مظللة بالأحمر). يرجى تصحيحها مباشرة في الجدول ثم الضغط على "معالجة وإدراج".`
      );
      showToast?.(`صحّح ${total} حقل قبل الإدراج`, "error");
      return;
    }

    setImporting(true);
    setImportStatus("idle");
    setMessage("");
    setProgress(null);

    try {
      const payloads: any[] = [];

      for (const row of manualOrders) {
        payloads.push({
          source: "EXTERNAL_IMPORT",
          vendorId: selectedVendorId,
          name: row.customerName || "عميل مستورد",
          phone: row.phone || "0000000000",
          city: row.city || "غير محدد",
          district: row.district || row.city || "غير محدد",
          street: row.street || row.city || "غير محدد",
          totalAmount: parseNum(row.price),
          shippingCost: parseNum(row.shippingCost || 0),
          otherFees: parseNum(row.otherFees || 0),
          additionalFees: parseNum(row.additionalFees || 0),
          paymentMethod: row.paymentMethod || "COD",
          status: row.status || "AWAITING_PICKUP",
          packageContent: row.productName || "",
          quantity: parseInt(row.quantity) || 1,
          weight: parseNum(row.weight || 0),
          trackingNumber: row.trackingNumber || null,
          consignmentNumber: row.consignmentNumber || null,
          providerConsignmentNumber: row.providerConsignmentNumber || null,
          customerReference: row.customerReference || null,
          pendingAttempts: parseInt(row.pendingAttempts) || 0,
          shipmentType: row.shipmentType || null,
          notes: row.notes || null,
        });
      }

      setProgress({ done: 0, total: payloads.length, failed: 0 });
      let done = 0;
      let failed = 0;

      // Post in small batches to avoid overwhelming the server
      const BATCH = 5;
      for (let i = 0; i < payloads.length; i += BATCH) {
        const batch = payloads.slice(i, i + BATCH);
        const results = await Promise.all(
          batch.map((p) =>
            fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(p),
            })
              .then((r) => r.ok)
              .catch(() => false)
          )
        );
        for (const ok of results) {
          if (ok) done++;
          else failed++;
        }
        setProgress({ done, total: payloads.length, failed });
      }

      if (done > 0) {
        setImportStatus("success");
        setMessage(
          `تم استيراد ${done} شحنة بنجاح${failed > 0 ? ` (فشل ${failed} شحنة)` : ""} وإضافتها إلى نظام اللوجستيات.`
        );
        setManualOrders([]);
        setFile(null);
        showToast?.(`تم استيراد ${done} شحنة بنجاح`, "success");
        if (fetchData) await fetchData();
      } else {
        setImportStatus("error");
        setMessage(`فشل استيراد جميع الشحنات (${failed}). تأكد من تنسيق الملف ووجود مورد نشط في النظام.`);
      }
    } catch (err: any) {
      console.error("Import error:", err);
      setImportStatus("error");
      setMessage("حدث خطأ أثناء الاستيراد: " + (err?.message || "خطأ غير معروف"));
    } finally {
      setImporting(false);
    }
  };

  // Per-row validation errors recomputed each render (Inline Error Editing)
  const rowErrors: Record<string, Record<string, string>> = {};
  let totalErrorCount = 0;
  let rowsWithErrors = 0;
  manualOrders.forEach((r) => {
    const e = validateRow(r);
    rowErrors[r.id] = e;
    const n = Object.keys(e).length;
    totalErrorCount += n;
    if (n > 0) rowsWithErrors++;
  });

  return (
    <div className="space-y-8">
      {/* Overview/Help Card */}
      <div className={classes.card + " p-8 bg-slate-900 text-white relative overflow-hidden border-0"}>
        <div className="absolute top-[-30%] right-[-10%] w-[40%] h-[150%] bg-[#C5A021]/10 blur-[100px] rounded-full pointer-events-none" />
        <h3 className="text-xl font-black mb-3 flex items-center gap-3">
          <FileSpreadsheet className="text-[#C5A021]" size={24} />
          استيراد الطلبات الخارجية (Bulk Import)
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          أهلاً بك في نظام الاستيراد الذكي. هنا يمكنك استيراد ملفات الشحنات الخارجية الخاصة بالمنصات الأخرى مثل (فيسبوك، واتساب، أو المتاجر الخارجية) وتنسيقها مع الموردين لإدخالها مباشرة في النظام اللوجستي وتعيين المناديب لها دفعة واحدة.
        </p>
        <button
          onClick={downloadTemplate}
          className="mt-5 inline-flex items-center gap-2 bg-[#C5A021] hover:bg-[#A9841B] text-white text-xs font-black px-5 py-3 rounded-xl transition-all"
        >
          <Upload size={14} />
          تحميل قالب Excel/CSV النموذجي
        </button>
      </div>

      {/* Import Configuration & Dropzone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={classes.card + " p-6 space-y-6"}>
          <h4 className="text-sm font-black text-slate-700 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span className="w-4 h-4 bg-[#C5A021] rounded-full" />
            1. إعدادات جهة الاستيراد
          </h4>
          
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 block">اختيار التاجر/المورد التابع للطلبات:</label>
            <select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-[#C5A021] transition-all"
            >
              <option value="">-- اختر المورد --</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.storeName || v.user?.name || "تاجر بدون اسم"}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-black text-slate-400 block">مصدر الشحنات:</label>
            <div className="grid grid-cols-3 gap-2">
              {["FACEBOOK", "WHATSAPP", "EXCEL"].map((src) => (
                <div key={src} className="border border-slate-100 bg-slate-50 p-2.5 rounded-xl text-center font-bold text-[10px] text-slate-500 cursor-pointer hover:border-[#C5A021]/30 transition-all">
                  {src}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={classes.card + " p-6 lg:col-span-2 flex flex-col justify-between"}>
          <div>
            <h4 className="text-sm font-black text-slate-700 pb-3 border-b border-slate-100 flex items-center gap-2 mb-6">
              <span className="w-4 h-4 bg-[#C5A021] rounded-full" />
              2. رفع الملف أو إسقاطه
            </h4>

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 transition-all ${
                dragActive ? "border-[#C5A021] bg-[#C5A021]/5" : "border-slate-200 hover:border-[#C5A021]/50"
              }`}
            >
              <FileSpreadsheet size={48} className={dragActive ? "text-[#C5A021]" : "text-slate-300"} />
              <div className="text-center">
                <p className="text-xs font-black text-slate-700">اسحب وأسقط ملف الـ Excel/CSV هنا</p>
                <p className="text-[10px] text-slate-400 mt-1">أو اضغط للتصفح من جهازك</p>
              </div>
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
                className="hidden"
                id="file-import-input"
              />
              <label
                htmlFor="file-import-input"
                className="mt-2 bg-slate-950 hover:bg-[#C5A021] text-white font-black text-[10px] px-4 py-2.5 rounded-xl cursor-pointer transition-all"
              >
                تصفح الملفات
              </label>
            </div>
          </div>

          {importStatus !== "idle" && (
            <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 border ${
              importStatus === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"
            }`}>
              {importStatus === "success" ? <CheckCircle2 className="shrink-0 mt-0.5 text-emerald-600" size={16} /> : <AlertCircle className="shrink-0 mt-0.5 text-rose-600" size={16} />}
              <div>
                <p className="text-xs font-black">{message}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Orders List Table */}
      <div className={classes.card + " p-6"}>
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
          <h4 className="text-sm font-black text-slate-700 flex items-center gap-2">
            <span className="w-4 h-4 bg-[#C5A021] rounded-full" />
            3. الطلبات المدخلة يدوياً ({manualOrders.length})
          </h4>
          <button
            onClick={addManualRow}
            className="inline-flex items-center gap-1.5 bg-[#C5A021] text-white text-xs font-black px-4 py-2.5 rounded-xl hover:brightness-105 transition-all shadow-md shadow-[#C5A021]/10"
          >
            <Plus size={14} />
            إضافة سطر جديد
          </button>
        </div>

        {/* Inline Error Editing — validation summary */}
        {manualOrders.length > 0 && (
          totalErrorCount > 0 ? (
            <div className="mb-5 p-4 rounded-xl flex items-start gap-3 border bg-rose-50 border-rose-200 text-rose-800">
              <AlertCircle className="shrink-0 mt-0.5 text-rose-600" size={16} />
              <p className="text-xs font-black">
                يوجد {totalErrorCount} حقل يحتاج تصحيح في {rowsWithErrors} شحنة. الخلايا المظللة بالأحمر تحتوي على أخطاء — عدّلها مباشرة هنا ثم اضغط «معالجة وإدراج».
              </p>
            </div>
          ) : (
            <div className="mb-5 p-4 rounded-xl flex items-start gap-3 border bg-emerald-50 border-emerald-200 text-emerald-800">
              <CheckCircle2 className="shrink-0 mt-0.5 text-emerald-600" size={16} />
              <p className="text-xs font-black">كل الحقول صحيحة — الشحنات ({manualOrders.length}) جاهزة للإدراج.</p>
            </div>
          )
        )}

        {manualOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-300">
            <AlertCircle size={48} className="mx-auto opacity-20 mb-3" />
            <p className="text-xs font-black text-slate-400">لا توجد طلبات مدخلة يدوياً حالياً. اضغط على زر إضافة سطر لتسجيل شحنات يدوية سريعة.</p>
          </div>
        ) : (
            <table className="w-full text-right border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-wider">
                  <th className="px-4 py-3.5">اسم العميل</th>
                  <th className="px-4 py-3.5">رقم الهاتف</th>
                  <th className="px-4 py-3.5">المدينة</th>
                  <th className="px-4 py-3.5">الحي</th>
                  <th className="px-4 py-3.5">الشارع</th>
                  <th className="px-4 py-3.5">محتوى الطرد</th>
                  <th className="px-4 py-3.5 w-20">الكمية</th>
                  <th className="px-4 py-3.5 w-28">القيمة (ج.س)</th>
                  <th className="px-4 py-3.5 w-28">التوصيل (ج.س)</th>
                  <th className="px-4 py-3.5">الباركود</th>
                  <th className="px-4 py-3.5">ملاحظات</th>
                  <th className="px-4 py-3.5 w-12 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {manualOrders.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.customerName}
                        onChange={(e) => updateManualRow(row.id, "customerName", e.target.value)}
                        placeholder="أحمد علي"
                        className={cellClass(!!rowErrors[row.id]?.customerName)}
                      />
                      {rowErrors[row.id]?.customerName && (
                        <p className="text-[9px] font-black text-red-500 mt-1">{rowErrors[row.id].customerName}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.phone}
                        onChange={(e) => updateManualRow(row.id, "phone", e.target.value)}
                        placeholder="0912345678"
                        className={cellClass(!!rowErrors[row.id]?.phone)}
                      />
                      {rowErrors[row.id]?.phone && (
                        <p className="text-[9px] font-black text-red-500 mt-1">{rowErrors[row.id].phone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.city}
                        onChange={(e) => updateManualRow(row.id, "city", e.target.value)}
                        placeholder="الخرطوم"
                        className={cellClass(!!rowErrors[row.id]?.city)}
                      />
                      {rowErrors[row.id]?.city && (
                        <p className="text-[9px] font-black text-red-500 mt-1">{rowErrors[row.id].city}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.district || ""}
                        onChange={(e) => updateManualRow(row.id, "district", e.target.value)}
                        placeholder="الرياض"
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#C5A021] text-slate-800"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.street || ""}
                        onChange={(e) => updateManualRow(row.id, "street", e.target.value)}
                        placeholder="شارع المشتل"
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#C5A021] text-slate-800"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.productName}
                        onChange={(e) => updateManualRow(row.id, "productName", e.target.value)}
                        placeholder="ساعة ذكية"
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#C5A021] text-slate-800"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={row.quantity}
                        onChange={(e) => updateManualRow(row.id, "quantity", parseInt(e.target.value) || 1)}
                        className={cellClass(!!rowErrors[row.id]?.quantity) + " text-center"}
                      />
                      {rowErrors[row.id]?.quantity && (
                        <p className="text-[9px] font-black text-red-500 mt-1">{rowErrors[row.id].quantity}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={row.price}
                        onChange={(e) => updateManualRow(row.id, "price", parseFloat(e.target.value) || 0)}
                        className={cellClass(!!rowErrors[row.id]?.price)}
                      />
                      {rowErrors[row.id]?.price && (
                        <p className="text-[9px] font-black text-red-500 mt-1">{rowErrors[row.id].price}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={row.shippingCost || 0}
                        onChange={(e) => updateManualRow(row.id, "shippingCost", parseFloat(e.target.value) || 0)}
                        className={cellClass(!!rowErrors[row.id]?.shippingCost)}
                      />
                      {rowErrors[row.id]?.shippingCost && (
                        <p className="text-[9px] font-black text-red-500 mt-1">{rowErrors[row.id].shippingCost}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.trackingNumber || ""}
                        onChange={(e) => updateManualRow(row.id, "trackingNumber", e.target.value)}
                        placeholder="TRACK-001"
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#C5A021] text-slate-800"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.notes}
                        onChange={(e) => updateManualRow(row.id, "notes", e.target.value)}
                        placeholder="توصيل مسائي"
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#C5A021] text-slate-800"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeManualRow(row.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1.5"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={handleProcessImport}
          disabled={importing || totalErrorCount > 0}
          title={totalErrorCount > 0 ? `صحّح ${totalErrorCount} حقل قبل الإدراج` : undefined}
          className="bg-gradient-to-r from-[#C5A021] to-[#A9841B] text-white px-8 py-4 rounded-2xl font-black text-sm transition-all duration-500 shadow-xl shadow-[#C5A021]/10 hover:brightness-105 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {importing && <Loader2 size={16} className="animate-spin" />}
          {importing
            ? (progress ? `جاري الاستيراد... ${progress.done}/${progress.total}` : "جاري المعالجة...")
            : totalErrorCount > 0
              ? `معالجة وإدراج (${totalErrorCount} خطأ يحتاج تصحيح)`
              : "معالجة وإدراج الطلبات المستوردة"}
        </button>
      </div>
    </div>
  );
}
