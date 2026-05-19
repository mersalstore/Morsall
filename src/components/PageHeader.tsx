import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: string;
}

export default function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  return (
    <div className="relative h-[300px] md:h-[400px] bg-[#011116] overflow-hidden flex flex-col items-center justify-center p-12 text-center border-b border-white/5">
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C5A021]/10 blur-[150px] rounded-full pointer-events-none" />
       <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#F29124]/5 blur-[120px] rounded-full pointer-events-none" />
       
       <div className="relative z-10 space-y-8 animate-in fade-in slide-in-from-top-12 duration-1000">
          <div className="w-20 h-20 bg-primary/20 backdrop-blur-xl border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl">
             <span className="material-symbols-rounded text-4xl text-[#F29124]">{icon}</span>
          </div>
          <div>
             <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter font-heading mb-4">{title}</h1>
             {subtitle && (
               <p className="text-white/40 text-[10px] md:text-xs font-black uppercase tracking-[0.5em]">{subtitle}</p>
             )}
          </div>
       </div>
    </div>
  );
}
