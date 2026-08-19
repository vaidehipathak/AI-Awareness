import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { Save, X, Edit3, Sparkles, FileText, CheckSquare, Code } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ContentEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: any;
    contentType: 'articles' | 'games' | 'quiz' | 'awareness';
    onSuccess: () => void;
}

const ContentEditModal: React.FC<ContentEditModalProps> = ({ isOpen, onClose, item, contentType, onSuccess }) => {
    const { token } = useAuth();
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData({ ...item });
        } else {
            setFormData({});
        }
    }, [item]);

    const endpoints = {
        articles: `${API_BASE_URL}/api/content/articles/`,
        games: `${API_BASE_URL}/api/content/games/`,
        quiz: `${API_BASE_URL}/api/content/quiz/`,
        awareness: `${API_BASE_URL}/api/content/awareness/`
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = endpoints[contentType];
            if (item && item.id) {
                await axios.patch(`${endpoint}${item.id}/`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(endpoint, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Save failed", err);
            alert("Failed to save changes. Please try again.");
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
        awareness: 'Awareness Module'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#12131a] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-white/10 flex flex-col">
                
                {/* Modal Header */}
                <div className="p-5 px-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-gradient-to-r dark:from-indigo-950/40 dark:to-slate-900/60 sticky top-0 z-10 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            {isEdit ? <Edit3 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                                {isEdit ? `Edit ${contentTypeLabels[contentType] || 'Content'}` : `Create ${contentTypeLabels[contentType] || 'Content'}`}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {isEdit ? `Modifying item #${item.id}` : 'Fill in the fields below to publish new content.'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleSave} className="p-6 space-y-5 flex-1">
                    
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

                    {/* Active Checkbox */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckSquare className="w-5 h-5 text-indigo-500" />
                            <div>
                                <label htmlFor="is_active" className="text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                                    Active / Published
                                </label>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Controls visibility for end-users on the platform.</p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            id="is_active"
                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                            checked={formData.is_active || false}
                            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                        />
                    </div>

                    {/* Description / Teaser */}
                    {(contentType === 'articles' || contentType === 'awareness') && (
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                                Description / Teaser Summary
                            </label>
                            <textarea
                                placeholder="Short overview or summary displayed on content cards..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 h-24 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all text-sm resize-y"
                                value={formData.description || formData.teaser || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value, teaser: e.target.value })}
                            />
                        </div>
                    )}

                    {/* Blog Content */}
                    {(contentType === 'articles') && (
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                                Full Article Content (Markdown / HTML)
                            </label>
                            <textarea
                                placeholder="Write the main article content here using Markdown or HTML formatting..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 h-48 font-mono text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all leading-relaxed resize-y"
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
                                    <Code className="w-4 h-4 text-indigo-400" /> Advanced Data Structure (JSON)
                                </label>
                                <span className="text-[11px] text-indigo-500 dark:text-indigo-400 font-mono font-medium">Valid JSON Required</span>
                            </div>
                            <div className="relative rounded-xl border border-slate-300 dark:border-white/15 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-500">
                                <textarea
                                    className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-xs h-60 outline-none leading-relaxed resize-y scrollbar-thin"
                                    defaultValue={
                                        JSON.stringify(
                                            contentType === 'games' ? formData.game_data :
                                                contentType === 'quiz' ? formData.questions :
                                                    contentType === 'awareness' ? formData.modules : {},
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
                                            // Ignore parsing errors while typing
                                        }
                                    }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                                Direct JSON editor for interactive quiz questions, game parameters, or awareness modules.
                            </p>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/10 mt-6">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-5 py-2.5 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 rounded-xl font-medium text-sm transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 text-sm font-bold transition-all active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContentEditModal;

