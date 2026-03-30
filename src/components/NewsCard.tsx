"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface NewsCardProps {
  title: string;
  description: string;
  source: string;
  time: string;
  image?: string | null;
  onClick?: () => void;
}


export default function NewsCard({ title, description, source, time, image, onClick }: NewsCardProps) {
  const [imageError, setImageError] = useState(false);
  const formattedTime = new Date(time).toLocaleDateString([], { month: "short", day: "numeric" }).toUpperCase();
  const truncatedTitle = title.length > 60 ? title.substring(0, 57) + "..." : title;
  const truncatedDesc = description.length > 140 ? description.substring(0, 137) + "..." : description;
  const hasImage = image && (image.startsWith("http") || image.startsWith("/")) && !imageError;

  return (
    <motion.article
      initial="initial"
      whileHover="hover"
      onClick={onClick}
      className="relative py-10 border-b border-ink/10 dark:border-bone/10 group cursor-pointer"
    >
      <div className={`grid grid-cols-1 ${hasImage ? "md:grid-cols-[1fr_300px] gap-10" : "gap-6"} items-center`}>
        {/* Text */}
        <div className="flex flex-col">
          <div className="flex items-center gap-6 mb-5 font-mono text-[10px] tracking-[0.2em] text-ink/40 dark:text-bone/40 uppercase">
            <span>{source}</span>
            <span className="w-1 h-1 bg-accent rounded-full" />
            <span>{formattedTime}</span>
          </div>

          <motion.h2
            variants={{ initial: { x: 0 }, hover: { x: 8 } }}
            className="font-serif text-3xl md:text-4xl leading-[1.15] mb-6 text-ink dark:text-bone transition-colors group-hover:text-accent tracking-tighter"
          >
            {truncatedTitle}
          </motion.h2>

          <motion.p
            variants={{ initial: { opacity: 0.6 }, hover: { opacity: 1 } }}
            className="font-sans text-sm leading-relaxed text-ink/70 dark:text-bone/70 max-w-xl duration-500"
          >
            {truncatedDesc}
          </motion.p>

          <div className="mt-6 flex items-center gap-3 font-mono text-[9px] tracking-widest uppercase text-accent/60 group-hover:text-accent transition-colors">
            <span>Read Intelligence</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </div>
        </div>
        {/* Image — authentic article photo (if provided) */}
        {hasImage && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-ink/5 dark:bg-bone/5 flex-shrink-0">
            <motion.img
              variants={{ initial: { scale: 1.05 }, hover: { scale: 1 } }}
              src={image!}
              alt={title}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              loading="lazy"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent pointer-events-none" />
          </div>
        )}
      </div>
    </motion.article>
  );
}
