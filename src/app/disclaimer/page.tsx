"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-bone dark:bg-[#0a0a0b] text-ink dark:text-bone transition-colors duration-500 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto px-6 py-40 w-full">
        <h1 className="font-serif text-5xl md:text-7xl tracking-tighter mb-4">Disclaimer</h1>
        <p className="font-mono text-[10px] tracking-widest uppercase opacity-40 mb-16">Legal Notice & Fair Use</p>
        
        <div className="prose prose-hr:border-ink/10 dark:prose-hr:border-bone/10 max-w-none text-ink/80 dark:text-bone/80 font-sans leading-relaxed space-y-6">
          <p>
            <strong>GlobalPulse</strong> is a news aggregation platform designed strictly for the purpose of right to information, education, and public awareness. 
          </p>
          <p>
            We clearly state that <strong>all news content, articles, images, and media are NOT owned by us</strong>. They are the intellectual property of their respective original owners and publishers. 
          </p>
          <p>
            Our platform utilizes automated RSS feeds and public APIs (such as Newsdata.io and Yahoo Finance) to index and curate publicly available intelligence under the principles of fair use and the universal law of Right to Information. Every curated article provides direct attribution and a link back to the original source.
          </p>
          <p>
            If you are a copyright owner and believe that any content should be removed or modified, please contact us immediately, and we will comply with your request.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
