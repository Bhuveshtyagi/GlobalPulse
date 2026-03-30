"use client";

import { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      try {
        const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
        if (res.ok) { setDone(true); }
      } catch (err) { console.error(err); }
    }
  };

  return (
    <footer className="border-t border-ink/10 dark:border-bone/10 bg-bone dark:bg-[#0a0a0b] text-ink dark:text-bone mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="font-serif text-3xl tracking-tighter hover:text-accent transition-colors">
              Global<span className="italic opacity-40">Pulse</span>
            </Link>
            <p className="font-sans text-xs leading-relaxed opacity-50 mt-4 max-w-xs">
              Real-time intelligence curated from 300+ global sources. Signal over noise.
            </p>
            <div className="flex items-center gap-2 mt-6">
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              <span className="font-mono text-[9px] tracking-widest uppercase text-accent">Intelligence Active</span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-mono text-[10px] tracking-[0.3em] uppercase mb-6 opacity-40">Navigate</h4>
            <ul className="space-y-3">
              {[
                { href: "/", label: "News Feed" },
                { href: "/market", label: "Market Intelligence" },
                { href: "/globe", label: "World Map" },
                { href: "/about", label: "About Us" },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="font-sans text-sm opacity-60 hover:opacity-100 hover:text-accent transition-all">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Topics */}
          <div>
            <h4 className="font-mono text-[10px] tracking-[0.3em] uppercase mb-6 opacity-40">Topics</h4>
            <ul className="space-y-3">
              {["World Affairs", "Technology", "Markets", "Science", "Sports", "Culture"].map(topic => (
                <li key={topic}>
                  <span className="font-sans text-sm opacity-60 hover:opacity-100 hover:text-accent transition-all cursor-pointer">{topic}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-mono text-[10px] tracking-[0.3em] uppercase mb-6 opacity-40">The Dispatch</h4>
            <p className="font-sans text-xs opacity-50 mb-4 leading-relaxed">Weekly intelligence. 300+ sources distilled into a single brief.</p>
            {done ? (
              <p className="font-mono text-[10px] tracking-widest uppercase text-accent">Subscribed ✓</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-transparent border-b border-ink/20 dark:border-bone/20 focus:border-accent outline-none py-2 font-sans text-xs placeholder:opacity-30 transition-colors"
                />
                <button type="submit" className="py-2 bg-ink dark:bg-bone text-bone dark:text-ink hover:bg-accent hover:text-white transition-colors font-mono text-[9px] tracking-widest uppercase">
                  Subscribe Free
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-ink/10 dark:border-bone/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[9px] tracking-widest uppercase opacity-30">
            © 2026 GlobalPulse. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-6 md:gap-8 justify-center mt-6 md:mt-0">
            {[
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Disclaimer", href: "/disclaimer" }
            ].map(link => (
              <Link key={link.label} href={link.href} className="font-mono text-[9px] tracking-widest uppercase opacity-30 hover:opacity-100 hover:text-accent transition-all">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
