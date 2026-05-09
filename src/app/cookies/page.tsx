import PageHeader from "@/components/PageHeader";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="سياسة الكوكيز" 
        subtitle="Digital Privacy" 
        icon="cookie" 
      />
      
      <div className="responsive-container py-24 max-w-4xl">
        <div className="prose prose-slate max-w-none space-y-12">
          <section className="space-y-6">
            <h2 className="text-3xl font-black text-primary tracking-tighter">ما هي ملفات تعريف الارتباط؟</h2>
            <p className="text-primary/60 text-lg leading-relaxed font-medium">
              ملفات تعريف الارتباط (Cookies) هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة موقع مرسال. تساعدنا هذه الملفات في تحسين تجربتك، تذكر تفضيلاتك، وضمان أمان حسابك.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-3xl font-black text-primary tracking-tighter">كيف نستخدم الكوكيز؟</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-8 bg-muted rounded-[2rem] border border-border/10">
                  <h4 className="text-primary font-black mb-4 flex items-center gap-2">
                     <span className="material-symbols-rounded text-accent">key</span>
                     أساسية
                  </h4>
                  <p className="text-xs text-primary/60 font-bold leading-relaxed">ضرورية لتسجيل الدخول، حفظ المنتجات في السلة، وإتمام عملية الدفع بأمان.</p>
               </div>
               <div className="p-8 bg-muted rounded-[2rem] border border-border/10">
                  <h4 className="text-primary font-black mb-4 flex items-center gap-2">
                     <span className="material-symbols-rounded text-accent">monitoring</span>
                     تحليلية
                  </h4>
                  <p className="text-xs text-primary/60 font-bold leading-relaxed">تساعدنا في فهم كيفية استخدام الزوار للموقع لنقوم بتحسين الأداء والواجهة.</p>
               </div>
               <div className="p-8 bg-muted rounded-[2rem] border border-border/10">
                  <h4 className="text-primary font-black mb-4 flex items-center gap-2">
                     <span className="material-symbols-rounded text-accent">settings</span>
                     تفضيلات
                  </h4>
                  <p className="text-xs text-primary/60 font-bold leading-relaxed">تسمح للموقع بتذكر لغتك المفضلة وإعدادات حسابك الشخصية.</p>
               </div>
               <div className="p-8 bg-muted rounded-[2rem] border border-border/10">
                  <h4 className="text-primary font-black mb-4 flex items-center gap-2">
                     <span className="material-symbols-rounded text-accent">campaign</span>
                     تسويقية
                  </h4>
                  <p className="text-xs text-primary/60 font-bold leading-relaxed">تستخدم لعرض إعلانات وعروض تهمك بناءً على اهتماماتك وتصفحك.</p>
               </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-black text-primary tracking-tighter">التحكم في الكوكيز</h2>
            <p className="text-primary/60 text-lg leading-relaxed font-medium">
              يمكنك في أي وقت مسح ملفات تعريف الارتباط من متصفحك أو تغيير إعدادات الخصوصية لمنع تخزينها. يرجى العلم أن تعطيل الكوكيز قد يؤدي إلى عدم عمل بعض ميزات الموقع بشكل صحيح.
            </p>
          </section>

          <div className="p-10 bg-accent/5 border border-accent/10 rounded-[3rem] text-center">
             <p className="text-sm font-black text-primary/60 italic">"خصوصيتك هي أولويتنا في مرسال. نحن نستخدم التقنية لخدمتك، لا لتعقبك."</p>
          </div>
        </div>
      </div>
    </div>
  );
}
