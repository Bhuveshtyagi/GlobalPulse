"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const CATEGORY_GROUPS = [
  {
    name: "INTEL",
    main: "top",
    subs: ["Politics", "World", "National", "Local", "Law & Crime"]
  },
  {
    name: "CAPITAL",
    main: "Business",
    subs: ["Stock Market", "Cryptocurrency", "Banking", "Real Estate", "Startups"]
  },
  {
    name: "FRONTIER",
    main: "Technology",
    subs: ["Artificial Intelligence", "Space Tech", "Cybersecurity", "Science", "Gadgets"]
  },
  {
    name: "CULTURE",
    main: "Lifestyle",
    subs: ["Culture", "Movies", "Music", "Travel", "Relationships"]
  },
  {
    name: "SPORTS",
    main: "Sports",
    subs: ["Football", "Cricket", "Basketball", "Esports"]
  }
];

interface CategoryTabsProps {
  activeCategory: string;
  setCategory: (category: string) => void;
}

export default function CategoryTabs({ activeCategory, setCategory }: CategoryTabsProps) {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);

  return (
    <div className="fixed bottom-12 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 flex flex-col items-center group/nav px-2 md:px-0">
      {/* Sub-category Menu */}
      <AnimatePresence>
        {hoveredGroup && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            onMouseEnter={() => setHoveredGroup(hoveredGroup)}
            onMouseLeave={() => setHoveredGroup(null)}
            className="mb-4 p-3 bg-bone/90 dark:bg-[#0a0a0b]/90 backdrop-blur-2xl border border-ink/10 dark:border-bone/10 shadow-2xl rounded-sm flex gap-2 flex-wrap max-w-2xl justify-center"
          >
            {CATEGORY_GROUPS.find(g => g.name === hoveredGroup)?.subs.map(sub => (
              <button
                key={sub}
                onClick={() => {
                  setCategory(sub);
                  setHoveredGroup(null);
                }}
                className={`px-4 py-2 font-mono text-[9px] tracking-[0.2em] uppercase transition-all hover:bg-accent hover:text-white border border-transparent hover:border-accent/20 ${
                  activeCategory === sub ? "bg-accent text-white" : "text-ink/60 dark:text-bone/60"
                }`}
              >
                {sub}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Groups Docker — horizontally scrollable on mobile */}
      <div className="overflow-x-auto hide-scrollbar max-w-[100vw]">
        <nav className="bg-bone dark:bg-[#0a0a0b] border border-ink/10 dark:border-bone/10 px-4 md:px-10 py-4 flex gap-5 md:gap-12 items-center shadow-lg rounded-sm whitespace-nowrap">
          {CATEGORY_GROUPS.map((group) => (
            <div 
              key={group.name}
              className="relative flex-shrink-0"
              onMouseEnter={() => setHoveredGroup(group.name)}
              onMouseLeave={() => setHoveredGroup(null)}
            >
              <button
                onClick={() => setCategory(group.main)}
                className={`font-mono text-[10px] font-bold tracking-[0.4em] uppercase transition-all flex flex-col items-center group/btn ${
                  activeCategory === group.main ? "text-accent" : "text-ink/40 dark:text-bone/40 hover:text-ink dark:hover:text-bone"
                }`}
              >
                <span className="mb-2">{group.name}</span>
                <motion.div 
                  animate={{ 
                    width: activeCategory === group.main || hoveredGroup === group.name ? "100%" : "0%",
                    opacity: activeCategory === group.main || hoveredGroup === group.name ? 1 : 0
                  }}
                  className="h-[1px] bg-accent" 
                />
              </button>
            </div>
          ))}
          
          <div className="w-[1px] h-4 bg-ink/10 dark:border-bone/10 flex-shrink-0" />
          
          <button
            onClick={() => setCategory("For You")}
            className={`font-mono text-[10px] font-bold tracking-[0.4em] uppercase flex-shrink-0 ${
              activeCategory === "For You" ? "text-accent" : "text-ink/40 dark:text-bone/40 hover:text-ink dark:hover:text-bone"
            }`}
          >
            INDEX
          </button>
        </nav>
      </div>
    </div>
  );
}
