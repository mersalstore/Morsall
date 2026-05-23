"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/lib/NotificationContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: any) => {
    await markAsRead(notification.id);
    if (notification.link) {
      router.push(notification.link);
    }
    setIsOpen(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "order": return "shopping_bag";
      case "withdrawal": return "payments";
      case "payment": return "credit_card";
      case "vendor": return "store";
      case "system": return "settings";
      case "transfer": return "swap_horiz";
      default: return "notifications";
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} د`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `منذ ${diffHours} س`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `منذ ${diffDays} ي`;
    return date.toLocaleDateString("ar-EG");
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-[#C5A021] transition-all shadow-sm"
        aria-label="الإشعارات"
      >
        <span className="material-symbols-rounded text-xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-lg animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[999]"
            dir="rtl"
          >
            <div className="p-4 bg-[#0F172A] text-white flex items-center justify-between">
              <h3 className="font-black text-sm flex items-center gap-2">
                <span className="material-symbols-rounded text-[#C5A021] text-lg">notifications</span>
                الإشعارات
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[9px] font-black text-[#C5A021] hover:underline"
                  >
                    تحديد الكل كمقروء
                  </button>
                )}
                <span className="bg-white/10 text-[9px] font-black px-2 py-0.5 rounded-lg">
                  {unreadCount} جديد
                </span>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-3 border-[#C5A021] border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="material-symbols-rounded text-3xl text-slate-200 mb-2 block">notifications_off</span>
                  <p className="text-xs font-bold text-slate-400">لا توجد إشعارات</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      "w-full text-right p-4 border-b border-slate-50 hover:bg-slate-50 transition-all flex items-start gap-3",
                      !notif.isRead && "bg-[#C5A021]/5"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                      !notif.isRead ? "bg-[#C5A021]/10 text-[#C5A021]" : "bg-slate-100 text-slate-400"
                    )}>
                      <span className="material-symbols-rounded text-lg">{getTypeIcon(notif.type)}</span>
                    </div>
                    <div className="flex-grow min-w-0 text-right">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("text-xs leading-tight", !notif.isRead ? "font-black text-[#0F172A]" : "font-bold text-slate-600")}>
                          {notif.title}
                        </p>
                        <span className="text-[8px] text-slate-400 font-bold shrink-0">{getTimeAgo(notif.createdAt)}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    </div>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#C5A021] shrink-0 mt-1.5" />
                    )}
                  </button>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-100 text-center">
                <button
                  onClick={() => { setIsOpen(false); }}
                  className="text-[9px] font-bold text-slate-400 hover:text-[#C5A021] transition-colors"
                >
                  عرض الكل
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
