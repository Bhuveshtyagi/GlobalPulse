"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <main className="min-h-screen bg-bone dark:bg-[#0a0a0b] text-ink dark:text-bone transition-colors duration-500 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-3xl mx-auto px-6 py-40 w-full">
        <h1 className="font-serif text-5xl md:text-7xl tracking-tighter mb-4">Contact <span className="italic opacity-50">Us</span></h1>
        <p className="font-mono text-[10px] tracking-widest uppercase opacity-40 mb-16">Secure Intelligence Channel</p>
        
        {sent ? (
          <div className="p-12 border border-ink/10 dark:border-bone/10 text-center bg-accent/5">
            <h2 className="font-serif text-3xl italic mb-2">Transmission Received</h2>
            <p className="font-sans text-sm opacity-60">We will respond shortly.</p>
          </div>
        ) : (
          <form 
            className="flex flex-col gap-6"
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          >
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[9px] tracking-widest uppercase opacity-50">Name / Designation</label>
              <input type="text" required className="bg-transparent border-b border-ink/20 dark:border-bone/20 focus:border-accent outline-none py-3 font-sans" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[9px] tracking-widest uppercase opacity-50">Secure Email</label>
              <input type="email" required className="bg-transparent border-b border-ink/20 dark:border-bone/20 focus:border-accent outline-none py-3 font-sans" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[9px] tracking-widest uppercase opacity-50">Transmission Content</label>
              <textarea required rows={5} className="bg-transparent border-b border-ink/20 dark:border-bone/20 focus:border-accent outline-none py-3 font-sans resize-none" />
            </div>
            <button type="submit" className="mt-8 self-start px-8 py-3 bg-ink dark:bg-bone text-bone dark:text-ink font-mono text-[10px] tracking-widest uppercase hover:bg-accent hover:text-white transition-colors">
              Send Transmission
            </button>
          </form>
        )}
      </div>
      <Footer />
    </main>
  );
}
