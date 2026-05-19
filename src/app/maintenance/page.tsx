import Link from "next/link";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <div className="relative w-32 h-32 mb-12">
        <div className="absolute inset-0 bg-[#C5A021] rounded-full animate-ping opacity-20" />
        <div className="relative w-full h-full bg-[#C5A021]/10 rounded-full flex items-center justify-center border-4 border-[#C5A021]/30">
          <span className="material-symbols-rounded text-6xl text-[#C5A021]">engineering</span>
        </div>
      </div>

      <div className="max-w-xl space-y-6">
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter font-heading">
          هناك خطأ <span className="text-[#C5A021]">تقني</span> يجري إصلاحه
        </h1>
        <p className="text-white/40 text-lg md:text-xl font-medium leading-relaxed">
          نحن نقوم ببعض التحسينات لجعل تجربتك أكثر تميزاً. سنعود إليك في أقرب وقت ممكن. شكراً لك على صبرك.
        </p>
      </div>

      <div className="mt-16 flex gap-6">
        <div className="flex flex-col items-center gap-2">
           <span className="material-symbols-rounded text-[#F29124] text-4xl">verified_user</span>
           <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">Safe & Secure</span>
        </div>
      </div>
      
      <div className="mt-12">
        <Link href="/login" className="text-white/10 hover:text-[#C5A021] transition-all text-xs font-black uppercase tracking-[0.4em]">ADMIN PORTAL</Link>
      </div>
    </div>
  );
}
