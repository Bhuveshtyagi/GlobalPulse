"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Sparkles, Star } from "lucide-react";

interface Article {
  id: number;
  title: string;
  summary: string;
  source: string;
  timestamp: string;
  url: string;
  image?: string | null;
  category?: string;
}

interface ArticleModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  relatedArticles: Article[];
}

export default function ArticleModal({ article, isOpen, onClose, relatedArticles }: ArticleModalProps) {
  const [aiData, setAiData] = useState<{ summary?: string; why_it_matters?: string; ai_headline?: string } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Review system state
  const [showReview, setShowReview] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewedArticle, setReviewedArticle] = useState<Article | null>(null);
  
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen && article) {
      startTimeRef.current = Date.now();
      setAiData(null);
      setLoadingAi(true);
      fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: article.url,
          title: article.title,
          description: article.summary,
          content: ''
        })
      })
      .then(res => res.json())
      .then(data => { setAiData(data); setLoadingAi(false); })
      .catch(() => setLoadingAi(false));
    }

    return () => {
      if (startTimeRef.current > 0 && article) {
        const readTimeSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        
        // Fire-and-forget read telemetry
        try {
          const ls = localStorage.getItem("gp_user");
          if (ls) {
            const user = JSON.parse(ls);
            if (user?.email) {
              fetch('/api/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, url: article.url, category: article.category || "top", readTimeSeconds }),
                keepalive: true
              });
              
              // Show star review prompt if user read for more than 10 seconds
              if (readTimeSeconds > 10) {
                setReviewedArticle(article);
                setSelectedRating(0);
                setReviewText("");
                setReviewSubmitted(false);
                setShowReview(true);
              }
            }
          }
        } catch (e) { /* silently fail */ }
        
        startTimeRef.current = 0;
      }
    };
  }, [isOpen, article]);

  const submitReview = async () => {
    if (!selectedRating || !reviewedArticle) return;
    try {
      const ls = localStorage.getItem("gp_user");
      if (!ls) return;
      const user = JSON.parse(ls);
      await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, article_url: reviewedArticle.url, rating: selectedRating, review_text: reviewText })
      });
    } catch (e) { /* silently fail */ }
    setReviewSubmitted(true);
    setTimeout(() => setShowReview(false), 2000);
  };

  if (!article && !showReview) return null;

  return (
    <>
      {/* Article Modal */}
      <AnimatePresence>
        {isOpen && article && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-ink/60 dark:bg-[#0a0a0b]/80 backdrop-blur-3xl"
            />

            <motion.div 
              initial={{ y: 100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-6xl bg-bone dark:bg-ink rounded-2xl shadow-2xl overflow-hidden border border-ink/10 dark:border-bone/10 flex flex-col md:flex-row h-full max-h-[85vh]"
            >
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 z-10 p-2 bg-bone/80 dark:bg-ink/80 rounded-full text-ink dark:text-bone hover:scale-110 transition-transform"
              >
                <X size={20} />
              </button>

              {/* Left Column */}
              <div className="w-full md:w-2/5 p-8 border-r border-ink/10 dark:border-bone/10 bg-black/5 dark:bg-white/5 flex flex-col overflow-y-auto">
                <div className="aspect-[3/4] rounded-lg overflow-hidden mb-8 grayscale hover:grayscale-0 transition-all duration-700">
                  {article.image ? (
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-accent/20 flex items-center justify-center font-serif text-3xl">PULSE</div>
                  )}
                </div>

                <h3 className="font-mono text-[9px] tracking-[0.3em] uppercase opacity-40 mb-6">Related Intellectual Currents</h3>
                <div className="space-y-6">
                  {relatedArticles.slice(0, 3).map((rel) => (
                    <div key={rel.id} className="group cursor-pointer">
                      <p className="font-serif text-xs leading-tight mb-2 opacity-60 group-hover:opacity-100 group-hover:text-accent transition-all">
                        {rel.title.substring(0, 50)}...
                      </p>
                      <div className="h-[1px] w-0 group-hover:w-full bg-accent/30 transition-all duration-500" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column */}
              <div className="w-full md:w-3/5 p-8 md:p-20 overflow-y-auto flex flex-col">
                <div className="flex items-center gap-4 font-mono text-[9px] tracking-[0.2em] opacity-40 uppercase mb-8">
                  <span>{article.source}</span>
                  <span className="w-1 h-1 bg-accent rounded-full" />
                  <span>{new Date(article.timestamp).toLocaleDateString()}</span>
                </div>

                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-12 text-ink dark:text-bone">
                  {aiData?.ai_headline || article.title}
                </h1>

                <div className="font-sans text-base md:text-lg leading-relaxed text-ink/70 dark:text-bone/80 mb-16 space-y-6">
                  {loadingAi ? (
                    <div className="animate-pulse flex flex-col gap-4">
                      <div className="h-4 bg-ink/10 dark:bg-bone/10 rounded w-3/4"></div>
                      <div className="h-4 bg-ink/10 dark:bg-bone/10 rounded w-full"></div>
                      <div className="font-mono text-[9px] tracking-widest uppercase text-accent mt-4 flex items-center gap-2">
                        <Sparkles size={12} className="animate-spin" />
                        Decrypting Intelligence...
                      </div>
                    </div>
                  ) : aiData ? (
                    <>
                      <p className="font-bold border-l-2 border-accent pl-4">{aiData.summary || article.summary}</p>
                      <div className="mt-6 p-6 border border-ink/10 dark:border-bone/10 bg-black/5 dark:bg-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                        <h4 className="font-mono text-[10px] tracking-widest flex items-center gap-2 uppercase opacity-60 mb-3 text-accent">
                          <Sparkles size={10} /> Why It Matters
                        </h4>
                        <p className="text-sm opacity-90 relative z-10">{aiData.why_it_matters}</p>
                      </div>
                    </>
                  ) : (
                    <p>{article.summary}</p>
                  )}
                </div>

                <div className="mt-auto">
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-4 px-10 py-5 bg-ink dark:bg-bone text-bone dark:text-ink rounded-full font-mono text-[11px] tracking-widest uppercase hover:bg-accent hover:text-white dark:hover:bg-accent transition-all group"
                  >
                    Know More
                    <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⭐ Star Review Slide-Up Prompt */}
      <AnimatePresence>
        {showReview && reviewedArticle && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4"
          >
            <div className="bg-bone dark:bg-[#0f0f10] border border-ink/10 dark:border-bone/10 shadow-2xl p-6 rounded-2xl">
              <button
                onClick={() => setShowReview(false)}
                className="absolute top-4 right-4 opacity-40 hover:opacity-100"
              >
                <X size={14} />
              </button>

              {reviewSubmitted ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-2"
                >
                  <div className="text-3xl mb-2">✓</div>
                  <p className="font-serif text-lg italic">Your signal received.</p>
                  <p className="font-mono text-[9px] tracking-widest uppercase opacity-40 mt-1">Thank you for the intelligence.</p>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                      <Star size={12} className="text-accent" />
                    </div>
                    <div>
                      <p className="font-mono text-[9px] tracking-widest uppercase text-accent">Rate This Story</p>
                      <p className="font-serif text-sm opacity-60 truncate max-w-[260px]">{reviewedArticle.title}</p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setSelectedRating(star)}
                        className="transition-transform hover:scale-125"
                      >
                        <Star
                          size={24}
                          className={`transition-colors ${
                            star <= (hoverRating || selectedRating)
                              ? "text-accent fill-accent"
                              : "text-ink/20 dark:text-bone/20"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Optional review text */}
                  {selectedRating > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                      <input
                        type="text"
                        placeholder="Quick take on this story... (optional)"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        maxLength={120}
                        className="w-full bg-transparent border-b border-ink/20 dark:border-bone/20 focus:border-accent outline-none py-2 font-sans text-sm placeholder:opacity-30 transition-colors mb-4"
                      />
                    </motion.div>
                  )}

                  <button
                    onClick={submitReview}
                    disabled={!selectedRating}
                    className="w-full py-2.5 bg-accent text-white font-mono text-[9px] tracking-widest uppercase hover:bg-accent/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded-full"
                  >
                    Submit Review
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
