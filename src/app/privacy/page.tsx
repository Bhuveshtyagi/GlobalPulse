"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-bone dark:bg-[#0a0a0b] text-ink dark:text-bone transition-colors duration-500 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto px-6 py-40 w-full">
        <h1 className="font-serif text-5xl md:text-7xl tracking-tighter mb-4">Privacy <span className="italic opacity-50">Policy</span></h1>
        <p className="font-mono text-[10px] tracking-widest uppercase opacity-40 mb-16">Data Protection Protocol</p>
        
        <div className="prose prose-hr:border-ink/10 dark:prose-hr:border-bone/10 max-w-none text-ink/80 dark:text-bone/80 font-sans leading-relaxed space-y-6">
          <p>At GlobalPulse, your privacy is a priority. We securely manage your data and only collect what is absolutely necessary to provide a personalized intelligence feed.</p>
          
          <h2 className="font-serif text-2xl mt-8 mb-4 tracking-tight">1. Information Collection</h2>
          <p>We collect your email address purely for account authentication and, if you opt-in, our weekly newsletter dispatch. Passwords are cryptographically hashed using industry-standard bcrypt before they reach our secure, private database.</p>
          
          <h2 className="font-serif text-2xl mt-8 mb-4 tracking-tight">2. Third-Party Services</h2>
          <p>We use external aggregators (Newsdata, Yahoo Finance) to serve you live intel. We do not transmit your personal data to these third parties.</p>
          
          <h2 className="font-serif text-2xl mt-8 mb-4 tracking-tight">3. Cookies & Local Storage</h2>
          <p>We utilize encrypted local browser storage to keep your session active securely without unnecessary tracking.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
