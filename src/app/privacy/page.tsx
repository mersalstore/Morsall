import PageHeader from "@/components/PageHeader";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="سياسة الخصوصية" 
        subtitle="Data & Security Protocols" 
        icon="shield_lock" 
      />
      <div className="responsive-container py-24 max-w-4xl">
         <article className="prose prose-lg max-w-none text-primary/80 prose-headings:text-primary prose-a:text-[#C5A021]">
            <h2>مقدمة</h2>
            <p>
               في مرسال (Mersal Elite Market)، ندرك تماماً قيمة البيانات والخصوصية لعملائنا النخبة. تم تصميم سياسة الخصوصية هذه لتوضيح كيفية جمعن، استخدامنا، وحمايتنا لبياناتكم الشخصية وفقاً لأعلى معايير التشفير والأمان العالمية.
            </p>
            
            <h2>جمع البيانات</h2>
            <p>
               نقوم بجمع الحد الأدنى من البيانات الضرورية لتنفيذ وتأمين معاملاتك التجارية:
               <ul>
                  <li>معلومات الهوية (الاسم، البريد الإلكتروني).</li>
                  <li>بيانات التوصيل (العناوين وأرقام الهواتف).</li>
                  <li>سجل المشتريات والتفضيلات لتقديم تجربة مخصصة لك.</li>
               </ul>
            </p>

            <h2>أمان المعلومات وتشفيرها</h2>
            <p>
               منصة مرسال مبنية على (Sovereign Engine) الذي يضمن تشفير كافة البيانات المنقولة عبر بروتوكولات (SSL/TLS)، ولا يتم مطلقاً تفويت أو مشاركة أية أرقام بنكية أو بطاقات ائتمانية مع أي طرف ثالث تحت أي ظرف.
            </p>

            <h2>حقوقك السيادية</h2>
            <p>
               كمستخدم في مرسال، لك الحق الكامل في طلب مراجعة، تحديث، أو إزالة بياناتك بالكامل من خوادمنا. يمكنك ممارسة هذه الحقوق في أي وقت من خلال التواصل المباشر مع فريق الدعم الفني الخاص بالمنصة.
            </p>

            <div className="mt-16 p-8 bg-muted rounded-[2rem] border border-border/10 text-center">
               <span className="material-symbols-rounded text-3xl text-accent mb-4">gavel</span>
               <p className="text-sm font-bold text-primary/60">آخر تحديث: أبريل 2024. التغييرات الجوهرية سيتم إشعار العملاء بها عبر البريد الإلكتروني.</p>
            </div>
         </article>
      </div>
    </div>
  );
}
