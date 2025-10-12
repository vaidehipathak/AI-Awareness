<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { AlertTriangle, Newspaper } from "lucide-react";

// --- INTERFACES ---
interface Article {
  title: string;
  author: string | null;
  publishedAt: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  source: { name: string };
}

// Interface for the data we will store in the browser's local storage
interface CachedData {
  articles: Article[];
  timestamp: number;
}

// --- REUSABLE UI COMPONENTS ---

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700">
    <div className="w-full h-48 bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
    <div className="p-6">
      <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse mb-4"></div>
      <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse mb-6"></div>
      <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse mb-2"></div>
      <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse mb-2"></div>
      <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
    </div>
  </div>
);

const ArticleCard = ({ article }: { article: Article }) => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col h-full"
  >
    {article.urlToImage ? (
      <img
        src={article.urlToImage}
        alt={article.title}
        className="w-full h-48 object-cover"
        onError={(e) => {
          // If the image fails to load, we can hide it or show a placeholder.
          // For now, we'll just hide the broken image icon.
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    ) : (
      <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-b border-slate-200 dark:border-slate-700">
        <Newspaper size={48} className="text-slate-400 dark:text-slate-500" />
      </div>
    )}
    <div className="p-6 flex-grow flex flex-col">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
        {article.title}
      </h2>
      <p className="text-slate-600 dark:text-slate-300 text-sm flex-grow mb-4">
        {article.description || "No description available."}
      </p>
      <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <p className="font-semibold truncate">{article.author || article.source.name}</p>
          <p>{new Date(article.publishedAt).toLocaleDateString()}</p>
        </div>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Read More &rarr;
        </a>
      </div>
    </div>
  </motion.article>
);


// --- MAIN BLOG PAGE COMPONENT ---

const Blog: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      const cacheKey = "aiNewsData";
      const twentyFourHoursInMillis = 24 * 60 * 60 * 1000;

      // --- CACHING LOGIC START ---
      try {
        const cachedDataString = localStorage.getItem(cacheKey);
        if (cachedDataString) {
          const cachedData: CachedData = JSON.parse(cachedDataString);
          const isCacheValid = (new Date().getTime() - cachedData.timestamp) < twentyFourHoursInMillis;

          if (isCacheValid) {
            console.log("Loading news from cache. No API call needed.");
            setArticles(cachedData.articles);
            setLoading(false);
            return; // Use cached data and stop execution
          }
        }
      } catch (e) {
        console.error("Could not read cache, will fetch from API.", e);
      }
      // --- CACHING LOGIC END ---

      // --- API FETCHING LOGIC ---
      console.log("Cache is empty or stale. Fetching fresh news from API.");

      const apiKey = "80ed92ce366e48f2a717fc3381649768";

      const url = `https://newsapi.org/v2/everything?q=artificial+intelligence&language=en&sortBy=publishedAt&pageSize=9&apiKey=${apiKey}`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === "ok") {
          const freshArticles: Article[] = data.articles;
          setArticles(freshArticles);

          // Save the new data and a new timestamp to the browser's cache
          const dataToCache: CachedData = {
            articles: freshArticles,
            timestamp: new Date().getTime()
          };
          localStorage.setItem(cacheKey, JSON.stringify(dataToCache));

        } else {
          setError(data.message || "An error occurred while fetching news.");
          console.error("Error from NewsAPI:", data);
        }
      } catch (err) {
        setError("Failed to connect to the news service. Check your internet connection.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Latest in Artificial Intelligence
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Stay updated with the most recent news, insights, and breakthroughs in the world of AI.
          </p>
        </motion.div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto text-center p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">Could Not Load News</h2>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <ArticleCard key={article.url + index} article={article} />
            ))}
          </div>
        )}
=======
import React from 'react';

const blogPosts = [
  {
    title: 'Our Mission: A Deep Dive into Creating Awareness',
    author: 'Jane Doe, Founder',
    date: 'October 26, 2025',
    excerpt: 'From our humble beginnings to our vision for the future, discover the core principles that drive our platform and our commitment to making a difference...'
  },
  {
    title: 'Community Spotlight: How One Volunteer is Changing Their Town',
    author: 'John Smith, Community Manager',
    date: 'October 22, 2025',
    excerpt: 'We had the pleasure of sitting down with Sarah Chen, a dedicated volunteer who has been instrumental in organizing local clean-up events. Here is her story...'
  },
  {
    title: '5 Simple Ways You Can Contribute to a Greener Planet Today',
    author: 'Eco Warriors Team',
    date: 'October 18, 2025',
    excerpt: 'Making a positive impact on the environment doesn’t have to be overwhelming. Here are five easy and effective habits you can adopt right now...'
  },
];

const Blog: React.FC = () => {
  const handleReadMore = (e: React.MouseEvent<HTMLAnchorElement>, title: string) => {
    e.preventDefault();
    alert(`Continue reading: ${title}`);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4 text-primary tracking-tight">From the Blog</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Read the latest articles, stories, and updates from our team and community contributors.
        </p>
      </div>
      <div className="max-w-4xl mx-auto space-y-12">
        {blogPosts.map((post, index) => (
          <article key={index} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 hover:text-primary transition-colors">
              <a href="#" onClick={(e) => handleReadMore(e, post.title)}>{post.title}</a>
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span>By {post.author}</span> &bull; <span>{post.date}</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">{post.excerpt}</p>
            <a href="#" onClick={(e) => handleReadMore(e, post.title)} className="font-bold text-primary hover:underline">Continue Reading &rarr;</a>
          </article>
        ))}
>>>>>>> d53c058a (chatbot-commit)
      </div>
    </div>
  );
};

export default Blog;