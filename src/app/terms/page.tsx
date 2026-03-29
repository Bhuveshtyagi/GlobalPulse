"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-bone dark:bg-[#0a0a0b] text-ink dark:text-bone transition-colors duration-500 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto px-6 py-40 w-full">
        <h1 className="font-serif text-5xl md:text-7xl tracking-tighter mb-4">Terms <span className="italic opacity-50">of Service</span></h1>
        <p className="font-mono text-[10px] tracking-widest uppercase opacity-40 mb-16">Platform Usage Agreements</p>
        
        <div className="prose prose-hr:border-ink/10 dark:prose-hr:border-bone/10 max-w-none text-ink/80 dark:text-bone/80 font-sans leading-relaxed space-y-6">
          <h2 className="font-serif text-2xl mt-8 mb-4 tracking-tight">1. Acceptance of Terms</h2>
          <p>By accessing GlobalPulse, you agree to abide by these terms. This platform aggregates data for informational purposes only. Do not rely solely on market data for financial decisions.</p>
          
          <h2 className="font-serif text-2xl mt-8 mb-4 tracking-tight">2. Intellectual Property</h2>
          <p>The UI, design system, and proprietary aggregations are the intellectual property of GlobalPulse. However, as noted in our Disclaimer, individual articles and their associated media belong entirely to their original publishers.</p>
          
          <h2 className="font-serif text-2xl mt-8 mb-4 tracking-tight">3. Service Limitations</h2>
          <p>We provide this service "as is." Downtime from upstream news APIs or market APIs out of our control may occur.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
