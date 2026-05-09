import PageHeader from "@/components/PageHeader";
import Image from "next/image";

export default function AboutPage() {
  const stats = [
    { label: "مستخدم نشط", value: "50K+", icon: "groups" },
    { label: "متجر معتمد", value: "1,200+", icon: "store" },
    { label: "ولاية نغطيها", value: "18", icon: "map" },
    { label: "شحنة ناجحة", value: "100K+", icon: "shipped" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="عن مرسال" 
        subtitle="The Sovereign Narrative" 
        icon="info" 
      />
      
      <div className="responsive-container py-24">
        {/* Our Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-primary tracking-tighter">رؤيتنا للسودان</h2>
            <p className="text-primary/60 text-lg leading-relaxed font-medium">
              مرسال ليست مجرد منصة للتجارة الإلكترونية، بل هي نبض اقتصادي جديد يهدف إلى ربط كل ركن في السودان بالعالم الرقمي. تأسست مرسال لتكون المنصة السيادية الأولى التي تضع الثقة، السرعة، والجودة في قلب كل معاملة.
            </p>
            <p className="text-primary/60 text-lg leading-relaxed font-medium">
              نحن نؤمن بأن كل تاجر سوداني يستحق الوصول إلى جمهور واسع، وأن كل مستهلك يستحق تجربة تسوق عالمية المستوى دون عناء.
            </p>
            <div className="flex gap-4">
               <div className="w-1.5 h-12 bg-accent rounded-full" />
               <p className="text-[#1089A4] font-black text-xl italic">"نحو مستقبل تجاري ذكي، آمن، ومستدام."</p>
            </div>
          </div>
          <div className="relative aspect-square bg-muted rounded-[3rem] overflow-hidden border border-border/10 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1089A4]/20 to-[#F29124]/10 z-10" />
            <div className="absolute inset-0 flex items-center justify-center p-12">
               <div className="text-center space-y-4">
                  <span className="material-symbols-rounded text-8xl text-primary opacity-20">diversity_2</span>
                  <p className="text-primary/40 font-black uppercase tracking-widest text-xs">Morsall Community</p>
               </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          {stats.map((stat, i) => (
            <div key={i} className="bg-muted p-10 rounded-[2.5rem] border border-border/5 text-center group hover:bg-white hover:shadow-2xl transition-all duration-500">
              <span className="material-symbols-rounded text-accent text-3xl mb-4 block group-hover:scale-110 transition-transform">{stat.icon}</span>
              <p className="text-3xl font-black text-primary mb-2 tracking-tighter">{stat.value}</p>
              <p className="text-xs font-black text-primary/40 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Core Values */}
        <div className="space-y-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-primary tracking-tighter mb-4">قيمنا الجوهرية</h2>
            <p className="text-primary/50 text-sm font-bold">المبادئ التي تقود كل خطوة نخطوها في مرسال</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "الثقة المطلقة", desc: "نضمن أصالة كل منتج ونحمي حقوق البائع والمشتري بصرامة.", icon: "verified" },
              { title: "الابتكار المستمر", desc: "نستخدم أحدث تقنيات الوجستيات لضمان أسرع وصول لشحنتك.", icon: "auto_awesome" },
              { title: "التمكين المحلي", desc: "ندعم المتاجر السودانية الصغيرة والمتوسطة للنمو والازدهار.", icon: "rocket_launch" },
            ].map((v, i) => (
              <div key={i} className="p-12 bg-[#021D24] text-white rounded-[3rem] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[60px] rounded-full group-hover:bg-accent/20 transition-all" />
                <span className="material-symbols-rounded text-accent text-4xl mb-6 block">{v.icon}</span>
                <h4 className="text-xl font-black mb-4 tracking-tight">{v.title}</h4>
                <p className="text-white/50 text-sm leading-relaxed font-bold">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
