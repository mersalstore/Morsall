"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Layout, 
  ChevronRight, 
  ChevronDown, 
  Monitor, 
  Eye, 
  EyeOff,
  FolderTree,
  Tags,
  Image as ImageIcon,
  Type
} from "lucide-react";
import { cn } from "@/lib/utils";
import IconPicker from "./IconPicker";

interface Category {
  id: string;
  name: string;
  icon?: string;
  image?: string;
  parentId?: string | null;
  showInNavbar: boolean;
  children?: Category[];
  _count?: {
    products: number;
  };
}

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    image: "",
    parentId: "",
    showInNavbar: false
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        console.error("Categories data is not an array:", data);
        setCategories([]);
      }
    } catch (err) {
      console.error(err);
      setCategories([]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingCategory ? "PATCH" : "POST";
    const body = editingCategory ? { id: editingCategory.id, ...formData } : formData;

    try {
      const res = await fetch("/api/admin/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchCategories();
        setIsModalOpen(false);
        resetForm();
      } else {
        const err = await res.json();
        alert(err.error || "فشل حفظ القسم");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟ سيتم حذف الأقسام الفرعية أيضاً!")) return;
    try {
      const res = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchCategories();
      else {
        const data = await res.json();
        alert(data.error || "فشل الحذف");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", icon: "", image: "", parentId: "", showInNavbar: false });
    setEditingCategory(null);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      icon: cat.icon || "",
      image: cat.image || "",
      parentId: cat.parentId || "",
      showInNavbar: cat.showInNavbar
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });
      const data = await res.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, image: data.url, icon: "" })); // Clear icon if image uploaded
      }
    } catch (err) {
      console.error(err);
      alert("فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  // Build tree structure for display
  const buildTree = (cats: Category[]) => {
    const map = new Map();
    cats.forEach(c => map.set(c.id, { ...c, children: [] }));
    const tree: Category[] = [];
    cats.forEach(c => {
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId).children.push(map.get(c.id));
      } else {
        tree.push(map.get(c.id));
      }
    });
    return tree;
  };

  const categoryTree = buildTree(categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  ));

  if (loading) return (
    <div className="p-20 text-center">
       <div className="w-12 h-12 border-4 border-[#C5A021] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
       <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">جاري تحميل الهيكلية...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
               placeholder="ابحث عن قسم..." 
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="w-full bg-white border border-gray-100 rounded-[1.5rem] pr-12 pl-6 py-4 text-sm font-bold shadow-2xl shadow-gray-200/20 outline-none focus:border-[#C5A021] transition-all"
            />
         </div>
         <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-3 bg-[#0F172A] text-white px-8 py-4 rounded-[1.5rem] font-black text-sm hover:bg-[#C5A021] transition-all shadow-2xl shadow-[#0F172A]/20 active:scale-95"
         >
            <Plus size={20} />
            إضافة قسم جديد
         </button>
      </div>

      {/* Categories Grid/List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {categoryTree.map((cat) => (
            <CategoryItem 
               key={cat.id} 
               category={cat} 
               onEdit={openEditModal} 
               onDelete={handleDelete}
            />
         ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
         {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsModalOpen(false)}
                  className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-md" 
               />
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-xl bg-white rounded-[3rem] p-10 shadow-3xl overflow-hidden"
               >
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 rounded-2xl bg-[#F29124]/10 text-[#F29124] flex items-center justify-center">
                        <FolderTree size={24} />
                     </div>
                     <h3 className="text-2xl font-black text-[#0F172A]">
                        {editingCategory ? "تعديل القسم" : "إضافة قسم جديد"}
                     </h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">اسم القسم</label>
                        <input 
                           required
                           value={formData.name}
                           onChange={e => setFormData({...formData, name: e.target.value})}
                           className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#C5A021] transition-all"
                           placeholder="مثلاً: الإلكترونيات"
                        />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الأيقونة أو الصورة</label>
                            <div className="flex gap-2">
                               <button 
                                 type="button"
                                 onClick={() => setIsIconPickerOpen(true)}
                                 className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 flex items-center justify-center gap-3 hover:bg-gray-100 transition-all"
                               >
                                 {formData.icon ? (
                                   <>
                                     <span className="material-symbols-rounded text-[#C5A021]">{formData.icon}</span>
                                     <span className="text-[10px] font-black text-[#0F172A] uppercase">{formData.icon}</span>
                                   </>
                                 ) : formData.image ? (
                                   <>
                                      <img src={formData.image} alt="" className="w-6 h-6 rounded-md object-cover" />
                                      <span className="text-[10px] font-black text-[#0F172A] uppercase">صورة مخصصة</span>
                                   </>
                                 ) : (
                                   <>
                                     <Layout className="text-gray-400" size={18} />
                                     <span className="text-[10px] font-black text-gray-400 uppercase">اختر أيقونة</span>
                                   </>
                                 )}
                               </button>
                               
                               <div className="relative">
                                  <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                  />
                                  <div className="w-14 h-14 bg-[#C5A021]/10 text-[#C5A021] rounded-2xl flex items-center justify-center hover:bg-[#C5A021]/20 transition-all">
                                     {uploading ? (
                                       <div className="w-5 h-5 border-2 border-[#C5A021] border-t-transparent rounded-full animate-spin" />
                                     ) : (
                                       <ImageIcon size={20} />
                                     )}
                                  </div>
                               </div>
                            </div>
                         </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">القسم الأب</label>
                           <select 
                              value={formData.parentId}
                              onChange={e => setFormData({...formData, parentId: e.target.value})}
                              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#C5A021] transition-all"
                           >
                              <option value="">لا يوجد (قسم رئيسي)</option>
                              {categories.filter(c => c.id !== editingCategory?.id).map(c => (
                                 <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                           </select>
                        </div>
                     </div>

                     <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <Monitor className="text-[#C5A021]" size={20} />
                           <div>
                              <p className="text-xs font-black text-[#0F172A]">العرض في الشريط العلوي</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Navbar Display Settings</p>
                           </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                           <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={formData.showInNavbar}
                              onChange={e => setFormData({...formData, showInNavbar: e.target.checked})}
                           />
                           <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-[-1.5rem] after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C5A021]" />
                        </label>
                     </div>

                     <div className="flex gap-4 pt-4">
                        <button 
                           type="button"
                           onClick={() => setIsModalOpen(false)}
                           className="flex-1 py-4 rounded-2xl font-black text-sm text-gray-400 hover:bg-gray-50 transition-all"
                        >
                           إلغاء
                        </button>
                        <button 
                           type="submit"
                           className="flex-[2] py-4 bg-[#C5A021] text-white rounded-2xl font-black text-sm hover:bg-[#0F172A] transition-all shadow-xl shadow-[#C5A021]/20"
                        >
                           {editingCategory ? "حفظ التعديلات" : "إضافة القسم"}
                        </button>
                     </div>
                  </form>

                  <AnimatePresence>
                     {isIconPickerOpen && (
                       <IconPicker 
                         onSelect={(icon) => setFormData(prev => ({ ...prev, icon, image: "" }))}
                         onClose={() => setIsIconPickerOpen(false)}
                       />
                     )}
                  </AnimatePresence>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}

function CategoryItem({ category, onEdit, onDelete }: { category: Category, onEdit: any, onDelete: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden group">
      <div className="p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-5">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all overflow-hidden",
              category.showInNavbar ? "bg-[#C5A021]/10 text-[#C5A021]" : "bg-gray-100 text-gray-400"
            )}>
              {category.image ? (
                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-rounded">{category.icon || "category"}</span>
              )}
            </div>
           <div>
              <div className="flex items-center gap-2">
                 <h4 className="text-sm font-black text-[#0F172A]">{category.name}</h4>
                 {category.showInNavbar && (
                   <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-500 rounded-lg text-[8px] font-black uppercase">
                      <Monitor size={8} />
                      Navbar
                   </div>
                 )}
              </div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                 {category._count?.products || 0} منتجاً في هذا القسم
              </p>
           </div>
        </div>

        <div className="flex items-center gap-2">
           <button onClick={() => onEdit(category)} className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-[#C5A021] hover:text-white transition-all"><Edit2 size={16} /></button>
           <button onClick={() => onDelete(category.id)} className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
           {hasChildren && (
             <button onClick={() => setIsExpanded(!isExpanded)} className="w-10 h-10 rounded-xl bg-[#0F172A]/5 text-[#0F172A] flex items-center justify-center hover:bg-[#0F172A] hover:text-white transition-all">
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
             </button>
           )}
        </div>
      </div>

      <AnimatePresence>
         {isExpanded && hasChildren && (
            <motion.div 
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: "auto", opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               className="px-6 pb-6 space-y-3"
            >
               <div className="h-px bg-gray-50 mb-4" />
               {category.children?.map(child => (
                  <div key={child.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-white">
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-gray-100">
                           {child.image ? (
                             <img src={child.image} alt={child.name} className="w-full h-full object-cover" />
                           ) : (
                             <span className="material-symbols-rounded text-gray-400 text-sm">{child.icon || "subdirectory_arrow_right"}</span>
                           )}
                        </div>
                        <span className="text-xs font-bold text-[#0F172A]">{child.name}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => onEdit(child)} className="w-8 h-8 rounded-lg bg-white text-gray-300 flex items-center justify-center hover:text-[#C5A021] transition-all shadow-sm"><Edit2 size={14} /></button>
                        <button onClick={() => onDelete(child.id)} className="w-8 h-8 rounded-lg bg-white text-gray-300 flex items-center justify-center hover:text-red-500 transition-all shadow-sm"><Trash2 size={14} /></button>
                     </div>
                  </div>
               ))}
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
