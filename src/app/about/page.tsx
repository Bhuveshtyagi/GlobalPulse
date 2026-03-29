"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-bone dark:bg-[#0a0a0b] text-ink dark:text-bone transition-colors duration-500 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto px-6 py-40 w-full">
        <h1 className="font-serif text-5xl md:text-7xl tracking-tighter mb-10">About <span className="italic opacity-50">GlobalPulse</span></h1>
        
        <div className="prose prose-hr:border-ink/10 dark:prose-hr:border-bone/10 max-w-none text-ink/80 dark:text-bone/80 font-sans leading-relaxed">
          <p className="text-xl md:text-3xl mb-16 font-serif italic max-w-2xl border-l-[3px] border-accent pl-6">
            Curating pristine global intelligence from 300+ sources. Signal over noise.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-12 items-start mb-24 p-8 border border-ink/10 dark:border-bone/10 bg-ink/3 dark:bg-bone/3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            
            <div className="w-48 h-48 rounded-[2rem] overflow-hidden flex-shrink-0 border border-ink/10 dark:border-bone/10 drop-shadow-2xl">
              <Image 
                src="https://avatars.githubusercontent.com/u/205202409?v=4" 
                alt="Bhuvesh Tyagi" 
                width={192} 
                height={192} 
                className="object-cover w-full h-full grayscale group-hover:grayscale-0 scale-105 group-hover:scale-100 transition-all duration-700 ease-out"
                unoptimized
              />
            </div>
            <div className="pt-2 z-10">
              <h2 className="font-mono text-[10px] tracking-[0.4em] uppercase text-accent mb-3 flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                Creator & Architect
              </h2>
              <h3 className="font-serif text-5xl md:text-6xl tracking-tighter mb-6">Bhuvesh Tyagi</h3>
              <p className="text-sm md:text-base leading-relaxed opacity-80 mb-6 max-w-xl">
                GlobalPulse is a high-fidelity intelligence platform engineered to distill complex world events into clear, actionable, and visually pristine feeds. Built with modern web architecture and raw aesthetic focus to keep you consistently ahead of the curve.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-ink/10 dark:border-bone/10">
                <div>
                  <div className="font-serif text-3xl">300+</div>
                  <div className="font-mono text-[8px] tracking-widest uppercase opacity-40 mt-1">Live Sources</div>
                </div>
                <div>
                  <div className="font-serif text-3xl">90s</div>
                  <div className="font-mono text-[8px] tracking-widest uppercase opacity-40 mt-1">Market Refresh</div>
                </div>
                <div>
                  <div className="font-serif text-3xl">AI</div>
                  <div className="font-mono text-[8px] tracking-widest uppercase opacity-40 mt-1">Intelligence Nodes</div>
                </div>
                <div>
                  <div className="font-serif text-3xl">24/7</div>
                  <div className="font-mono text-[8px] tracking-widest uppercase opacity-40 mt-1">Global Coverage</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
