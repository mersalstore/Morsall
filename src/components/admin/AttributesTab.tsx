"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit2, Trash2, Settings2, Hash, Type, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Attribute {
  id: string;
  name: string;
  type: string;
  values: string[];
  options?: Array<{ value: string }>;
}

export default function AttributesTab() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "TEXT",
    values: ""
  });

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      const res = await fetch("/api/admin/attributes");
      const data = await res.json();
      setAttributes(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingAttr ? "PATCH" : "POST";
    const body = {
      ...(editingAttr && { id: editingAttr.id }),
      name: formData.name,
      type: formData.type,
      options: formData.values.split(",").map(v => v.trim()).filter(v => v)
    };

    try {
      const res = await fetch("/api/admin/attributes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchAttributes();
        setIsModalOpen(false);
        setEditingAttr(null);
        setFormData({ name: "", type: "TEXT", values: "" });
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه السمة؟")) return;
    try {
      const res = await fetch("/api/admin/attributes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchAttributes();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="p-20 text-center">جاري التحميل...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-[#021D24]">سمات المنتجات</h2>
        <button 
          onClick={() => { setEditingAttr(null); setFormData({ name: "", type: "TEXT", values: "" }); setIsModalOpen(true); }}
          className="bg-[#1089A4] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-[#021D24] transition-all"
        >
          <Plus size={20} className="inline-block ml-2" />
          إضافة سمة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attributes.map((attr) => (
          <div key={attr.id} className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/40 border border-gray-100 group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#1089A4]/10 text-[#1089A4] flex items-center justify-center">
                <Settings2 size={24} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  setEditingAttr(attr);
                  setFormData({ name: attr.name, type: attr.type, values: attr.values.join(", ") });
                  setIsModalOpen(true);
                }} className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-[#1089A4] hover:text-white transition-all"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(attr.id)} className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
              </div>
            </div>
            <h3 className="text-lg font-black text-[#021D24] mb-2">{attr.name}</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">النوع: {attr.type}</p>
            <div className="flex flex-wrap gap-2">
              {(attr.options || attr.values || []).map((v: any, i: number) => (
                <span key={i} className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-lg border border-gray-100">{typeof v === "string" ? v : v.value}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Placeholder */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-[#021D24]/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-3xl">
               <h3 className="text-2xl font-black mb-8">{editingAttr ? "تعديل سمة" : "إضافة سمة"}</h3>
               <form onSubmit={handleSubmit} className="space-y-6">
                  <input 
                    placeholder="اسم السمة (مثلاً: اللون، المقاس)" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-[#1089A4]"
                    required
                  />
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none"
                  >
                    <option value="TEXT">نصي (Text)</option>
                    <option value="SELECT">قائمة منسدلة (Select)</option>
                    <option value="COLOR">لون (Color)</option>
                  </select>
                  <textarea 
                    placeholder="القيم (افصل بينها بفاصلة ,)" 
                    value={formData.values} 
                    onChange={e => setFormData({...formData, values: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 min-h-[100px] outline-none"
                  />
                  <button className="w-full py-5 bg-[#1089A4] text-white rounded-2xl font-black shadow-xl">حفظ</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
