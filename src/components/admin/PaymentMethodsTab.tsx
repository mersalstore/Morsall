"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CreditCard, Plus, Trash2, QrCode, CheckCircle2, XCircle, Eye, Zap } from "lucide-react";

interface PaymentAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions?: string;
  qrCode?: string;
  isActive: boolean;
}

export default function PaymentMethodsTab() {
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState<string | null>(null);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<"accounts" | "orders">("accounts");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [settingsRes, ordersRes] = await Promise.all([
      fetch("/api/admin/settings/appearance"),
      fetch("/api/admin/orders?paymentMethod=BANK_TRANSFER"),
    ]);
    if (settingsRes.ok) {
      const data = await settingsRes.json();
      const s = data.settings;
      try {
        if (s?.bankAccounts) {
          const parsed = JSON.parse(s.bankAccounts);
          if (Array.isArray(parsed)) { setAccounts(parsed); setLoading(false); return; }
        }
      } catch {}
      // Fallback: load from legacy fields
      if (s?.bankName || s?.bankAccountNumber) {
        setAccounts([{
          id: "legacy", bankName: s.bankName || "", accountName: s.bankAccountName || "",
          accountNumber: s.bankAccountNumber || "", instructions: "", qrCode: "", isActive: true,
        }]);
      }
    }
    if (ordersRes.ok) {
      const all = await ordersRes.json();
      setPendingOrders(all.filter((o: any) => o.paymentMethod === "BANK_TRANSFER" && o.paymentScreenshot));
    }
    setLoading(false);
  };

  const addAccount = () => {
    setAccounts(prev => [...prev, {
      id: Date.now().toString(), bankName: "", accountName: "",
      accountNumber: "", instructions: "", qrCode: "", isActive: true,
    }]);
  };

  const updateAccount = (id: string, field: string, value: string | boolean) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const handleQrUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQr(id);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) updateAccount(id, "qrCode", data.url);
    } catch {}
    setUploadingQr(null);
  };

  const saveAccounts = async () => {
    setSaving(true);
    await fetch("/api/admin/settings/appearance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bankAccounts: JSON.stringify(accounts),
        bankTransferEnabled: accounts.some(a => a.isActive),
        bankName: accounts[0]?.bankName || "",
        bankAccountName: accounts[0]?.accountName || "",
        bankAccountNumber: accounts[0]?.accountNumber || "",
      }),
    });
    setSaving(false);
    alert("✅ تم حفظ طرق الدفع بنجاح!");
  };

  const verifyPayment = async (orderId: string, imageUrl: string) => {
    setVerifying(orderId);
    try {
      const res = await fetch("/api/admin/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, imageUrl }),
      });
      const data = await res.json();
      setVerifyResult(prev => ({ ...prev, [orderId]: data }));
    } catch {}
    setVerifying(null);
  };

  const manualVerify = async (orderId: string, verified: boolean) => {
    await fetch("/api/admin/verify-payment", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, verified }),
    });
    fetchData();
  };

  if (loading) return <div className="p-20 text-center font-black text-gray-400 animate-pulse">جاري التحميل...</div>;

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#0D3B47] p-10 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2 flex items-center gap-3"><CreditCard className="text-[#F29124]" size={32} />إدارة طرق الدفع الإلكتروني</h2>
          <p className="text-white/50 text-sm">أضف حسابات التحويل البنكي والـ QR Code — سيظهر للعملاء أثناء الشراء</p>
        </div>
        <div className="flex gap-3 relative z-10">
          <button onClick={() => setActiveTab("accounts")} className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === "accounts" ? "bg-white text-[#0F172A]" : "bg-white/10 text-white hover:bg-white/20"}`}>
            الحسابات البنكية
          </button>
          <button onClick={() => setActiveTab("orders")} className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === "orders" ? "bg-white text-[#0F172A]" : "bg-white/10 text-white hover:bg-white/20"}`}>
            إيصالات التحويل ({pendingOrders.length})
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A021]/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* Accounts Tab */}
      {activeTab === "accounts" && (
        <div className="space-y-6">
          {accounts.map((acc) => (
            <div key={acc.id} className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#C5A021]/10 flex items-center justify-center"><CreditCard className="text-[#C5A021]" size={20} /></div>
                  <div>
                    <p className="font-black text-[#0F172A]">حساب بنكي</p>
                    <p className="text-xs text-gray-400">{acc.accountNumber || "لم يُضف رقم الحساب"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => updateAccount(acc.id, "isActive", !acc.isActive)}
                      className={`w-12 h-6 rounded-full transition-all relative ${acc.isActive ? "bg-green-500" : "bg-gray-300"}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${acc.isActive ? "right-0.5" : "left-0.5"}`} />
                    </div>
                    <span className="text-xs font-bold text-gray-500">{acc.isActive ? "مفعّل" : "معطّل"}</span>
                  </label>
                  <button onClick={() => removeAccount(acc.id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {[
                  { field: "bankName", label: "اسم البنك / جهة الدفع", placeholder: "مثال: بنك الخرطوم، Fawry، Vodafone Cash" },
                  { field: "accountName", label: "اسم صاحب الحساب", placeholder: "الاسم بالكامل" },
                  { field: "accountNumber", label: "رقم الحساب / الهاتف / IBAN", placeholder: "XXXX-XXXX-XXXX" },
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label className="text-xs font-black text-gray-500 block mb-2">{label}</label>
                    <input value={(acc as any)[field]} onChange={e => updateAccount(acc.id, field, e.target.value)}
                      placeholder={placeholder}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#C5A021] focus:ring-2 focus:ring-[#C5A021]/10 transition-all" />
                  </div>
                ))}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="text-xs font-black text-gray-500 block mb-2">تعليمات التحويل (اختياري)</label>
                  <textarea value={acc.instructions || ""} onChange={e => updateAccount(acc.id, "instructions", e.target.value)}
                    placeholder="مثال: يرجى كتابة رقم الطلب في خانة الملاحظات..."
                    rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#C5A021] transition-all resize-none" />
                </div>
              </div>

              {/* QR Code Upload */}
              <div className="border-t border-gray-100 pt-6">
                <p className="text-sm font-black text-[#0F172A] mb-3 flex items-center gap-2">
                  <QrCode size={16} className="text-[#C5A021]" />
                  QR Code للدفع الفوري (اختياري)
                </p>
                <div className="flex items-start gap-6">
                  <label className={`flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${acc.qrCode ? "border-green-400 bg-green-50" : "border-gray-300 bg-gray-50 hover:border-[#C5A021]"}`}>
                    {uploadingQr === acc.id ? (
                      <div className="w-8 h-8 border-4 border-[#C5A021] border-t-transparent rounded-full animate-spin" />
                    ) : acc.qrCode ? (
                      <Image src={acc.qrCode} alt="QR" width={120} height={120} className="object-contain rounded-xl" />
                    ) : (
                      <>
                        <QrCode size={32} className="text-gray-300 mb-2" />
                        <p className="text-[10px] font-bold text-gray-400 text-center">ارفع QR Code</p>
                      </>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleQrUpload(acc.id, e)} disabled={uploadingQr === acc.id} />
                  </label>
                  {acc.qrCode && (
                    <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="text-xs font-black text-green-700 flex items-center gap-2"><CheckCircle2 size={14} />تم رفع QR Code بنجاح</p>
                      <p className="text-[10px] text-green-600 mt-1">سيظهر للعميل في صفحة الدفع لمسحه وإتمام الدفع فوراً</p>
                      <button onClick={() => updateAccount(acc.id, "qrCode", "")} className="mt-2 text-[10px] text-red-500 font-bold underline">إزالة QR</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <button onClick={addAccount} className="flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-dashed border-[#C5A021]/30 text-[#C5A021] font-black text-sm hover:border-[#C5A021] hover:bg-[#C5A021]/5 transition-all">
              <Plus size={18} />إضافة حساب بنكي جديد
            </button>
            <button onClick={saveAccounts} disabled={saving} className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#C5A021] to-[#0F172A] text-white font-black text-sm hover:opacity-90 transition-all shadow-xl disabled:opacity-50">
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />جاري الحفظ...</> : <><CheckCircle2 size={18} />حفظ طرق الدفع</>}
            </button>
          </div>
        </div>
      )}

      {/* Pending Payment Verification Tab */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {pendingOrders.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-20 text-center shadow-xl border border-gray-100">
              <CreditCard size={48} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold">لا توجد إيصالات تحويل بانتظار المراجعة</p>
            </div>
          ) : pendingOrders.map((order: any) => {
            const result = verifyResult[order.id];
            const isVerifying = verifying === order.id;
            return (
              <div key={order.id} className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Order Info */}
                  <div className="flex-grow space-y-4 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-black text-[#0F172A] text-lg">طلب #{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">تفاصيل العميل والتحويل المالي المرفق</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${order.paymentVerified ? "bg-green-50 text-green-600 border border-green-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}>
                        {order.paymentVerified ? "✅ موثّق ومكتمل" : "⏳ في انتظار تأكيد التحويل"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        ["العميل", order.customerName || order.customer?.name || "عميل مرسال"],
                        ["الهاتف", order.phone],
                        ["المبلغ المطلوب", `${order.totalAmount?.toLocaleString()} ج.س`],
                        ["تاريخ الطلب", new Date(order.createdAt).toLocaleDateString("ar-EG")],
                      ].map(([label, val]) => (
                        <div key={label} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4">
                          <p className="text-[9px] text-gray-400 font-black uppercase">{label}</p>
                          <p className="text-xs font-black text-[#0F172A] mt-1">{val}</p>
                        </div>
                      ))}
                    </div>

                    {/* AI Verification Section */}
                    <div className="mt-4 p-5 rounded-3xl border border-[#C5A021]/10 bg-[#C5A021]/5 space-y-4 relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-2">
                          <Zap size={18} className="text-[#C5A021] animate-pulse" />
                          <div>
                            <p className="text-xs font-black text-[#0F172A]">مساعد مرسال الذكي للتحقق من الإيصالات (AI)</p>
                            <p className="text-[9px] font-bold text-gray-400 mt-0.5">تطوير OCR ومعالجة الصور المتقدمة</p>
                          </div>
                        </div>
                        <button
                          onClick={() => verifyPayment(order.id, order.paymentScreenshot)}
                          disabled={isVerifying}
                          className="px-5 py-2.5 bg-[#C5A021] text-white rounded-xl font-black text-[10px] shadow-lg shadow-[#C5A021]/20 hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-1.5 self-start"
                        >
                          {isVerifying ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              جاري الفحص...
                            </>
                          ) : (
                            <>
                              <Zap size={12} />
                              التحقق الذكي بالذكاء الاصطناعي
                            </>
                          )}
                        </button>
                      </div>

                      {/* AI Result View */}
                      {result && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4 border-t border-[#C5A021]/10 relative z-10">
                          {/* Confidence Score circular visual */}
                          <div className="md:col-span-3 flex flex-col items-center justify-center text-center bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                            <div className="relative w-20 h-20 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="40" cy="40" r="34" className="stroke-gray-100 fill-none" strokeWidth="6" />
                                <circle cx="40" cy="40" r="34" className="fill-none transition-all duration-1000" strokeWidth="6"
                                  stroke={result.confidence >= 75 ? "#10B981" : result.confidence >= 40 ? "#F59E0B" : "#EF4444"}
                                  strokeDasharray={2 * Math.PI * 34}
                                  strokeDashoffset={2 * Math.PI * 34 * (1 - result.confidence / 100)} />
                              </svg>
                              <span className="absolute text-base font-black text-[#0F172A]">{result.confidence}%</span>
                            </div>
                            <p className="text-[9px] font-black text-gray-400 mt-2">نسبة المطابقة والثقة</p>
                            <span className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase ${
                              result.suggestion === "APPROVE" ? "bg-green-50 text-green-600 border border-green-100" :
                              result.suggestion === "REVIEW" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                            }`}>
                              {result.suggestion === "APPROVE" ? "موصى بالقبول" : result.suggestion === "REVIEW" ? "يتطلب مراجعة" : "مرفوض تلقائياً"}
                            </span>
                          </div>

                          {/* Matching Flags & Extracted OCR */}
                          <div className="md:col-span-9 space-y-3">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">ملاحظات ونتائج تحليل الصورة</p>
                            <div className="space-y-1">
                              {result.analysis?.flags?.map((flag: string, i: number) => (
                                <div key={i} className="text-[10px] font-bold text-slate-700 flex items-start gap-1.5">
                                  <span>{flag}</span>
                                </div>
                              ))}
                            </div>

                            <div className="p-3 bg-slate-900 rounded-xl text-slate-300 font-mono text-[8px] max-h-24 overflow-y-auto leading-relaxed">
                              <p className="text-white/40 font-black text-[7px] mb-1">النص المستخرج من الإيصال (OCR):</p>
                              {result.ocrText || "[لم يتم العثور على نصوص مقروءة]"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Screenshot Preview */}
                  <div className="w-full lg:w-56 shrink-0 space-y-4">
                    <p className="text-xs font-black text-gray-500">صورة الإيصال المرفوعة</p>
                    <div className="w-full h-56 bg-slate-50 border border-gray-200 rounded-2xl overflow-hidden relative group">
                      <Image src={order.paymentScreenshot} alt="إيصال" fill className="object-contain transition-transform duration-500 group-hover:scale-105" />
                      <a href={order.paymentScreenshot} target="_blank" rel="noopener noreferrer"
                        className="absolute bottom-3 right-3 w-10 h-10 bg-black/60 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-[#C5A021] transition-all shadow-lg">
                        <Eye size={16} />
                      </a>
                    </div>

                    {/* Manual Actions */}
                    <div className="flex gap-2">
                      <button onClick={() => manualVerify(order.id, true)} className="flex-1 py-3 rounded-xl bg-green-50 text-green-600 font-black text-xs flex items-center justify-center gap-1.5 hover:bg-green-500 hover:text-white border border-green-100 hover:border-green-500 transition-all shadow-sm">
                        <CheckCircle2 size={14} />قبول وتأكيد
                      </button>
                      <button onClick={() => manualVerify(order.id, false)} className="flex-1 py-3 rounded-xl bg-red-50 text-red-500 font-black text-xs flex items-center justify-center gap-1.5 hover:bg-red-500 hover:text-white border border-red-100 hover:border-red-500 transition-all shadow-sm">
                        <XCircle size={14} />رفض وإلغاء
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
