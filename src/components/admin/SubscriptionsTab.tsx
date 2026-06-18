"use client";

import React, { useState, useEffect } from "react";
import { Gem, Check, X, ShieldCheck, Plus, Trash2, Edit2, Users, Calendar, DollarSign, Percent, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SubscriptionsTab({ showToast }: { showToast?: (message: string, type?: "info" | "error" | "success") => void } = {}) {
  const [activeSubTab, setActiveSubTab] = useState<"vendors" | "plans">("vendors");
  const [plans, setPlans] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Plan Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planFormData, setPlanFormData] = useState({
    name: "",
    price: 0,
    durationDays: 30,
    isTrial: false,
    billingCycle: "MONTHLY",
    accountType: "FIXED",
    maxProducts: 0
  });

  // Vendor Subscription Modal State
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [vendorFormData, setVendorFormData] = useState({
    planId: "",
    customSubscriptionFee: "",
    subscriptionEndsAt: "",
    maxProducts: 50
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, vendorsRes] = await Promise.all([
        fetch("/api/admin/subscriptions/plans"),
        fetch("/api/admin/vendors")
      ]);
      
      if (plansRes.ok) {
        const data = await plansRes.json();
        setPlans(Array.isArray(data) ? data : []);
      }
      if (vendorsRes.ok) {
        const data = await vendorsRes.json();
        setVendors(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
      if (showToast) showToast("حدث خطأ أثناء تحميل البيانات", "error");
    }
    setLoading(false);
  };

  // --- PLAN OPERATIONS ---
  const handleOpenPlanModal = (plan?: any) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanFormData({
        name: plan.name,
        price: plan.price,
        durationDays: plan.durationDays,
        isTrial: plan.isTrial,
        billingCycle: plan.billingCycle || "MONTHLY",
        accountType: plan.accountType || "FIXED",
        maxProducts: plan.maxProducts || 0
      });
    } else {
      setEditingPlan(null);
      setPlanFormData({ 
        name: "", 
        price: 0, 
        durationDays: 30, 
        isTrial: false,
        billingCycle: "MONTHLY",
        accountType: "FIXED",
        maxProducts: 0
      });
    }
    setIsPlanModalOpen(true);
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingPlan ? "PATCH" : "POST";
    const body = editingPlan ? { id: editingPlan.id, ...planFormData } : planFormData;

    const res = await fetch("/api/admin/subscriptions/plans", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      setIsPlanModalOpen(false);
      fetchData();
      if (showToast) showToast("تم حفظ باقة الاشتراك بنجاح! 🎉", "success");
    } else {
      if (showToast) showToast("حدث خطأ أثناء حفظ الباقة", "error");
    }
  };

  const handlePlanDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الباقة؟")) return;
    
    const res = await fetch(`/api/admin/subscriptions/plans?id=${id}`, {
      method: "DELETE"
    });

    if (res.ok) {
      fetchData();
      if (showToast) showToast("تم حذف الباقة بنجاح", "success");
    } else {
      if (showToast) showToast("حدث خطأ أثناء الحذف", "error");
    }
  };

  // --- VENDOR OPERATIONS ---
  const handleOpenVendorModal = (vendor: any) => {
    setSelectedVendor(vendor);
    
    // Format date for datetime-local input
    let dateStr = "";
    if (vendor.subscriptionEndsAt) {
      const d = new Date(vendor.subscriptionEndsAt);
      // Format to YYYY-MM-DD
      dateStr = d.toISOString().split("T")[0];
    }

    setVendorFormData({
      planId: vendor.planId || "",
      customSubscriptionFee: vendor.customSubscriptionFee !== null ? String(vendor.customSubscriptionFee) : "",
      subscriptionEndsAt: dateStr,
      maxProducts: vendor.plan?.maxProducts || 50
    });
    setIsVendorModalOpen(true);
  };

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    try {
      const endsAt = vendorFormData.subscriptionEndsAt ? new Date(vendorFormData.subscriptionEndsAt).toISOString() : null;
      const fee = vendorFormData.customSubscriptionFee === "" ? null : parseFloat(vendorFormData.customSubscriptionFee);

      const res = await fetch("/api/admin/vendors/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: selectedVendor.id,
          planId: vendorFormData.planId || null,
          customSubscriptionFee: fee,
          subscriptionEndsAt: endsAt,
          action: "update_subscription"
        })
      });

      if (res.ok) {
        setIsVendorModalOpen(false);
        fetchData();
        if (showToast) showToast("تم تحديث اشتراك التاجر بنجاح! 🚀", "success");
      } else {
        const err = await res.json();
        if (showToast) showToast(err.error || "فشل التحديث", "error");
      }
    } catch (e) {
      console.error(e);
      if (showToast) showToast("حدث خطأ أثناء الاتصال بالخادم", "error");
    }
  };

  const handleCancelVendorSubscription = async (vendorId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء اشتراك هذا التاجر فوراً؟")) return;

    try {
      const res = await fetch("/api/admin/vendors/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          action: "cancel"
        })
      });

      if (res.ok) {
        fetchData();
        if (showToast) showToast("تم إلغاء الاشتراك بنجاح", "success");
      } else {
        if (showToast) showToast("حدث خطأ أثناء إلغاء الاشتراك", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-gray-400">جاري تحميل لوحة الاشتراكات...</div>;

  return (
    <div className="space-y-8" dir="rtl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#C5A021] text-white flex items-center justify-center shadow-xl">
            <Gem size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#0F172A]">إدارة الاشتراكات والخطط</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">SaaS & Vendor Subscriptions Manager</p>
          </div>
        </div>
      </div>

      {/* Sub-tabs selectors */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab("vendors")}
          className={cn(
            "py-3 px-6 font-black text-sm border-b-2 transition-colors flex items-center gap-2",
            activeSubTab === "vendors" 
              ? "border-[#C5A021] text-[#C5A021]" 
              : "border-transparent text-gray-400 hover:text-gray-600"
          )}
        >
          <Users size={16} />
          اشتراكات التجار والخصومات
        </button>
        <button
          onClick={() => setActiveSubTab("plans")}
          className={cn(
            "py-3 px-6 font-black text-sm border-b-2 transition-colors flex items-center gap-2",
            activeSubTab === "plans" 
              ? "border-[#C5A021] text-[#C5A021]" 
              : "border-transparent text-gray-400 hover:text-gray-600"
          )}
        >
          <Gem size={16} />
          باقات الـ SaaS والميزات
        </button>
      </div>

      {/* Contents */}
      {activeSubTab === "vendors" ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/40 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-black text-base text-[#0F172A]">قائمة المشتركين الحاليين</h3>
            <span className="text-xs bg-gray-50 text-gray-500 font-bold px-3 py-1 rounded-full">{vendors.length} تاجر مسجل</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-[0.1em]">
                  <th className="p-5">اسم المتجر / المالك</th>
                  <th className="p-5">باقة الاشتراك الحالية</th>
                  <th className="p-5">رسوم الاشتراك المخصصة</th>
                  <th className="p-5">تاريخ انتهاء الصلاحية</th>
                  <th className="p-5">حالة الصلاحية</th>
                  <th className="p-5 text-left">التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {vendors.map((v) => {
                  const endsAt = v.subscriptionEndsAt ? new Date(v.subscriptionEndsAt) : null;
                  const isExpired = endsAt ? endsAt < new Date() : true;
                  const hasCustomFee = v.customSubscriptionFee !== null;

                  return (
                    <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 text-[#0F172A] font-black flex items-center justify-center text-sm overflow-hidden shrink-0">
                            {v.logo ? <img src={v.logo} alt="" className="w-full h-full object-cover" /> : v.storeName[0]}
                          </div>
                          <div>
                            <p className="font-black text-[#0F172A]">{v.storeName}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{v.user?.email || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="font-bold text-gray-700">
                          {v.plan?.name || "الباقة المجانية الافتراضية"}
                        </span>
                      </td>
                      <td className="p-5">
                        {hasCustomFee ? (
                          <div className="flex flex-col">
                            <span className="font-black text-green-600">{v.customSubscriptionFee.toLocaleString()} ج.س</span>
                            <span className="text-[9px] text-amber-600 font-bold">خصم مخصص للأدمن</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">افتراضي ({v.plan?.price?.toLocaleString() || 0} ج.س)</span>
                        )}
                      </td>
                      <td className="p-5 font-bold text-gray-600">
                        {v.subscriptionEndsAt ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-gray-400" />
                            <span>{endsAt?.toLocaleDateString("ar-SA")}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">بلا حدود (تجريبي منتهي)</span>
                        )}
                      </td>
                      <td className="p-5">
                        {v.subscriptionEndsAt ? (
                          isExpired ? (
                            <span className="bg-red-50 text-red-500 font-black px-2.5 py-1 rounded-lg text-[10px]">منتهي الصلاحية ⛔</span>
                          ) : (
                            <span className="bg-green-50 text-green-600 font-black px-2.5 py-1 rounded-lg text-[10px]">نشط وصالح ✅</span>
                          )
                        ) : (
                          <span className="bg-gray-50 text-gray-400 font-black px-2.5 py-1 rounded-lg text-[10px]">غير مفعل</span>
                        )}
                      </td>
                      <td className="p-5 text-left">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleOpenVendorModal(v)}
                            className="px-3.5 py-2 bg-gray-50 hover:bg-[#C5A021] hover:text-white rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5"
                          >
                            <Edit2 size={12} />
                            تعديل الاشتراك / خصم
                          </button>
                          {v.planId && (
                            <button
                              onClick={() => handleCancelVendorSubscription(v.id)}
                              className="p-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all"
                              title="إلغاء الاشتراك فوراً"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // SaaS plans view
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white text-[#0F172A] border-gray-100 shadow-xl shadow-gray-100/40 p-8 rounded-[2.5rem] border relative overflow-hidden transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black">{plan.name}</h3>
                    <button onClick={() => handlePlanDelete(plan.id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  
                  {plan.isTrial && (
                    <span className="inline-block bg-green-50 text-green-600 text-[10px] font-black px-3 py-1 rounded-lg mb-3">باقة تجريبية (Trial)</span>
                  )}

                  <div className="text-[10px] text-gray-400 font-bold mb-4 space-y-1">
                    <p>دورة الفوترة: {plan.billingCycle === "YEARLY" ? "سنوي" : "شهري"}</p>
                    <p>النوع: {plan.accountType === "SALES_PERCENTAGE" ? "نسبة من المبيعات" : plan.accountType === "PRODUCT_LIMIT" ? "حسب عدد المنتجات" : "قيمة اشتراك ثابتة"}</p>
                    {plan.maxProducts > 0 && <p>الحد الأقصى للمنتجات: {plan.maxProducts} منتج</p>}
                  </div>

                  <div className="flex items-end gap-1 mb-8 mt-2">
                    <span className="text-3xl font-black">{plan.price.toLocaleString()}</span>
                    <span className="text-[10px] font-bold mb-1 text-gray-400">ج.س / {plan.durationDays} يوم</span>
                  </div>
                </div>

                <button onClick={() => handleOpenPlanModal(plan)} className="w-full py-4 rounded-xl font-black text-xs transition-all bg-gray-50 text-[#0F172A] hover:bg-[#0F172A] hover:text-white flex items-center justify-center gap-2 border border-gray-100">
                  <Edit2 size={14} /> تعديل باقة الاشتراك
                </button>
              </div>
            ))}

            <button onClick={() => handleOpenPlanModal()} className="border-4 border-dashed border-gray-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 group hover:border-[#C5A021] transition-all bg-white min-h-[300px]">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-[#C5A021]/10 transition-colors">
                <Plus size={28} className="text-gray-300 group-hover:text-[#C5A021]" />
              </div>
              <p className="text-xs font-black text-gray-400 group-hover:text-[#C5A021]">إضافة باقة SaaS جديدة</p>
            </button>
          </div>
        </div>
      )}

      {/* PLAN EDIT/ADD MODAL */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPlanModalOpen(false)}></div>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-300">
            <h3 className="text-lg font-black text-[#0F172A] mb-6">{editingPlan ? "تعديل باقة الـ SaaS" : "إضافة باقة جديدة"}</h3>
            <form onSubmit={handlePlanSubmit} className="space-y-4 text-xs font-bold text-gray-700">
              <div>
                <label className="block mb-1">اسم الباقة</label>
                <input required type="text" value={planFormData.name} onChange={e => setPlanFormData({...planFormData, name: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-[#C5A021]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">السعر (ج.س)</label>
                  <input required type="number" min="0" value={planFormData.price} onChange={e => setPlanFormData({...planFormData, price: Number(e.target.value)})} className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-[#C5A021]" />
                </div>
                <div>
                  <label className="block mb-1">المدة (أيام)</label>
                  <input required type="number" min="1" value={planFormData.durationDays} onChange={e => setPlanFormData({...planFormData, durationDays: Number(e.target.value)})} className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-[#C5A021]" />
                </div>
              </div>
              <div>
                <label className="block mb-1">دورة الفوترة</label>
                <select 
                  value={planFormData.billingCycle} 
                  onChange={e => setPlanFormData({...planFormData, billingCycle: e.target.value})} 
                  className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-[#C5A021]"
                >
                  <option value="MONTHLY">شهري (Monthly)</option>
                  <option value="YEARLY">سنوي (Annually)</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">طريقة احتساب الاشتراك</label>
                <select 
                  value={planFormData.accountType} 
                  onChange={e => setPlanFormData({...planFormData, accountType: e.target.value})} 
                  className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-[#C5A021]"
                >
                  <option value="FIXED">قيمة اشتراك ثابتة (Fixed SaaS Fee)</option>
                  <option value="SALES_PERCENTAGE">نسبة مقتطعة من المبيعات (Sales Commission)</option>
                  <option value="PRODUCT_LIMIT">حسب سقف المنتجات الأقصى (Product limit tier)</option>
                </select>
              </div>
              {planFormData.accountType === "PRODUCT_LIMIT" && (
                <div>
                  <label className="block mb-1">الحد الأقصى للمنتجات المسموحة</label>
                  <input 
                    required 
                    type="number" 
                    min="1" 
                    value={planFormData.maxProducts} 
                    onChange={e => setPlanFormData({...planFormData, maxProducts: Number(e.target.value)})} 
                    className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-[#C5A021]" 
                  />
                </div>
              )}
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isTrial" checked={planFormData.isTrial} onChange={e => setPlanFormData({...planFormData, isTrial: e.target.checked})} className="w-5 h-5 accent-[#C5A021]" />
                <label htmlFor="isTrial" className="cursor-pointer">تحديد كباقة تجريبية مجانية (Trial)</label>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-[#C5A021] text-white py-3 rounded-xl font-black hover:bg-[#0F172A] transition-all">حفظ الباقة</button>
                <button type="button" onClick={() => setIsPlanModalOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-xl font-black hover:bg-gray-200 transition-all">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VENDOR CUSTOM SUBSCRIPTION MODAL */}
      {isVendorModalOpen && selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsVendorModalOpen(false)}></div>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-300">
            <h3 className="text-lg font-black text-[#0F172A] mb-1">تعديل اشتراك التاجر</h3>
            <p className="text-[10px] text-gray-400 mb-6 font-bold uppercase tracking-widest">تخصيص الخصومات وفترة الصلاحية لـ: {selectedVendor.storeName}</p>
            
            <form onSubmit={handleVendorSubmit} className="space-y-4 text-xs font-bold text-gray-700">
              <div>
                <label className="block mb-1">تعيين باقة الاشتراك</label>
                <select
                  value={vendorFormData.planId}
                  onChange={e => setVendorFormData({...vendorFormData, planId: e.target.value})}
                  className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-[#C5A021]"
                >
                  <option value="">لا يوجد (الباقة الافتراضية)</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.price.toLocaleString()} ج.س)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">رسوم اشتراك مخصصة (الخصم)</label>
                <input 
                  type="number" 
                  placeholder="اترك فارغاً لتطبيق سعر الباقة الافتراضي" 
                  value={vendorFormData.customSubscriptionFee} 
                  onChange={e => setVendorFormData({...vendorFormData, customSubscriptionFee: e.target.value})} 
                  className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-[#C5A021] placeholder-gray-300" 
                />
                <p className="text-[10px] text-amber-600 font-bold mt-1">⚠️ إدخال رقم هنا سيعتبر خصماً مخصصاً للتاجر ويلغي السعر الأصلي للباقة.</p>
              </div>

              <div>
                <label className="block mb-1">تاريخ انتهاء الصلاحية</label>
                <input 
                  type="date"
                  value={vendorFormData.subscriptionEndsAt}
                  onChange={e => setVendorFormData({...vendorFormData, subscriptionEndsAt: e.target.value})}
                  className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-[#C5A021]"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-[#C5A021] text-white py-3 rounded-xl font-black hover:bg-[#0F172A] transition-all">تحديث الاشتراك</button>
                <button type="button" onClick={() => setIsVendorModalOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-xl font-black hover:bg-gray-200 transition-all">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
