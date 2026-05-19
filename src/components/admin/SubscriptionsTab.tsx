"use client";

import React, { useState, useEffect } from "react";
import { Gem, Check, X, ShieldCheck, Plus, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SubscriptionsTab() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    durationDays: 30,
    isTrial: false
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscriptions/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleOpenModal = (plan?: any) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        price: plan.price,
        durationDays: plan.durationDays,
        isTrial: plan.isTrial
      });
    } else {
      setEditingPlan(null);
      setFormData({ name: "", price: 0, durationDays: 30, isTrial: false });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingPlan ? "PATCH" : "POST";
    const body = editingPlan ? { id: editingPlan.id, ...formData } : formData;

    const res = await fetch("/api/admin/subscriptions/plans", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      setIsModalOpen(false);
      fetchPlans();
    } else {
      alert("حدث خطأ أثناء حفظ الباقة");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الباقة؟")) return;
    
    const res = await fetch(`/api/admin/subscriptions/plans?id=${id}`, {
      method: "DELETE"
    });

    if (res.ok) {
      fetchPlans();
    } else {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-gray-400">جاري تحميل باقات الاشتراك...</div>;

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-2xl">
               <Gem size={32} />
            </div>
            <div>
               <h2 className="text-3xl font-black text-[#0F172A]">باقات اشتراك الموردين</h2>
               <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Vendor Subscription Plans</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
         {plans.map((plan) => (
            <div key={plan.id} className="bg-white text-[#0F172A] border-gray-100 shadow-2xl shadow-gray-200/50 p-12 rounded-[3.5rem] border relative overflow-hidden transition-all duration-500 hover:scale-[1.02]">
               <div className="flex justify-between items-start mb-2">
                 <h3 className="text-2xl font-black">{plan.name}</h3>
                 <button onClick={() => handleDelete(plan.id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                   <Trash2 size={14} />
                 </button>
               </div>
               
               {plan.isTrial && (
                 <span className="inline-block bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full mb-4">باقة تجريبية</span>
               )}

               <div className="flex items-end gap-2 mb-10 mt-4">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-xs font-bold mb-1 text-gray-400">ج.س / {plan.durationDays} يوم</span>
               </div>

               <button onClick={() => handleOpenModal(plan)} className="w-full py-5 rounded-2xl font-black text-sm transition-all bg-gray-100 text-[#0F172A] hover:bg-[#0F172A] hover:text-white flex items-center justify-center gap-2">
                 <Edit2 size={16} /> تعديل الباقة
               </button>
            </div>
         ))}

         {/* Add New Plan Card */}
         <button onClick={() => handleOpenModal()} className="border-4 border-dashed border-gray-100 rounded-[3.5rem] p-12 flex flex-col items-center justify-center gap-6 group hover:border-[#C5A021] transition-all">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-[#C5A021]/10 transition-colors">
               <Plus size={32} className="text-gray-200 group-hover:text-[#C5A021]" />
            </div>
            <p className="text-sm font-black text-gray-300 group-hover:text-[#C5A021]">إضافة باقة جديدة</p>
         </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10">
            <h3 className="text-xl font-black text-[#0F172A] mb-6">{editingPlan ? "تعديل الباقة" : "إضافة باقة جديدة"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">اسم الباقة</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-xl px-4 py-2 outline-none focus:border-[#C5A021]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">السعر (ج.س)</label>
                <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border rounded-xl px-4 py-2 outline-none focus:border-[#C5A021]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">المدة (أيام)</label>
                <input required type="number" min="1" value={formData.durationDays} onChange={e => setFormData({...formData, durationDays: Number(e.target.value)})} className="w-full border rounded-xl px-4 py-2 outline-none focus:border-[#C5A021]" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isTrial" checked={formData.isTrial} onChange={e => setFormData({...formData, isTrial: e.target.checked})} className="w-5 h-5 accent-[#C5A021]" />
                <label htmlFor="isTrial" className="text-sm font-bold text-gray-700 cursor-pointer">هذه باقة تجريبية مجانية</label>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-[#C5A021] text-white py-3 rounded-xl font-black hover:bg-[#0F172A] transition-all">حفظ</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-black hover:bg-gray-200 transition-all">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
