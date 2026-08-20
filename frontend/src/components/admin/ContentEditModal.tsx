import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { Save, X, Edit3, Sparkles, Code, Image as ImageIcon, User, Folder } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ContentEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: any;
    contentType: 'articles' | 'games' | 'quiz' | 'awareness' | 'news';
    onSuccess: () => void;
}

const CATEGORY_OPTIONS = [
    'AI Safety',
    'Ethics',
    'Cybersecurity',
    'Deepfakes',
    'Guide',
    'Threat Intel',
    'Privacy & LLMs',
    'General AI'
];

const ContentEditModal: React.FC<ContentEditModalProps> = ({ isOpen, onClose, item, contentType, onSuccess }) => {
    const { token, user } = useAuth();
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData({ ...item });
        } else {
            setFormData({
                is_active: true,
                author: user?.username || 'AwareX Editorial',
                source_name: 'AI Safety',
                game_type: 'OTHER',
                difficulty: 'easy'
            });
        }
        setImageError(false);
    }, [item, user, isOpen]);

    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const endpoints = {
        articles: `${API_BASE_URL}/api/content/articles/`,
        games: `${API_BASE_URL}/api/content/games/`,
        quiz: `${API_BASE_URL}/api/content/quiz/`,
        awareness: `${API_BASE_URL}/api/content/awareness/`,
        news: `${API_BASE_URL}/api/content/news-cache/`
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const activeToken = localStorage.getItem('auth_token') || token;
            const headers = activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
            const endpoint = endpoints[contentType];

            if (item && item.id) {
                await axios.patch(`${endpoint}${item.id}/`, formData, { headers });
            } else {
                await axios.post(endpoint, formData, { headers });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Save failed", err);
            // Retry with refreshed token if 401
            const refresh = localStorage.getItem('auth_refresh');
            if (refresh && err.response?.status === 401) {
                try {
                    const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh });
                    const newAccess = res.data.access;
                    localStorage.setItem('auth_token', newAccess);
                    const endpoint = endpoints[contentType];
                    if (item && item.id) {
                        await axios.patch(`${endpoint}${item.id}/`, formData, {
                            headers: { Authorization: `Bearer ${newAccess}` }
                        });
                    } else {
                        await axios.post(endpoint, formData, {
                            headers: { Authorization: `Bearer ${newAccess}` }
                        });
                    }
                    onSuccess();
                    onClose();
                    return;
                } catch (retryErr) {
                    console.error("Retry save failed", retryErr);
                }
            }
            alert(err.response?.data?.detail || "Failed to save changes. Please check required fields.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isEdit = Boolean(item && item.id);
    const contentTypeLabels: Record<string, string> = {
        articles: 'Blog Article',
        games: 'Game Entry',
        quiz: 'Quiz Question Set',
        awareness: 'Awareness Module',
        news: 'News Feed Article'
    };

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-[#0f1015] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl h-[85vh] max-h-[720px] flex flex-col border border-slate-200 dark:border-white/10 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                
                {/* Fixed Header */}
                <div className="p-4 sm:p-5 px-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-slate-900/80 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            {isEdit ? <Edit3 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                                {isEdit ? `Edit ${contentTypeLabels[contentType] || 'Content'}` : `Create ${contentTypeLabels[contentType] || 'Content'}`}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {isEdit ? `Updating item #${item.id}` : 'Fill in the fields below to publish immediately.'}
                            </p>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
                        title="Close (Esc)"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Form Body with min-h-0 */}
                <form id="content-edit-form" onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 flex-1 min-h-0 overflow-y-auto">
                    
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Enter a descriptive title..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {/* Active/Published Toggle Switch */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>Publication Status</span>
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${formData.is_active ? 'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/20' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'}`}>
                                    {formData.is_active ? 'Active / Visible' : 'Draft / Hidden'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Controls public visibility for learners and standard users.</p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={formData.is_active ?? true}
                            onClick={() => setFormData({ ...formData, is_active: !(formData.is_active ?? true) })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0 ${formData.is_active ?? true ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ?? true ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* --- ARTICLE / NEWS SPECIFIC FIELDS --- */}
                    {(contentType === 'articles' || contentType === 'news') && (
                        <>
                            {/* Author & Category Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-indigo-500" /> Author Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Dr. Sarah Chen, AwareX Team"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all text-sm"
                                        value={formData.author || ''}
                                        onChange={e => setFormData({ ...formData, author: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                                        <Folder className="w-3.5 h-3.5 text-indigo-500" /> Category / Source
                                    </label>
                                    <input
                                        type="text"
                                        list="category-suggestions"
                                        placeholder="e.g. AI Safety, Wired, Yahoo"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900/70 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all text-sm"
                                        value={formData.source_name || ''}
                                        onChange={e => setFormData({ ...formData, source_name: e.target.value })}
                                    />
                                    <datalist id="category-suggestions">
                                        {CATEGORY_OPTIONS.map(cat => (
                                            <option key={cat} value={cat} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>

                            {/* Cover Image URL with Live Preview */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                                    <ImageIcon className="w-3.5 h-3.5 text-indigo-500" /> Cover Image URL
                                </label>
                                <div className="flex gap-3 items-start">
                                    <input
                                        type="url"
                                        placeholder="https://images.unsplash.com/... or direct image link"
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all text-sm font-mono text-xs"
                                        value={formData.url_to_image || formData.image_url || ''}
                                        onChange={e => {
                                            setImageError(false);
                                            setFormData({ ...formData, image_url: e.target.value, url_to_image: e.target.value });
                                        }}
                                    />
                                    {(formData.url_to_image || formData.image_url) && !imageError && (
                                        <div className="w-14 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 shrink-0 bg-slate-100 dark:bg-slate-800">
                                            <img
                                                src={formData.url_to_image || formData.image_url}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                                onError={() => setImageError(true)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Description / Teaser */}
                    {(contentType === 'articles' || contentType === 'awareness' || contentType === 'news') && (
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                                Summary / Excerpt
                            </label>
                            <textarea
                                placeholder="Short overview displayed on cards and search previews..."
                                rows={2}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all text-sm resize-y"
                                value={formData.description || formData.teaser || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value, teaser: e.target.value })}
                            />
                        </div>
                    )}

                    {/* Blog Content Body */}
                    {(contentType === 'articles' || contentType === 'news') && (
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                                <span>Article Content (Markdown / HTML)</span>
                                <span className="text-[11px] text-slate-400 font-normal">Supports full markdown</span>
                            </label>
                            <textarea
                                rows={8}
                                placeholder="Write your full article content here using Markdown formatting..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all leading-relaxed resize-y"
                                value={formData.content || ''}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                            />
                        </div>
                    )}

                    {/* JSON Editor for Complex Data */}
                    {['games', 'quiz', 'awareness'].includes(contentType) && (
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                    <Code className="w-4 h-4 text-indigo-400" /> Data Structure (JSON)
                                </label>
                                <span className="text-[11px] text-indigo-500 dark:text-indigo-400 font-mono font-medium">Valid JSON</span>
                            </div>
                            <div className="relative rounded-xl border border-slate-300 dark:border-white/15 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-500">
                                <textarea
                                    className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-xs h-56 outline-none leading-relaxed resize-y scrollbar-thin"
                                    defaultValue={
                                        JSON.stringify(
                                            contentType === 'games' ? (formData.game_data || []) :
                                                contentType === 'quiz' ? (formData.questions || []) :
                                                    contentType === 'awareness' ? (formData.modules || []) : {},
                                            null, 2
                                        )
                                    }
                                    onChange={e => {
                                        try {
                                            const val = JSON.parse(e.target.value);
                                            if (contentType === 'games') setFormData({ ...formData, game_data: val });
                                            if (contentType === 'quiz') setFormData({ ...formData, questions: val });
                                            if (contentType === 'awareness') setFormData({ ...formData, modules: val });
                                        } catch (err) {
                                            // Ignore typing syntax errors
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </form>

                {/* Fixed Footer */}
                <div className="p-4 px-6 border-t border-slate-200 dark:border-white/10 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/80 shrink-0">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-5 py-2 text-slate-700 hover:bg-slate-200/50 dark:text-slate-300 dark:hover:bg-white/10 rounded-xl font-medium text-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="content-edit-form"
                        disabled={loading}
                        className={`px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 text-sm font-bold transition-all active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save & Publish'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContentEditModal;
