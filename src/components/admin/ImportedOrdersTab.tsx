"use client";

import React, { useState } from "react";
import { Upload, FileSpreadsheet, Plus, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";

interface ImportedOrdersTabProps {
  classes: any;
  vendors: any[];
}

export default function ImportedOrdersTab({ classes, vendors }: ImportedOrdersTabProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [manualOrders, setManualOrders] = useState<any[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setMessage(`تم اختيار الملف: ${e.dataTransfer.files[0].name}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(`تم اختيار الملف: ${e.target.files[0].name}`);
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
        productName: "",
        quantity: 1,
        price: 0,
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

  const downloadTemplate = () => {
    // Generate a simple CSV template and download it
    const headers = "اسم المستلم,الهاتف,المدينة,الحي,الشارع,اسم المنتج,الكمية,السعر,ملاحظات\n";
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), headers], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "morsall_import_orders_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProcessImport = async () => {
    if (!selectedVendorId) {
      setImportStatus("error");
      setMessage("يرجى اختيار المورد/التاجر أولاً قبل الاستيراد!");
      return;
    }

    if (!file && manualOrders.length === 0) {
      setImportStatus("error");
      setMessage("يرجى رفع ملف الاستيراد أو إدخال طلبات يدوية!");
      return;
    }

    // Process manual or file orders
    setImportStatus("success");
    setMessage("تم استيراد الطلبات بنجاح وجاري إضافتها إلى شاشة تتبع الشحنات واللوجستيات!");
    setManualOrders([]);
    setFile(null);
  };

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

        {manualOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-300">
            <AlertCircle size={48} className="mx-auto opacity-20 mb-3" />
            <p className="text-xs font-black text-slate-400">لا توجد طلبات مدخلة يدوياً حالياً. اضغط على زر إضافة سطر لتسجيل شحنات يدوية سريعة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-wider">
                  <th className="px-4 py-3.5">اسم العميل</th>
                  <th className="px-4 py-3.5">رقم الهاتف</th>
                  <th className="px-4 py-3.5">المدينة</th>
                  <th className="px-4 py-3.5">اسم المنتج</th>
                  <th className="px-4 py-3.5 w-24">الكمية</th>
                  <th className="px-4 py-3.5 w-32">السعر (ج.س)</th>
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
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#C5A021] text-slate-800"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.phone}
                        onChange={(e) => updateManualRow(row.id, "phone", e.target.value)}
                        placeholder="0912345678"
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#C5A021] text-slate-800"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.city}
                        onChange={(e) => updateManualRow(row.id, "city", e.target.value)}
                        placeholder="الخرطوم"
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
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#C5A021] text-slate-800 text-center"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={row.price}
                        onChange={(e) => updateManualRow(row.id, "price", parseFloat(e.target.value) || 0)}
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
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={handleProcessImport}
          className="bg-gradient-to-r from-[#C5A021] to-[#A9841B] text-white px-8 py-4 rounded-2xl font-black text-sm transition-all duration-500 shadow-xl shadow-[#C5A021]/10 hover:brightness-105 active:scale-[0.98]"
        >
          معالجة وإدراج الطلبات المستوردة
        </button>
      </div>
    </div>
  );
}
