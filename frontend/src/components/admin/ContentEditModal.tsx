import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, X } from 'lucide-react';
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
        articles: 'http://localhost:8000/api/content/articles/',
        games: 'http://localhost:8000/api/content/games/',
        quiz: 'http://localhost:8000/api/content/quiz/',
        awareness: 'http://localhost:8000/api/content/awareness/'
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = endpoints[contentType];
            // Determine if create or update - assuming if item has ID it's update
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{item?.id ? 'Edit Content' : 'Create New'}</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-red-500 transition-colors"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={formData.is_active || false}
                            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-300">Active (Visible to Users)</label>
                    </div>

                    {/* Description / Teaser */}
                    {(contentType === 'articles' || contentType === 'awareness') && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description / Teaser</label>
                            <textarea
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white h-24 focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.description || formData.teaser || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value, teaser: e.target.value })}
                            />
                        </div>
                    )}

                    {/* Blog Content */}
                    {(contentType === 'articles') && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Content (Markdown/HTML)</label>
                            <textarea
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white h-48 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.content || ''}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                            />
                        </div>
                    )}

                    {/* JSON Editor for Complex Data */}
                    {['games', 'quiz', 'awareness'].includes(contentType) && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Advanced Data Structure (JSON)
                            </label>
                            <div className="relative">
                                <textarea
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-green-400 font-mono text-xs h-60 focus:ring-2 focus:ring-indigo-500 outline-none"
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
                                <div className="absolute top-2 right-2 text-[10px] text-slate-400 pointer-events-none">JSON</div>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Edit the raw data structure for questions, modules, or game configs.</p>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md flex items-center gap-2 font-bold transition-transform active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
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
