"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Feed from "@/components/Feed";
import MarketTicker from "@/components/MarketTicker";
import CategoryTabs from "@/components/CategoryTabs";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useSearchParams, useRouter } from "next/navigation";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlSearch = searchParams.get("search") || "";
  const [category, setCategory] = useState("For You");

  const clearSearch = () => {
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-bone dark:bg-[#0a0a0b] text-ink dark:text-bone selection:bg-accent selection:text-white transition-colors duration-500">
      <MarketTicker />
      <Navbar />

      {/* Active Search Banner */}
      <AnimatePresence>
        {urlSearch && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-[104px] left-0 w-full z-40 bg-accent/5 border-b border-accent/10 px-4 md:px-8 py-3 flex items-center gap-4"
          >
            <span className="font-mono text-[10px] tracking-widest uppercase text-accent">Results for:</span>
            <span className="font-serif italic text-base md:text-lg">&ldquo;{urlSearch}&rdquo;</span>
            <button onClick={clearSearch} className="ml-auto font-mono text-[9px] tracking-widest uppercase text-ink/40 dark:text-bone/40 hover:text-accent transition-colors flex items-center gap-2">
              <X size={12} /> Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-32 md:pt-36 pb-40">
        <Feed activeCategory={category} searchQuery={urlSearch} />
      </div>

      <CategoryTabs
        activeCategory={category}
        setCategory={(cat) => {
          setCategory(cat);
          if (urlSearch) router.push("/");
        }}
      />

      <div className="pb-24">
        <Footer />
      </div>

      {/* Background glow orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-purple-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-bone dark:bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-pulse font-mono text-[10px] tracking-widest uppercase opacity-40">Loading Archive...</div>
      </main>
    }>
      <HomeContent />
    </Suspense>
  );
}
