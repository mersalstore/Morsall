"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface SiteSection {
  id: string;
  type: "hero" | "banner" | "products" | "categories" | "text" | "image_grid" | "custom";
  title: string;
  subtitle?: string;
  images: string[];
  content?: string;
  link?: string;
  isActive: boolean;
  order: number;
  backgroundColor?: string;
  textColor?: string;
}

export default function DynamicSectionsRenderer() {
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/site-sections")
      .then(r => r.json())
      .then(data => {
        if (data.sections) setSections(data.sections);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || sections.length === 0) return null;

  return (
    <>
      {sections.map((section, index) => (
        <motion.section
          key={section.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            backgroundColor: section.backgroundColor || undefined,
            color: section.textColor || undefined,
          }}
        >
          {section.type === "hero" && (
            <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
              {section.images[0] && (
                <Image src={section.images[0]} alt={section.title} fill className="object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                <div className="container mx-auto px-6">
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-4">{section.title}</h2>
                  {section.subtitle && <p className="text-lg text-white/80 mb-6">{section.subtitle}</p>}
                  {section.link && (
                    <Link href={section.link} className="inline-block bg-[#C5A021] text-white px-8 py-4 rounded-2xl font-black hover:bg-[#A9841B] transition-all">
                      اكتشف المزيد
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {section.type === "banner" && (
            <div className="container mx-auto px-4 py-8">
              <Link href={section.link || "#"} className="relative w-full h-48 md:h-64 rounded-[2rem] overflow-hidden block group">
                {section.images[0] && (
                  <Image src={section.images[0]} alt={section.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-l from-black/40 to-transparent flex items-center p-8">
                  <div className="text-right">
                    <h3 className="text-2xl md:text-3xl font-black text-white">{section.title}</h3>
                    {section.subtitle && <p className="text-white/70">{section.subtitle}</p>}
                  </div>
                </div>
              </Link>
            </div>
          )}

          {section.type === "text" && (
            <div className="container mx-auto px-4 py-12">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-black mb-4" style={{ color: section.textColor }}>{section.title}</h2>
                {section.subtitle && <p className="text-lg opacity-70 mb-4">{section.subtitle}</p>}
                {section.content && <div className="text-base leading-relaxed opacity-80" style={{ color: section.textColor }}>{section.content}</div>}
              </div>
            </div>
          )}

          {section.type === "image_grid" && section.images.length > 0 && (
            <div className="container mx-auto px-4 py-8">
              <h2 className="text-2xl font-black text-center mb-6">{section.title}</h2>
              {section.subtitle && <p className="text-center opacity-70 mb-8">{section.subtitle}</p>}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {section.images.map((img, i) => (
                  <Link key={i} href={section.link || "#"} className="relative h-48 rounded-2xl overflow-hidden group">
                    <Image src={img} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {section.type === "custom" && section.content && (
            <div className="container mx-auto px-4 py-8">
              <div dangerouslySetInnerHTML={{ __html: section.content }} />
            </div>
          )}
        </motion.section>
      ))}
    </>
  );
}
