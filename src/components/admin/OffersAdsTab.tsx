"use client";

import { useState, useEffect } from "react";

interface OfferConfig {
  campaignTitle: string;
  campaignSubtitle: string;
  campaignButtonText: string;
  campaignButtonLink: string;
  campaignHoursLeft: number;
  campaignMinutesLeft: number;
  campaignEnabled: boolean;
  offersHeroTitle: string;
  offersHeroSubtitle: string;
  offersHeroBadge: string;
  offersPageEnabled: boolean;
}

interface AdLink {
  id: string;
  label: string;
  href: string;
  color: string;
  emoji: string;
  isActive: boolean;
}

const defaultConfig: OfferConfig = {
  campaignTitle: "خصومات كبرى تصل إلى 60%",
  campaignSubtitle: "على كافة الأجهزة والإلكترونيات",
  campaignButtonText: "تـسـوق",
  campaignButtonLink: "/shop",
  campaignHoursLeft: 12,
  campaignMinutesLeft: 45,
  campaignEnabled: true,
  offersHeroTitle: "صفقات كبرى لا تتكرر",
  offersHeroSubtitle: "خصومات اليوم المحدودة",
  offersHeroBadge: "خصومات اليوم المحدودة",
  offersPageEnabled: true,
};

const defaultAdLinks: AdLink[] = [
  { id: "1", label: "العروض 🔥", href: "/offers", color: "#F29124", emoji: "bolt", isActive: true },
  { id: "2", label: "كبار المتاجر", href: "/top-vendors", color: "#1089A4", emoji: "storefront", isActive: true },
  { id: "3", label: "ابدأ تجارتك", href: "/vendor/register", color: "#021D24", emoji: "add_business", isActive: true },
];

const STORAGE_KEY_CONFIG = "mersal_offers_config";
const STORAGE_KEY_ADS = "mersal_ad_links";

export default function OffersAdsTab() {
  const [config, setConfig] = useState<OfferConfig>(defaultConfig);
  const [adLinks, setAdLinks] = useState<AdLink[]>(defaultAdLinks);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newLink, setNewLink] = useState({ label: "", href: "", color: "#1089A4", emoji: "link", isActive: true });

  useEffect(() => {
    // Load from database
    fetch("/api/site-config")
      .then(res => res.json())
      .then(data => {
        if (data.offers_config) setConfig(data.offers_config);
        if (data.ad_links) setAdLinks(data.ad_links);
      })
      .catch(err => console.error("Failed to load configs", err));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        fetch("/api/site-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "offers_config", value: config })
        }),
        fetch("/api/site-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "ad_links", value: adLinks })
        })
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  const handleAddLink = () => {
    if (!newLink.label || !newLink.href) return;
    setAdLinks(prev => [...prev, { ...newLink, id: Date.now().toString() }]);
    setNewLink({ label: "", href: "", color: "#1089A4", emoji: "link", isActive: true });
  };

  const handleRemoveLink = (id: string) => {
    setAdLinks(prev => prev.filter(l => l.id !== id));
  };

  const handleToggleLink = (id: string) => {
    setAdLinks(prev => prev.map(l => l.id === id ? { ...l, isActive: !l.isActive } : l));
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700" dir="rtl">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#021D24]">إدارة العروض والإعلانات</h2>
          <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">تحكم في الشريط الإعلاني وصفحة العروض وروابط التنقل</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 bg-[#1089A4] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#1089A4]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : saved ? (
            <span className="material-symbols-rounded text-lg">check_circle</span>
          ) : (
            <span className="material-symbols-rounded text-lg">save</span>
          )}
          {saving ? "جاري الحفظ..." : saved ? "تم الحفظ! ✨" : "حفظ جميع التغييرات"}
        </button>
      </div>

      {/* ===== SECTION 1: Campaign Bar ===== */}
      <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl space-y-8">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
          <div className="w-14 h-14 rounded-[1.5rem] bg-[#F29124]/10 text-[#F29124] flex items-center justify-center">
            <span className="material-symbols-rounded text-2xl">campaign</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-[#021D24]">شريط العروض المتحرك (Campaign Bar)</h3>
            <p className="text-xs text-gray-400 font-bold">الشريط الذي يظهر أعلى الصفحة الرئيسية</p>
          </div>
          <div className="mr-auto">
            <button
              onClick={() => setConfig(c => ({ ...c, campaignEnabled: !c.campaignEnabled }))}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs transition-all ${
                config.campaignEnabled ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
              }`}
            >
              <span className="material-symbols-rounded text-lg">
                {config.campaignEnabled ? "toggle_on" : "toggle_off"}
              </span>
              {config.campaignEnabled ? "مفعّل" : "معطّل"}
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-[#1089A4] rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="bg-[#F29124] text-[#021D24] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              عروض مرسـال
            </span>
            <p className="text-white text-sm font-black">
              {config.campaignTitle || "خصومات كبرى تصل إلى 60%"}
            </p>
          </div>
          <button className="bg-white text-[#1089A4] px-6 py-2 rounded-full text-xs font-black">
            {config.campaignButtonText || "تـسـوق"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">نص العرض الرئيسي</label>
            <input
              value={config.campaignTitle}
              onChange={e => setConfig(c => ({ ...c, campaignTitle: e.target.value }))}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#1089A4] transition-all"
              placeholder="خصومات كبرى تصل إلى 60%"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">النص التوضيحي</label>
            <input
              value={config.campaignSubtitle}
              onChange={e => setConfig(c => ({ ...c, campaignSubtitle: e.target.value }))}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#1089A4] transition-all"
              placeholder="على كافة الأجهزة والإلكترونيات"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">نص زر الرابط</label>
            <input
              value={config.campaignButtonText}
              onChange={e => setConfig(c => ({ ...c, campaignButtonText: e.target.value }))}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#1089A4] transition-all"
              placeholder="تـسـوق"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">رابط الزر</label>
            <input
              value={config.campaignButtonLink}
              onChange={e => setConfig(c => ({ ...c, campaignButtonLink: e.target.value }))}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#1089A4] transition-all"
              placeholder="/shop أو /offers"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">الساعات المتبقية للعداد</label>
            <input
              type="number" min={0} max={99}
              value={config.campaignHoursLeft}
              onChange={e => setConfig(c => ({ ...c, campaignHoursLeft: Number(e.target.value) }))}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#1089A4] transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">الدقائق المتبقية للعداد</label>
            <input
              type="number" min={0} max={59}
              value={config.campaignMinutesLeft}
              onChange={e => setConfig(c => ({ ...c, campaignMinutesLeft: Number(e.target.value) }))}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#1089A4] transition-all"
            />
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: Offers Page ===== */}
      <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl space-y-8">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
          <div className="w-14 h-14 rounded-[1.5rem] bg-[#1089A4]/10 text-[#1089A4] flex items-center justify-center">
            <span className="material-symbols-rounded text-2xl">local_offer</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-[#021D24]">صفحة العروض (/offers)</h3>
            <p className="text-xs text-gray-400 font-bold">تخصيص هيدر صفحة العروض الرئيسية</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">بادج الهيدر</label>
            <input
              value={config.offersHeroBadge}
              onChange={e => setConfig(c => ({ ...c, offersHeroBadge: e.target.value }))}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#1089A4] transition-all"
              placeholder="خصومات اليوم المحدودة"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">عنوان صفحة العروض</label>
            <input
              value={config.offersHeroTitle}
              onChange={e => setConfig(c => ({ ...c, offersHeroTitle: e.target.value }))}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#1089A4] transition-all"
              placeholder="صفقات كبرى لا تتكرر"
            />
          </div>
        </div>

        {/* Quick Link to Offers Page */}
        <div className="bg-gray-50 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-rounded text-[#1089A4]">open_in_new</span>
            <p className="text-sm font-black text-[#021D24]">معاينة صفحة العروض</p>
          </div>
          <a
            href="/offers"
            target="_blank"
            className="flex items-center gap-2 bg-[#1089A4] text-white px-6 py-2.5 rounded-xl text-xs font-black hover:bg-[#021D24] transition-all"
          >
            فتح الصفحة
            <span className="material-symbols-rounded text-sm">arrow_outward</span>
          </a>
        </div>
      </section>

      {/* ===== SECTION 3: Nav Ad Links ===== */}
      <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl space-y-8">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
          <div className="w-14 h-14 rounded-[1.5rem] bg-[#021D24]/10 text-[#021D24] flex items-center justify-center">
            <span className="material-symbols-rounded text-2xl">link</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-[#021D24]">روابط شريط التنقل الإعلاني</h3>
            <p className="text-xs text-gray-400 font-bold">الروابط التي تظهر في شريط التنقل السفلي للموقع</p>
          </div>
        </div>

        {/* Existing Links */}
        <div className="space-y-3">
          {adLinks.map((link) => (
            <div key={link.id} className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 py-4">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black"
                style={{ backgroundColor: link.color }}
              >
                <span className="material-symbols-rounded text-sm">{link.emoji}</span>
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-black text-[#021D24] truncate">{link.label}</p>
                <p className="text-[11px] text-gray-400 font-mono truncate">{link.href}</p>
              </div>
              <button
                onClick={() => handleToggleLink(link.id)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                  link.isActive ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-400"
                }`}
              >
                {link.isActive ? "نشط" : "مخفي"}
              </button>
              <button
                onClick={() => handleRemoveLink(link.id)}
                className="w-8 h-8 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
              >
                <span className="material-symbols-rounded text-sm">delete</span>
              </button>
            </div>
          ))}
        </div>

        {/* Add New Link */}
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 space-y-4">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">إضافة رابط جديد</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input
              value={newLink.label}
              onChange={e => setNewLink(l => ({ ...l, label: e.target.value }))}
              placeholder="اسم الرابط"
              className="bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#1089A4]"
            />
            <input
              value={newLink.href}
              onChange={e => setNewLink(l => ({ ...l, href: e.target.value }))}
              placeholder="/offers أو /shop"
              className="bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#1089A4]"
            />
            <input
              value={newLink.emoji}
              onChange={e => setNewLink(l => ({ ...l, emoji: e.target.value }))}
              placeholder="اسم الأيقونة"
              className="bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#1089A4]"
            />
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4">
              <label className="text-[10px] font-black text-gray-400">اللون:</label>
              <input
                type="color"
                value={newLink.color}
                onChange={e => setNewLink(l => ({ ...l, color: e.target.value }))}
                className="w-8 h-8 rounded cursor-pointer border-none"
              />
            </div>
          </div>
          <button
            onClick={handleAddLink}
            className="w-full py-3 bg-[#021D24] text-white rounded-2xl font-black text-sm hover:bg-[#1089A4] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-rounded text-lg">add_circle</span>
            إضافة الرابط
          </button>
        </div>
      </section>

      {/* Info Note */}
      <div className="bg-[#1089A4]/5 border border-[#1089A4]/20 rounded-2xl p-6 flex items-start gap-4">
        <span className="material-symbols-rounded text-[#1089A4] text-2xl mt-0.5">info</span>
        <div>
          <p className="text-sm font-black text-[#021D24] mb-1">ملاحظة مهمة</p>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            التغييرات يتم حفظها في المتصفح حالياً. لتفعيلها بشكل كامل على الموقع، يحتاج المطور لربط هذه الإعدادات بـ API. 
            يمكنك استخدام <strong>صفحة العروض (/offers)</strong> للتخصيص الكامل من الكود.
          </p>
        </div>
      </div>
    </div>
  );
}
