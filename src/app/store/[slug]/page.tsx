import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VendorRating from "@/components/VendorRating";

export default async function VendorStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const vendor = await prisma.vendor.findUnique({
    where: { slug },
    include: {
      user: true,
      products: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!vendor) notFound();

  const isSuspended = vendor.status === 'SUSPENDED';
  const isExpired = vendor.subscriptionEndsAt ? new Date(vendor.subscriptionEndsAt) < new Date() : false;
  const isClosed = isSuspended || isExpired;
  
  // Custom Styles from Vendor
  const primaryColor = vendor.primaryColor || "#0F1629";
  const secondaryColor = vendor.secondaryColor || "#3B82F6";

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans" style={{ '--vendor-primary': primaryColor, '--vendor-secondary': secondaryColor } as any}>
      <Navbar />
      
      <main className="flex-grow">
        {/* Banner Section */}
        <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-gray-900">
          {vendor.storeBanner ? (
            <img src={vendor.storeBanner} alt={vendor.storeName} className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#021D24] to-[#1089A4] opacity-80" />
          )}
          
          {/* Overlay Content */}
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl mx-auto w-full px-4 pb-12">
               <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
                  {/* Logo */}
                  <div className="w-40 h-40 md:w-52 md:h-52 rounded-[3rem] bg-white border-[8px] border-white shadow-2xl overflow-hidden flex items-center justify-center flex-shrink-0 relative z-10 -mb-20 md:-mb-24">
                     {vendor.storeLogo ? (
                       <img src={vendor.storeLogo} alt="Logo" className="w-full h-full object-contain" />
                     ) : (
                       <div className="text-6xl font-black text-[#021D24]">{vendor.storeName[0].toUpperCase()}</div>
                     )}
                  </div>
                  
                  {/* Store Info */}
                  <div className="flex-grow text-center md:text-right pb-4 relative z-10">
                     <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter drop-shadow-lg">{vendor.storeName}</h1>
                     <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/20 flex items-center gap-2">
                           <span className="material-symbols-rounded text-sm text-yellow-400">star</span>
                           <span className="text-xs font-bold text-white uppercase tracking-widest">تاجر موثق</span>
                        </div>
                        {vendor.location && (
                          <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/20 flex items-center gap-2">
                             <span className="material-symbols-rounded text-sm text-blue-400">location_on</span>
                             <span className="text-xs font-bold text-white uppercase tracking-widest">{vendor.location}</span>
                          </div>
                        )}
                     </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex items-center gap-4 pb-4">
                     {vendor.whatsappNumber && (
                        <a 
                          href={`https://wa.me/${vendor.whatsappNumber}`} 
                          target="_blank"
                          className="w-14 h-14 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                        >
                           <span className="material-symbols-rounded text-2xl">chat</span>
                        </a>
                     )}
                     {vendor.facebookUrl && (
                        <a 
                          href={vendor.facebookUrl} 
                          target="_blank"
                          className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                        >
                           <span className="material-symbols-rounded text-2xl">facebook</span>
                        </a>
                     )}
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Store Content */}
        <div className="max-w-7xl mx-auto px-4 pt-32 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
            {/* Sidebar / Info */}
            <div className="lg:col-span-1 space-y-12">
               <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-300">عن المتجر</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">
                    {vendor.storeDescription || "مرحباً بكم في متجرنا الرسمي على منصة مرسال. نحن نهتم بتقديم أفضل جودة بأفضل سعر لعملائنا الكرام."}
                  </p>
               </div>

               {vendor.address && (
                 <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-300">العنوان</h3>
                    <div className="flex gap-3 text-gray-500">
                       <span className="material-symbols-rounded text-xl text-gray-300">map</span>
                       <span className="text-sm font-bold">{vendor.address}</span>
                    </div>
                 </div>
               )}

               <div className="p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
                  <div className="relative z-10">
                    <h4 className="font-black text-xl mb-2">تسوق بثقة</h4>
                    <p className="text-xs text-white/60 font-bold leading-relaxed">كافة المنتجات في هذا المتجر تخضع لسياسة حماية المشتري من مرسال.</p>
                  </div>
                  <span className="material-symbols-rounded absolute -bottom-8 -right-8 text-8xl text-white/5 -rotate-12">verified</span>
               </div>
               
               <VendorRating vendorId={vendor.id} />
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
               <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-8">
                  <div className="flex items-center gap-6">
                    <h2 className="text-3xl font-black text-[#021D24] tracking-tighter">المنتجات <span style={{ color: secondaryColor }}>المتوفرة</span></h2>
                    <span className="bg-gray-100 px-4 py-1.5 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">{vendor.products.length} منتج</span>
                  </div>
               </div>

               {isClosed ? (
                 <div className="bg-red-50 rounded-[3rem] p-20 text-center border-4 border-white shadow-2xl">
                    <div className="w-24 h-24 bg-white text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                      <span className="material-symbols-rounded text-5xl">lock_clock</span>
                    </div>
                    <h3 className="text-2xl font-black text-red-900 mb-4">هذا المتجر مغلق مؤقتاً</h3>
                    <p className="text-red-900/60 font-bold max-w-md mx-auto leading-relaxed">نعتذر لعدم تمكنك من التسوق حالياً، المتجر في انتظار مراجعة الإدارة أو تجديد الاشتراك.</p>
                 </div>
               ) : (
                 <>
                  {vendor.products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {vendor.products.map((product) => (
                        <ProductCard 
                          key={product.id} 
                          id={product.id}
                          title={product.title}
                          price={product.price}
                          image={product.images ? product.images.split(',')[0] : ''}
                          vendor={vendor.storeName}
                          vendorLocation={vendor.location || "السودان"}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-32 bg-gray-50 rounded-[4rem] border-4 border-dashed border-gray-200">
                      <span className="material-symbols-rounded text-7xl text-gray-200 mb-6 block">inventory_2</span>
                      <p className="text-gray-400 font-black text-xl uppercase tracking-widest">لم يتم إضافة منتجات بعد</p>
                    </div>
                  )}
                 </>
               )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
