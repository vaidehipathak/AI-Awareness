import React, { useEffect, useState } from "react";
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Newspaper, Plus, X, ExternalLink, Calendar, User } from "lucide-react";
import { useTheme } from 'next-themes';
import { useAuth } from '../contexts/AuthContext';
import ContentEditModal from '../components/admin/ContentEditModal';
import AdminActionButtons from "../components/admin/AdminActionButtons";

// --- INTERFACES ---
interface Article {
  id: number;
  is_active: boolean;
  title: string;
  author: string | null;
  publishedAt: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  source: { name: string };
  content?: string;
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

const ArticleDetailModal = ({ article, onClose }: { article: Article; onClose: () => void }) => {
  if (!article) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
        >
          <div className="relative h-64 sm:h-80 w-full flex-shrink-0">
            {article.urlToImage ? (
              <img
                src={article.urlToImage}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center">
                <Newspaper size={64} className="text-indigo-300 dark:text-indigo-500/50" />
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-md"
            >
              <X size={20} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-24">
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight shadow-sm">
                {article.title}
              </h2>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="flex items-center gap-2">
                <User size={16} className="text-indigo-500" />
                <span className="font-medium">{article.author || article.source.name || "Unknown Author"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-indigo-500" />
                <span>{new Date(article.publishedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
              </div>
              {article.source?.name && (
                <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider">
                  {article.source.name}
                </div>
              )}
            </div>

            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
              <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-6 border-l-4 border-indigo-500 pl-4 bg-slate-50 dark:bg-slate-800/50 py-2 rounded-r-lg">
                {article.description}
              </p>
              <div className="whitespace-pre-wrap">
                {article.content || "No detailed content available for this article."}
              </div>
            </div>

            {article.url && article.url !== '#' && (
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  Read Source Article <ExternalLink size={18} />
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const ArticleCard = ({ article, onUpdate, onClick }: { article: Article, onUpdate: () => void, onClick: (a: Article) => void }) => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -8, scale: 1.02 }}
    className={`bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden border ${article.is_active ? 'border-white/20 dark:border-white/10' : 'border-red-500/50 opacity-75'} flex flex-col h-full relative group transition-all duration-300 cursor-pointer`}
    onClick={() => onClick(article)}
  >
    {/* Admin Controls Overlay */}
    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
      <AdminActionButtons item={article} contentType="articles" onUpdate={onUpdate} />
    </div>

    {article.urlToImage ? (
      <div className="relative h-48 overflow-hidden">
        <img
          src={article.urlToImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    ) : (
      <div className="w-full h-48 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center border-b border-white/10">
        <Newspaper size={48} className="text-indigo-300 dark:text-indigo-500/50" />
      </div>
    )}

    <div className="p-8 flex-grow flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {article.title}
          {!article.is_active && <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Hidden</span>}
        </h2>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
          <span>{article.source?.name || 'News'}</span>
          <span>•</span>
          <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Recent'}</span>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-sm flex-grow mb-6 leading-relaxed line-clamp-3">
        {article.description || "No description available."}
      </p>

      <div className="mt-auto pt-6 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
        <div className="text-xs text-gray-400 dark:text-gray-500 font-medium truncate max-w-[120px]">
          {article.author || 'AwareX'}
        </div>
        <button
          className="flex items-center gap-2 font-bold text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
        >
          Read Article
        </button>
      </div>
    </div>
  </motion.article>
);


// --- MAIN BLOG PAGE COMPONENT ---

const Blog: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch from NewsAPI proxy endpoint (with database fallback)
      const response = await axios.get('http://localhost:8000/api/content/news/');

      const newsArticles = response.data;

      const mappedArticles: Article[] = newsArticles.map((a: any, index: number) => ({
        id: a.id || index + 1000, // NewsAPI articles don't have DB IDs, use index-based ID
        is_active: true,
        title: a.title,
        author: a.author,
        publishedAt: a.publishedAt || a.published_at,
        description: a.description,
        url: a.url || a.source_url || '#',
        urlToImage: a.urlToImage || a.image_url,
        source: a.source || { name: a.source_name || 'News' },
        content: a.content
      }));

      setArticles(mappedArticles);
    } catch (err) {
      setError('Failed to load articles. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (article: Article) => {
    // If the URL is external and valid, open it (OLD BEHAVIOR)
    // BUT USER WANTS "READ IT COMPLETE" in the app if likely?
    // Actually, standard is: External -> New Tab. Internal -> Modal/Page.
    // But let's check if the URL is dummy ('#').
    if (article.url && article.url !== '#') {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    } else {
      // Internal or dummy URL -> Show Modal with content
      setSelectedArticle(article);
    }
  };


  useEffect(() => {
    fetchArticles();
  }, []);

  /* ---------------- ADMIN VIEW ---------------- */

  const AdminBlogList = () => {
    const [isCreating, setIsCreating] = useState(false);

    if (user?.role !== 'ADMIN') return null;

    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'} p-8`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Blog Management</h1>
              <p className={`mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Create, edit, and manage news articles and blog posts.
              </p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create New Article
            </button>
          </div>

          {/* Management Table */}
          <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className={`bg-slate-50 dark:bg-slate-700/50 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <tr>
                    <th className="px-6 py-4 font-semibold">ID</th>
                    <th className="px-6 py-4 font-semibold">Title</th>
                    <th className="px-6 py-4 font-semibold">Author/Source</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Published</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                  {articles.map(article => (
                    <tr key={article.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs opacity-50">#{article.id}</td>
                      <td className={`px-6 py-4 font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{article.title}</td>
                      <td className="px-6 py-4 text-xs opacity-75">{article.author || article.source?.name || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${article.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                          {article.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs opacity-75">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <AdminActionButtons item={article} contentType="articles" onUpdate={fetchArticles} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {articles.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No articles found. Create one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <ContentEditModal
            isOpen={isCreating}
            onClose={() => setIsCreating(false)}
            item={null}
            contentType="articles"
            onSuccess={fetchArticles}
          />
        </div>
      </div>
    );
  };

  /* ---------------- LEARNER VIEW ---------------- */

  const LearnerBlogView = () => (
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
              <ArticleCard
                key={article.id || index}
                article={article}
                onUpdate={fetchArticles}
                onClick={handleArticleClick}
              />
            ))}
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No articles found.</p>
          </div>
        )}
      </div>

      <ArticleDetailModal
        article={selectedArticle!}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );

  // Main Render Logic
  if (user?.role === 'ADMIN') {
    return <AdminBlogList />;
  }

  return <LearnerBlogView />;
};

export default Blog;