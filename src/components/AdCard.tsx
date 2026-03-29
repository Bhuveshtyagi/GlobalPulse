"use client";

import { motion } from "framer-motion";
import { ExternalLink, Megaphone } from "lucide-react";

export default function AdCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative py-10 border-b border-ink/10 dark:border-bone/10 bg-gradient-to-r from-accent/3 to-purple-500/3 group"
    >
      {/* Label */}
      <div className="absolute top-4 right-4">
        <span className="font-mono text-[8px] tracking-[0.25em] uppercase text-ink/25 dark:text-bone/25">
          Advertisement
        </span>
      </div>

      <div className="flex flex-col gap-5 max-w-2xl">
        {/* Brand line */}
        <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.25em] uppercase">
          <Megaphone size={12} className="text-accent" />
          <span className="text-accent font-bold">GlobalPulse Media</span>
          <span className="px-2 py-0.5 bg-accent/10 text-accent text-[7px] tracking-widest rounded-sm">OPEN FOR ADS</span>
        </div>

        {/* Headline */}
        <h3 className="font-serif text-2xl md:text-3xl leading-tight tracking-tighter text-ink dark:text-bone">
          Reach 10,000+ readers who follow global intelligence daily.
        </h3>

        {/* Body */}
        <p className="font-sans text-sm text-ink/60 dark:text-bone/60 leading-relaxed">
          GlobalPulse delivers real-time geopolitical and financial news to a highly engaged, educated audience. 
          Advertise your brand, product, or service here and get seen by decision-makers worldwide.
        </p>

        {/* CTA */}
        <div className="flex items-center gap-4 mt-1">
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-mono text-[9px] tracking-widest uppercase hover:bg-accent/80 transition-colors rounded-sm"
          >
            Contact Us
            <ExternalLink size={10} />
          </a>
          <span className="font-mono text-[8px] tracking-widest uppercase text-ink/30 dark:text-bone/30">
            Simple pricing. Zero complexity.
          </span>
        </div>
      </div>
    </motion.div>
  );
}
