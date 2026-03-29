"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import NewsCard from "./NewsCard";
import ArticleModal from "./ArticleModal";
import AdCard from "./AdCard";

interface Article {
  id: string;
  title: string;
  description: string;
  source: string;
  time: string;
  link?: string;
  image?: string | null;
}

interface FeedProps {
  activeCategory: string;
  searchQuery?: string;
}

function PulseSkeleton() {
  return (
    <div className="space-y-0">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="py-10 border-b border-ink/10 dark:border-bone/10 animate-pulse">
          <div className="flex gap-10">
            <div className="flex-1 space-y-4">
              <div className="flex gap-4">
                <div className="h-2.5 w-20 bg-ink/10 dark:bg-bone/10 rounded" />
                <div className="h-2.5 w-2.5 bg-ink/10 dark:bg-bone/10 rounded-full" />
                <div className="h-2.5 w-16 bg-ink/10 dark:bg-bone/10 rounded" />
              </div>
              <div className="h-8 bg-ink/10 dark:bg-bone/10 rounded w-3/4" />
              <div className="h-8 bg-ink/8 dark:bg-bone/8 rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-3 bg-ink/6 dark:bg-bone/6 rounded w-full" />
                <div className="h-3 bg-ink/6 dark:bg-bone/6 rounded w-4/5" />
              </div>
            </div>
            <div className="hidden md:block w-[200px] h-[150px] bg-ink/10 dark:bg-bone/10 rounded flex-shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadMoreSkeleton() {
  return (
    <div className="py-10 border-b border-ink/10 dark:border-bone/10 animate-pulse">
      <div className="flex gap-10">
        <div className="flex-1 space-y-4">
          <div className="h-2.5 w-20 bg-ink/10 dark:bg-bone/10 rounded" />
          <div className="h-8 bg-ink/10 dark:bg-bone/10 rounded w-3/4" />
          <div className="h-3 bg-ink/6 dark:bg-bone/6 rounded w-full" />
        </div>
      </div>
    </div>
  );
}

export default function Feed({ activeCategory, searchQuery = "" }: FeedProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastArticleRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  const deduplicate = (items: Article[]) => {
    const seen = new Set();
    return items.filter(item => {
      const slug = item.title.toLowerCase().trim().substring(0, 50);
      if (seen.has(item.link) || seen.has(slug)) return false;
      seen.add(item.link);
      seen.add(slug);
      return true;
    });
  };

  useEffect(() => {
    async function fetchInitialNews() {
      setLoading(true);
      setArticles([]);
      setPage(1);
      setHasMore(true);
      try {
        const params = new URLSearchParams({ category: activeCategory, page: "1" });
        if (searchQuery) params.set("search", searchQuery);
        
        try {
          const ls = localStorage.getItem("gp_user");
          if (ls) {
            const user = JSON.parse(ls);
            if (user?.email) params.set("email", user.email);
          }
        } catch(e) {}
        
        const res = await fetch(`/api/news?${params}`);
        const data = await res.json();
        if (data.articles) {
          setArticles(deduplicate(data.articles));
          if (data.articles.length < 5) setHasMore(false);
        }
      } catch (error) {
        console.error("Failed to fetch initial feed:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialNews();
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    if (page === 1) return;
    async function fetchMoreNews() {
      setLoadingMore(true);
      try {
        const params = new URLSearchParams({ category: activeCategory, page: String(page) });
        if (searchQuery) params.set("search", searchQuery);
        
        try {
          const ls = localStorage.getItem("gp_user");
          if (ls) {
            const user = JSON.parse(ls);
            if (user?.email) params.set("email", user.email);
          }
        } catch(e) {}

        const res = await fetch(`/api/news?${params}`);
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
          setArticles(prev => deduplicate([...prev, ...data.articles]));
          if (data.articles.length < 5) setHasMore(false);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Failed to fetch more news:", error);
      } finally {
        setLoadingMore(false);
      }
    }
    fetchMoreNews();
  }, [page, activeCategory, searchQuery]);

  if (loading) return <PulseSkeleton />;

  return (
    <div className="space-y-0 mt-4">
      <AnimatePresence mode="popLayout">
        {articles.map((article, index) => {
          const isLast = index === articles.length - 1;
          const showAd = (index + 1) % 5 === 0; // Show ad after every 5th article
          const adIndex = Math.floor(index / 5);
          return (
            <>
              <motion.div
                key={article.id}
                ref={isLast ? lastArticleRef : null}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.21, 1.11, 0.81, 0.99] }}
              >
                <div onClick={() => setSelectedArticle(article)} className="block group cursor-pointer">
                  <NewsCard
                    title={article.title}
                    description={article.description}
                    source={article.source}
                    time={article.time}
                    image={article.image}
                  />
                </div>
              </motion.div>
              {showAd && <AdCard key={`ad-${adIndex}`} index={adIndex} />}
            </>
          );
        })}
      </AnimatePresence>

      {loadingMore && <LoadMoreSkeleton />}

      {!loading && articles.length === 0 && (
        <div className="text-center py-40">
          <p className="font-serif text-2xl opacity-40 uppercase tracking-tighter italic">No Intel in this Frequency</p>
        </div>
      )}

      <ArticleModal
        isOpen={!!selectedArticle}
        article={selectedArticle ? {
          id: Number(selectedArticle.id.split('_').pop() || 0),
          title: selectedArticle.title,
          summary: selectedArticle.description,
          source: selectedArticle.source,
          timestamp: selectedArticle.time,
          url: selectedArticle.link || "",
          image: selectedArticle.image
        } : null}
        onClose={() => setSelectedArticle(null)}
        relatedArticles={articles
          .filter(a => a.id !== selectedArticle?.id)
          .map(a => ({
            id: Number(a.id.split('_').pop() || 0),
            title: a.title,
            summary: a.description,
            source: a.source,
            timestamp: a.time,
            url: a.link || "",
            image: a.image
          }))}
      />
    </div>
  );
}
