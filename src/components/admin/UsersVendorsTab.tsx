"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import AddVendorModal from "./AddVendorModal";
import ItemDetailsModal from "./ItemDetailsModal";

interface UsersVendorsTabProps {
  type: "users" | "vendors";
  data: any[];
  onAction?: (id: string, action: string) => void;
  classes: any;
  fetchData?: () => void;
  onAddProduct?: (vendorId: string) => void;
}

export default function UsersVendorsTab({ type, data, onAction, classes, fetchData, onAddProduct }: UsersVendorsTabProps) {
  const [search, setSearch] = useState("");
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleBlockAction = async (item: any) => {
    if (!confirm("هل أنت متأكد من تغيير حالة هذا الحساب؟")) return;
    setLoadingAction(item.id);
    try {
      if (type === "users") {
        const isBlocked = item.role === "BLOCKED";
        await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id, action: isBlocked ? "UNBLOCK" : "BLOCK" })
        });
      } else {
        const isSuspended = item.status === "SUSPENDED";
        await fetch("/api/admin/vendors", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id, action: isSuspended ? "ACTIVATE" : "SUSPEND" })
        });
      }
      if (fetchData) fetchData();
    } catch (e) {
      alert("حدث خطأ أثناء تنفيذ الإجراء");
    }
    setLoadingAction(null);
  };

  const filtered = data.filter(item =>
    (item.name || item.storeName || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.email || item.phone || "").toLowerCase().includes(search.toLowerCase())
  );

  const isBlocked = (item: any) => type === "users" ? item.role === "BLOCKED" : item.status === "SUSPENDED";

  return (
    <div className={cn(classes.card, "border-0 shadow-none")}>
      <AddVendorModal
        isOpen={isAddVendorOpen || !!editingItem}
        editingVendor={editingItem}
        onClose={() => { setIsAddVendorOpen(false); setEditingItem(null); }}
        onSuccess={() => { if (fetchData) fetchData(); }}
      />
      <ItemDetailsModal
        isOpen={!!viewingItem}
        type={type}
        item={viewingItem}
        onClose={() => setViewingItem(null)}
      />

      {/* Toolbar */}
      <div className="p-5 md:p-10 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white/50 border-b border-gray-100/50">
        <div className="relative flex-grow">
          <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-rounded text-[#1089A4]">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={type === "users" ? "ابحث عن عميل..." : "ابحث عن متجر..."}
            className={cn(classes.input, "pr-14 py-4")}
          />
        </div>
        {type === "vendors" && (
          <button
            onClick={() => setIsAddVendorOpen(true)}
            className={cn(classes.btnPrimary, "flex items-center justify-center gap-2 py-4 px-6 text-sm")}
          >
            <span className="material-symbols-rounded">add</span>
            إضافة مورد جديد
          </button>
        )}
      </div>

      {/* MOBILE: Card Layout */}
      <div className="md:hidden divide-y divide-gray-100">
        {filtered.map((item) => (
          <div key={item.id} className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1089A4]/10 to-[#021D24]/10 text-[#021D24] flex items-center justify-center font-black text-xl shrink-0">
              {(item.name || item.storeName || "?")[0].toUpperCase()}
            </div>
            <div className="flex-grow min-w-0">
              <p className="font-black text-[#021D24] text-sm truncate">{item.name || item.storeName}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{item.email || item.user?.email}</p>
              {isBlocked(item) && (
                <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg mt-1 inline-block">محظور</span>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setViewingItem(item)}
                className="w-9 h-9 rounded-xl bg-[#1089A4]/10 text-[#1089A4] flex items-center justify-center hover:bg-[#1089A4] hover:text-white transition-all"
                title="عرض التفاصيل"
              >
                <span className="material-symbols-rounded text-base">person_search</span>
              </button>
              {type === "vendors" && (
                <button
                  onClick={() => setEditingItem(item)}
                  className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"
                  title="تعديل بيانات المورد"
                >
                  <span className="material-symbols-rounded text-base">edit</span>
                </button>
              )}
              {type === "vendors" && onAddProduct && (
                <button
                  onClick={() => onAddProduct(item.id)}
                  className="w-9 h-9 rounded-xl bg-[#F29124]/10 text-[#F29124] flex items-center justify-center hover:bg-[#F29124] hover:text-white transition-all"
                  title="إضافة منتج لهذا المورد"
                >
                  <span className="material-symbols-rounded text-base">add_box</span>
                </button>
              )}
              <button
                onClick={() => handleBlockAction(item)}
                disabled={loadingAction === item.id}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-50",
                  isBlocked(item) ? "bg-green-100 text-green-600 hover:bg-green-500 hover:text-white" : "bg-gray-900 text-white hover:bg-red-500"
                )}
              >
                <span className="material-symbols-rounded text-base">
                  {isBlocked(item) ? "lock_open" : "block"}
                </span>
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-200">
            <span className="material-symbols-rounded text-[80px] opacity-20">people</span>
            <p className="font-black text-sm mt-4">لا توجد نتائج</p>
          </div>
        )}
      </div>

      {/* DESKTOP: Table Layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-right border-collapse min-w-[800px]">
          <thead>
            <tr className={classes.tableHeader}>
              <th className="px-8 py-6 rounded-tr-[2.5rem]">{type === "users" ? "بيانات العميل" : "اسم المتجر"}</th>
              <th className="px-8 py-6">قنوات الاتصال</th>
              <th className="px-8 py-6">{type === "users" ? "تاريخ التسجيل" : "الحالة"}</th>
              <th className="px-8 py-6 text-center rounded-tl-[2.5rem]">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/50">
            {filtered.map((item) => (
              <tr key={item.id} className={classes.tableRow}>
                <td className="px-8 py-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1089A4]/10 to-[#021D24]/10 text-[#021D24] flex items-center justify-center font-black text-xl shadow-inner border border-white">
                      {(item.name || item.storeName || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-[#021D24] text-lg leading-tight mb-1">{item.name || item.storeName}</span>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#F29124]" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {type === "users" ? (item.role || "عميل") : (item.city || "شريك مرسال")}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-8">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-rounded text-sm text-[#1089A4]">alternate_email</span>
                      <span className="font-bold text-[#021D24] text-xs">{item.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-rounded text-sm text-[#1089A4]">smartphone</span>
                      <span className="text-gray-400 text-[11px] font-black" dir="ltr">{item.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-8">
                  {type === "users" ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-[#021D24]">{new Date(item.createdAt).toLocaleDateString("ar-EG")}</span>
                      <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">تاريخ الانضمام</span>
                    </div>
                  ) : (
                    <span className={cn(
                      classes.badge,
                      item.status === 'APPROVED' ? 'bg-[#1089A4]/10 text-[#1089A4]' : 'bg-orange-50 text-orange-500'
                    )}>
                      {item.status === 'APPROVED' ? 'متجر معتمد' : item.status === 'SUSPENDED' ? 'موقوف' : 'في الانتظار'}
                    </span>
                  )}
                </td>
                <td className="px-8 py-8">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setViewingItem(item)}
                      className="w-12 h-12 rounded-[1.2rem] bg-white border border-gray-100 text-[#021D24] flex items-center justify-center hover:bg-[#021D24] hover:text-white transition-all shadow-xl"
                      title="عرض التفاصيل"
                    >
                      <span className="material-symbols-rounded text-xl">person_search</span>
                    </button>
                    {type === "vendors" && (
                      <button
                        onClick={() => setEditingItem(item)}
                        className="w-12 h-12 rounded-[1.2rem] bg-white border border-gray-100 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-xl"
                        title="تعديل بيانات المورد"
                      >
                        <span className="material-symbols-rounded text-xl">edit</span>
                      </button>
                    )}
                    {type === "vendors" && onAddProduct && (
                      <button
                        onClick={() => onAddProduct(item.id)}
                        className="w-12 h-12 rounded-[1.2rem] bg-white border border-gray-100 text-[#F29124] flex items-center justify-center hover:bg-[#F29124] hover:text-white transition-all shadow-xl"
                        title="إضافة منتج لهذا المورد"
                      >
                        <span className="material-symbols-rounded text-xl">add_box</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleBlockAction(item)}
                      disabled={loadingAction === item.id}
                      className={cn(
                        "w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-all shadow-xl disabled:opacity-50",
                        isBlocked(item) ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-900 text-white hover:bg-red-600"
                      )}
                      title={isBlocked(item) ? "فك الحظر" : "حظر الحساب"}
                    >
                      <span className="material-symbols-rounded text-xl">
                        {isBlocked(item) ? "lock_open" : "block"}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-40 flex flex-col items-center justify-center text-gray-200">
            <span className="material-symbols-rounded text-[100px] opacity-20">people</span>
            <p className="font-black text-lg uppercase tracking-[0.3em]">لا توجد نتائج مطابقة</p>
          </div>
        )}
      </div>
    </div>
  );
}
