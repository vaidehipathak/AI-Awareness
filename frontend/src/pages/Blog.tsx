import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from 'next-themes';
import { BookOpen, Calendar, User, Search, Tag, ArrowRight, X, Clock, Eye, Share2, Bookmark, Plus, Trash, Edit3, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import AdminActionButtons from '../components/admin/AdminActionButtons';
import ContentEditModal from '../components/admin/ContentEditModal';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  imageUrl: string;
  tags: string[];
}

const BlogPage: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [isCreating, setIsCreating] = useState(false);

  // Categories for filter
  const categories = ['All', 'AI Safety', 'Ethics', 'cybersecurity', 'Deepfakes', 'Guide'];

  const fetchPosts = async () => {
    try {
      // Fetch from the NewsAPI endpoint
      const res = await axios.get('http://localhost:8000/api/content/news/');

      // Map NewsAPI response to BlogPost format
      const mappedPosts = res.data.map((article: any) => ({
        id: article.url, // Use URL as unique ID since NewsAPI doesn't provide IDs
        title: article.title,
        excerpt: article.description || 'Click to read more.',
        content: article.content || article.description || 'Read the full article at the source.',
        author: article.author || 'Unknown Author',
        date: new Date(article.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        category: article.source?.name || 'AI News',
        readTime: '5 min read', // Default read time
        imageUrl: article.urlToImage || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000',
        tags: ['AI', 'News', 'Technology']
      }));

      setPosts(mappedPosts);
    } catch (err) {
      console.error("Failed to fetch news articles", err);
      // Fallback dummy data if backend fails
      setPosts([
        {
          id: '1',
          title: 'The Rise of Generative AI: Risks and Rewards',
          excerpt: 'Exploring how large language models are reshaping the digital landscape and the safety challenges they present.',
          content: 'Generative AI has taken the world by storm...',
          author: 'Dr. Sarah Chen',
          date: 'Oct 12, 2023',
          category: 'AI Safety',
          readTime: '5 min read',
          imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000',
          tags: ['LLMs', 'Future', 'Tech']
        },
        {
          id: '2',
          title: 'Spotting Deepfakes: A Visual Guide',
          excerpt: 'Learn the subtle visual artifacts that giveaway synthetic media in videos and images.',
          content: 'Deepfakes are becoming increasingly realistic...',
          author: 'Marcus J. ',
          date: 'Nov 05, 2023',
          category: 'Deepfakes',
          readTime: '8 min read',
          imageUrl: 'https://images.unsplash.com/photo-1633419461186-7d40a2e50594?auto=format&fit=crop&q=80&w=1000',
          tags: ['Security', 'Media', 'Guide']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const FeaturedPost = ({ post }: { post: BlogPost }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-[2.5rem] overflow-hidden mb-16 group cursor-pointer h-[500px]"
      onClick={() => setSelectedPost(post)}
    >
      <div className="absolute inset-0">
        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/90 to-slate-900/40" />
      </div>
      <div className="absolute bottom-0 left-0 p-10 md:p-16 max-w-4xl">
        <div className="flex items-center gap-4 text-white/80 mb-6 text-sm font-bold uppercase tracking-widest">
          <span className="bg-indigo-600 px-3 py-1 rounded-lg text-white">{post.category}</span>
          <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {post.date}</span>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {post.readTime}</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight group-hover:text-indigo-200 transition-colors">
          {post.title}
        </h1>
        <p className="text-lg md:text-xl text-slate-300 line-clamp-2 leading-relaxed max-w-2xl mb-8">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-3 text-white font-bold group-hover:gap-6 transition-all">
          Read Full Article <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );

  const PostCard = ({ post }: { post: BlogPost }) => (
    <motion.div
      layoutId={`card-${post.id}`}
      whileHover={{ y: -8, scale: 1.01 }}
      className="bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col h-full group relative"
      onClick={() => setSelectedPost(post)}
    >

      <div className="h-48 overflow-hidden relative">
        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          {post.category}
        </div>
      </div>
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><Calendar size={12} /> {post.date}</span>
          <span className="flex items-center gap-1.5"><Clock size={12} /> {post.readTime}</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {post.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-6 flex-grow">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
              {post.author.charAt(0)}
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{post.author}</span>
          </div>
          <div className="p-2 rounded-full bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <ArrowRight size={18} />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const PostDetailModal = () => {
    if (!selectedPost) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedPost(null)}
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
        />
        <motion.div
          layoutId={`card-${selectedPost.id}`}
          className="relative bg-white dark:bg-[#0a0a0a] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl"
        >
          <button
            onClick={() => setSelectedPost(null)}
            className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
          >
            <X size={24} />
          </button>
          <div className="relative h-[400px]">
            <img src={selectedPost.imageUrl} alt={selectedPost.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-900/95" />
            <div className="absolute bottom-0 left-0 p-10 md:p-12 w-full">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest">{selectedPost.category}</span>
                <span className="text-slate-300 text-sm font-bold flex items-center gap-2"><Clock size={14} /> {selectedPost.readTime}</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">{selectedPost.title}</h2>
              <div className="flex items-center justify-between text-white/80">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {selectedPost.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{selectedPost.author}</p>
                    <p className="text-xs text-white/60">{selectedPost.date}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Share2 size={20} /></button>
                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Bookmark size={20} /></button>
                </div>
              </div>
            </div>
          </div>
          <div className="p-10 md:p-16 prose dark:prose-invert prose-lg max-w-none">
            <p className="lead text-xl md:text-2xl font-medium text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              {selectedPost.excerpt}
            </p>
            <div className="text-slate-700 dark:text-slate-300 leading-8 space-y-6">
              {selectedPost.content.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Link to original article */}
            <div className="mt-8">
              <a
                href={selectedPost.id}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/30"
              >
                Read Full Article at Source <ArrowRight size={18} />
              </a>
            </div>

            <div className="mt-12 pt-12 border-t border-slate-200 dark:border-white/10">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPost.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-sm font-medium">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const AdminToolbar = () => {
    if (user?.role !== 'ADMIN') return null;
    return (
      <div className="mb-12 flex justify-end">
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/30"
        >
          <Plus size={20} /> New Article
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 font-sans relative overflow-hidden">
      {/* --- AMBIENT BACKGROUND --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/40 dark:bg-white/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest mb-8 border border-white/20 backdrop-blur-md shadow-sm"
          >
            <BookOpen size={14} /> Knowledge Hub
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tight"
          >
            Insights & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Updates</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed"
          >
            Stay ahead of the curve with the latest research, safety protocols, and community guides.
          </motion.p>
        </div>

        <AdminToolbar />

        {/* Grid - Show all articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20 opacity-50">
            <p className="text-xl font-medium">No articles found matching your criteria.</p>
          </div>
        )}

        <AnimatePresence>
          {selectedPost && <PostDetailModal />}
        </AnimatePresence>

        <ContentEditModal
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          item={null}
          contentType="articles"
          onSuccess={fetchPosts}
        />

      </div>
    </div>
  );
};

export default BlogPage;
