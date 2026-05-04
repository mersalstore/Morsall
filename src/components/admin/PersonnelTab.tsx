"use client";

import React, { useState, useEffect } from "react";
import { Users, Truck, Plus, Trash2, ShieldCheck, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonnelTabProps {
  type: "employees" | "drivers";
}

export default function PersonnelTab({ type }: PersonnelTabProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/${type}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`هل أنت متأكد من حذف ${type === 'employees' ? 'الموظف' : 'المندوب'}؟`)) return;
    await fetch(`/api/admin/${type}`, { method: "DELETE", body: JSON.stringify({ id }) });
    fetchData();
  };

  if (loading) return <div className="p-20 text-center font-black text-gray-400 uppercase tracking-widest">جاري تحميل بيانات {type === 'employees' ? 'الموظفين' : 'المناديب'}...</div>;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-[#021D24] text-white flex items-center justify-center shadow-2xl">
               {type === 'employees' ? <Users size={32} /> : <Truck size={32} />}
            </div>
            <div>
               <h2 className="text-3xl font-black text-[#021D24]">إدارة {type === 'employees' ? 'الموظفين' : 'المناديب'}</h2>
               <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Personnel Management System</p>
            </div>
         </div>
         <button className="bg-[#1089A4] text-white px-10 py-5 rounded-[1.5rem] font-black text-sm shadow-xl hover:bg-[#021D24] transition-all flex items-center gap-3">
            <Plus size={20} />
            إضافة {type === 'employees' ? 'موظف' : 'مندوب'} جديد
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {data.map((person) => (
            <div key={person.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 group relative overflow-hidden">
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                     <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center font-black text-2xl text-[#1089A4] border border-white shadow-xl">
                        {(person.name || person.user?.name || "?")[0].toUpperCase()}
                     </div>
                     <button onClick={() => handleDelete(person.id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                  </div>
                  
                  <h3 className="text-xl font-black text-[#021D24] mb-1">{person.name || person.user?.name}</h3>
                  <div className="flex items-center gap-2 mb-6">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                     <p className="text-[10px] font-black text-[#1089A4] uppercase tracking-[0.3em]">{person.role || type}</p>
                  </div>

                  <div className="space-y-3">
                     <div className="flex items-center gap-4 text-gray-400">
                        <Mail size={16} />
                        <span className="text-xs font-bold">{person.email || person.user?.email}</span>
                     </div>
                     <div className="flex items-center gap-4 text-gray-400">
                        <Phone size={16} />
                        <span className="text-xs font-bold" dir="ltr">{person.phone || person.user?.phone || "09xxxxxxx"}</span>
                     </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                     <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-white">
                        <ShieldCheck size={14} className="text-[#1089A4]" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">نشط</span>
                     </div>
                     <button className="text-[10px] font-black text-[#1089A4] hover:underline underline-offset-4">تعديل الصلاحيات</button>
                  </div>
               </div>
               <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gray-50/50 rounded-full blur-2xl group-hover:bg-[#1089A4]/5 transition-colors" />
            </div>
         ))}
      </div>
    </div>
  );
}
