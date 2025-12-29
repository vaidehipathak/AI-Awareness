import React, { useEffect, useState } from "react";
import axios from 'axios';
import { motion } from 'framer-motion';
import { AlertTriangle, Newspaper, Plus } from "lucide-react";
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

const ArticleCard = ({ article, onUpdate }: { article: Article, onUpdate: () => void }) => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className={`bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border ${article.is_active ? 'border-slate-200 dark:border-slate-700' : 'border-red-300 dark:border-red-800 opacity-75'} flex flex-col h-full relative group`}
  >
    {/* Admin Controls Overlay */}
    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
      <AdminActionButtons item={article} contentType="articles" onUpdate={onUpdate} />
    </div>

    {article.urlToImage ? (
      <img
        src={article.urlToImage}
        alt={article.title}
        className="w-full h-48 object-cover"
        onError={(e) => {
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
        {!article.is_active && <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Hidden</span>}
      </h2>
      <p className="text-slate-600 dark:text-slate-300 text-sm flex-grow mb-4">
        {article.description || "No description available."}
      </p>
      <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <p className="font-semibold truncate">{article.author || article.source?.name || 'Unknown'}</p>
          <p>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}</p>
        </div>
        {article.url && article.url !== '#' ? (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
          >
            Read More &rarr;
          </a>
        ) : (
          <span className="font-bold text-sm text-slate-400 dark:text-slate-500 whitespace-nowrap">
            No Link
          </span>
        )}
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
              <ArticleCard key={article.id || index} article={article} onUpdate={fetchArticles} />
            ))}
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No articles found.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Main Render Logic
  if (user?.role === 'ADMIN') {
    return <AdminBlogList />;
  }

  return <LearnerBlogView />;
};

export default Blog;