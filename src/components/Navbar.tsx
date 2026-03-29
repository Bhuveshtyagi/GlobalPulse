"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, User, X, Search, LogOut, ChevronDown, Menu, Sun, Moon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";

interface AuthUser {
  id: number;
  email: string;
  fullName: string;
}

export default function Navbar() {
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState<"login" | "signup" | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const [pagesMenuOpen, setPagesMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("gp_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      try {
        const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
        if (res.ok) {
          setSubscribed(true);
          setTimeout(() => { setNewsletterOpen(false); setSubscribed(false); setEmail(""); }, 2200);
        }
      } catch (err) { console.error(err); }
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const endpoint = authOpen === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const body = authOpen === "signup"
        ? { email: authEmail, password: authPassword, fullName: authName }
        : { email: authEmail, password: authPassword };
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Something went wrong.");
      } else {
        localStorage.setItem("gp_user", JSON.stringify(data.user));
        setUser(data.user);
        setAuthOpen(null);
        setAuthEmail(""); setAuthPassword(""); setAuthName(""); setAuthError("");
      }
    } catch { setAuthError("Network error. Please try again."); }
    finally { setAuthLoading(false); }
  };

  const handleLogout = () => { localStorage.removeItem("gp_user"); setUser(null); setUserMenuOpen(false); };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { href: "/", label: "Feed" },
    { href: "/market", label: "Market" },
    { href: "/globe", label: "Globe" },
  ];

  return (
    <>
      <nav className="fixed top-10 left-0 w-full h-16 bg-bone/95 dark:bg-[#0a0a0b]/95 backdrop-blur-md z-50 border-b border-ink/10 dark:border-bone/10 px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Logo */}
        <a href="/" className="font-serif text-xl md:text-2xl tracking-tighter hover:text-accent transition-colors text-ink dark:text-bone flex-shrink-0">
          Global<span className="italic opacity-50">Pulse</span>
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6 border-l border-ink/10 dark:border-bone/10 pl-6 h-8">
          {navLinks.map(link => (
            <a key={link.href} href={link.href}
              className={`font-mono text-[10px] tracking-widest uppercase transition-colors ${pathname === link.href ? "text-accent" : "text-ink/40 dark:text-bone/40 hover:text-accent"}`}>
              {link.label}
            </a>
          ))}
          
          {/* Pages Dropdown */}
          <div className="relative group/pages" onMouseEnter={() => setPagesMenuOpen(true)} onMouseLeave={() => setPagesMenuOpen(false)}>
            <button className="flex items-center gap-1 font-mono text-[10px] tracking-widest uppercase text-ink/40 dark:text-bone/40 hover:text-accent transition-colors">
              Pages <ChevronDown size={10} className="opacity-60" />
            </button>
            <AnimatePresence>
              {pagesMenuOpen && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 mt-4 w-40 bg-bone dark:bg-[#0a0a0b] border border-ink/10 dark:border-bone/10 shadow-xl z-50 flex flex-col py-2">
                  {[
                    { href: "/about", label: "About" },
                    { href: "/contact", label: "Contact" },
                    { href: "/privacy", label: "Privacy" },
                    { href: "/terms", label: "Terms" },
                    { href: "/disclaimer", label: "Disclaimer" },
                  ].map(page => (
                    <a key={page.href} href={page.href} onClick={() => setPagesMenuOpen(false)}
                      className="px-4 py-3 font-mono text-[9px] tracking-widest uppercase text-ink/60 dark:text-bone/60 hover:text-accent hover:bg-ink/5 dark:hover:bg-bone/5 transition-colors">
                      {page.label}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-accent/5 border border-accent/10">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            <span className="font-mono text-[8px] font-bold tracking-[0.2em] text-accent uppercase">Live</span>
          </div>

          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 border border-ink/10 dark:border-bone/10:border-accent/40 hover:text-accent transition-all" aria-label="Toggle Theme">
            {mounted && theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          {/* Search button */}
          <button onClick={() => setSearchOpen(o => !o)}
            className="p-2 border border-ink/10 dark:border-bone/10 hover:border-accent/40 hover:text-accent transition-all"
            aria-label="Search">
            {searchOpen ? <X size={15} /> : <Search size={15} />}
          </button>

          {/* Newsletter — desktop only */}
          <button onClick={() => setNewsletterOpen(o => !o)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 border border-ink/10 dark:border-bone/10 hover:border-accent/40 hover:text-accent transition-all font-mono text-[9px] tracking-widest uppercase">
            <Mail size={11} /><span>Newsletter</span>
          </button>

          {/* Auth */}
          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 border border-ink/10 dark:border-bone/10 hover:border-accent/40 transition-all">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center font-mono text-[9px] font-bold text-accent">
                  {user.fullName?.[0]?.toUpperCase() ?? "U"}
                </div>
                <span className="hidden md:block font-mono text-[9px] tracking-widest uppercase max-w-16 truncate">{user.fullName.split(" ")[0]}</span>
                <ChevronDown size={10} className="opacity-40" />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-bone dark:bg-[#0a0a0b] border border-ink/10 dark:border-bone/10 shadow-xl z-50">
                    <div className="p-4 border-b border-ink/10 dark:border-bone/10">
                      <p className="font-mono text-[9px] tracking-widest uppercase opacity-40">Signed in as</p>
                      <p className="font-sans text-xs mt-1 truncate">{user.email}</p>
                    </div>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 p-4 font-mono text-[9px] tracking-widest uppercase hover:text-accent transition-colors">
                      <LogOut size={12} />Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <button onClick={() => { setAuthOpen("login"); setAuthError(""); }}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 border border-ink/10 dark:border-bone/10 hover:border-accent/40 hover:text-accent transition-all font-mono text-[9px] tracking-widest uppercase">
                <User size={11} /><span className="hidden md:inline">Sign In</span>
              </button>
              <button onClick={() => { setAuthOpen("signup"); setAuthError(""); }}
                className="px-3 py-1.5 bg-ink dark:bg-bone text-bone dark:text-ink hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white transition-colors font-mono text-[9px] tracking-widest uppercase">
                Join
              </button>
            </>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenuOpen(o => !o)} className="md:hidden p-2 border border-ink/10 dark:border-bone/10 hover:border-accent/40 transition-all">
            {mobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="fixed top-[104px] left-0 w-full z-40 bg-bone dark:bg-[#0a0a0b] border-b border-ink/10 dark:border-bone/10 shadow-xl md:hidden">
            <div className="px-6 py-4 flex flex-col gap-0 divide-y divide-ink/5 dark:divide-bone/5">
              {navLinks.map(link => (
                <a key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}
                  className={`py-4 font-mono text-[11px] tracking-widest uppercase ${pathname === link.href ? "text-accent" : "text-ink/60 dark:text-bone/60"}`}>
                  {link.label}
                </a>
              ))}
              
              <div className="py-4 border-t border-ink/10 dark:border-bone/10 mt-2">
                <p className="font-mono text-[9px] tracking-widest uppercase text-ink/40 dark:text-bone/40 mb-3">Pages</p>
                <div className="grid grid-cols-2 gap-y-4">
                  {[
                    { href: "/about", label: "About" },
                    { href: "/contact", label: "Contact" },
                    { href: "/privacy", label: "Privacy" },
                    { href: "/terms", label: "Terms" },
                    { href: "/disclaimer", label: "Disclaimer" },
                  ].map(page => (
                    <a key={page.href} href={page.href} onClick={() => setMobileMenuOpen(false)}
                      className="font-mono text-[10px] tracking-widest uppercase text-ink/60 dark:text-bone/60 hover:text-accent transition-colors">
                      {page.label}
                    </a>
                  ))}
                </div>
              </div>
              {!user && (
                <>
                  <button onClick={() => { setAuthOpen("login"); setMobileMenuOpen(false); }} className="py-4 font-mono text-[11px] tracking-widest uppercase text-ink/60 dark:text-bone/60 text-left">Sign In</button>
                  <button onClick={() => { setAuthOpen("signup"); setMobileMenuOpen(false); }} className="py-4 font-mono text-[11px] tracking-widest uppercase text-accent text-left">Join Free</button>
                </>
              )}
              {user && <button onClick={handleLogout} className="py-4 font-mono text-[11px] tracking-widest uppercase text-ink/60 dark:text-bone/60 text-left">Sign Out</button>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search dropdown */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="fixed top-[104px] left-0 w-full z-40 bg-bone/98 dark:bg-[#0a0a0b]/98 backdrop-blur-md border-b border-ink/10 dark:border-bone/10 px-4 md:px-8 py-4">
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex gap-3 items-center">
              <Search size={16} className="opacity-30 flex-shrink-0" />
              <input type="text" placeholder="Search the Archive..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus
                className="flex-1 bg-transparent font-serif text-lg md:text-xl placeholder:opacity-20 outline-none border-none" />
              <button type="submit" className="font-mono text-[9px] tracking-widest uppercase px-4 py-2 bg-ink dark:bg-bone text-bone dark:text-ink hover:bg-accent hover:text-white transition-colors flex-shrink-0">
                Search
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Newsletter panel */}
      <AnimatePresence>
        {newsletterOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="fixed top-[104px] right-4 md:right-6 z-50 w-[calc(100%-2rem)] md:w-80 bg-bone dark:bg-[#0a0a0b] border border-ink/10 dark:border-bone/10 shadow-2xl p-8">
            <button onClick={() => setNewsletterOpen(false)} className="absolute top-4 right-4 opacity-40 hover:opacity-100"><X size={14} /></button>
            {subscribed ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✓</div>
                <p className="font-serif text-xl italic">You&apos;re in the Archive.</p>
              </div>
            ) : (
              <>
                <h3 className="font-serif text-2xl tracking-tighter mb-2">The Dispatch</h3>
                <p className="font-mono text-[10px] tracking-widest uppercase opacity-40 mb-6">Weekly intel from 300+ sources.</p>
                <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                    className="bg-transparent border-b border-ink/20 dark:border-bone/20 focus:border-accent outline-none py-2 font-sans text-sm placeholder:opacity-30 transition-colors" />
                  <button type="submit" className="w-full py-2 bg-accent text-white font-mono text-[10px] tracking-widest uppercase hover:bg-accent/80 transition-colors">Subscribe Free</button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {authOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 dark:bg-ink/70 backdrop-blur-sm p-4"
            onClick={() => setAuthOpen(null)}>
            <motion.div initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-sm bg-bone dark:bg-[#0a0a0b] border border-ink/10 dark:border-bone/10 shadow-2xl p-8 md:p-10">
              <button onClick={() => setAuthOpen(null)} className="absolute top-4 right-4 opacity-40 hover:opacity-100"><X size={14} /></button>
              <div className="flex gap-6 mb-6">
                <button onClick={() => { setAuthOpen("login"); setAuthError(""); }} className={`font-mono text-[11px] tracking-widest uppercase pb-2 border-b-2 transition-colors ${authOpen === "login" ? "border-accent text-accent" : "border-transparent opacity-40"}`}>Sign In</button>
                <button onClick={() => { setAuthOpen("signup"); setAuthError(""); }} className={`font-mono text-[11px] tracking-widest uppercase pb-2 border-b-2 transition-colors ${authOpen === "signup" ? "border-accent text-accent" : "border-transparent opacity-40"}`}>Join Free</button>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl tracking-tighter mb-6">{authOpen === "login" ? "Welcome back." : "Join the Archive."}</h2>
              <form className="flex flex-col gap-4" onSubmit={handleAuth}>
                {authOpen === "signup" && (
                  <div><label className="font-mono text-[9px] tracking-widest uppercase opacity-40 block mb-1">Full Name</label>
                    <input type="text" required value={authName} onChange={e => setAuthName(e.target.value)} placeholder="Jane Smith"
                      className="bg-transparent border-b border-ink/20 dark:border-bone/20 focus:border-accent outline-none py-2 font-sans text-sm placeholder:opacity-30 transition-colors w-full" /></div>
                )}
                <div><label className="font-mono text-[9px] tracking-widest uppercase opacity-40 block mb-1">Email</label>
                  <input type="email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="you@email.com"
                    className="bg-transparent border-b border-ink/20 dark:border-bone/20 focus:border-accent outline-none py-2 font-sans text-sm placeholder:opacity-30 transition-colors w-full" /></div>
                <div><label className="font-mono text-[9px] tracking-widest uppercase opacity-40 block mb-1">Password</label>
                  <input type="password" required value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="••••••••"
                    className="bg-transparent border-b border-ink/20 dark:border-bone/20 focus:border-accent outline-none py-2 font-sans text-sm placeholder:opacity-30 transition-colors w-full" /></div>
                {authError && <p className="font-mono text-[9px] tracking-widest text-red-500 bg-red-500/10 px-3 py-2">{authError}</p>}
                <button type="submit" disabled={authLoading}
                  className="mt-1 w-full py-3 bg-accent text-white font-mono text-[10px] tracking-widest uppercase hover:bg-accent/80 transition-colors disabled:opacity-60">
                  {authLoading ? "Please wait..." : authOpen === "login" ? "Enter the Archive" : "Create Account"}
                </button>
              </form>
              <p className="font-mono text-[9px] tracking-wider opacity-30 mt-4 text-center">By continuing you agree to our Terms & Privacy.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
