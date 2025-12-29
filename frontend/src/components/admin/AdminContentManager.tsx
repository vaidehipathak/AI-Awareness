import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Edit, Trash2, Eye, EyeOff, Plus, Save, X } from 'lucide-react';

// Generic Interface for all content
interface ContentItem {
    id: number;
    title: string;
    is_active: boolean;
    [key: string]: any;
}

const AdminContentManager: React.FC = () => {
    const { token } = useAuth();
    const [activeSection, setActiveSection] = useState<'articles' | 'games' | 'quiz' | 'awareness'>('articles');
    const [items, setItems] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Edit/Create State
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
    const [formData, setFormData] = useState<any>({});

    const endpoints = {
        articles: 'http://localhost:8000/api/content/articles/',
        games: 'http://localhost:8000/api/content/games/',
        quiz: 'http://localhost:8000/api/content/quiz/',
        awareness: 'http://localhost:8000/api/content/awareness/'
    };

    useEffect(() => {
        fetchItems();
    }, [activeSection]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await axios.get(endpoints[activeSection], {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(res.data.results || res.data); // Handle pagination or list
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (item: ContentItem) => {
        try {
            await axios.patch(`${endpoints[activeSection]}${item.id}/`,
                { is_active: !item.is_active },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchItems(); // Refresh
        } catch (err) {
            console.error("Failed to toggle", err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure? This is a soft delete.")) return;
        try {
            await axios.delete(`${endpoints[activeSection]}${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchItems();
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    const handleEdit = (item: ContentItem) => {
        setEditingItem(item);
        setFormData({ ...item });
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingItem(null);
        setFormData({ title: '', is_active: true });
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await axios.patch(`${endpoints[activeSection]}${editingItem.id}/`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(endpoints[activeSection], formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            fetchItems();
        } catch (err) {
            console.error("Save failed", err);
            alert("Failed to save. Check console for details.");
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                {Object.keys(endpoints).map((key) => (
                    <button
                        key={key}
                        onClick={() => setActiveSection(key as any)}
                        className={`px-6 py-4 text-sm font-medium capitalize transition-colors ${activeSection === key
                            ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        {key}
                    </button>
                ))}
            </div>

            {/* Toolbar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-gray-700 dark:text-gray-200 capitalize">{activeSection} Management</h3>
                <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                    <Plus className="w-4 h-4" /> Create New
                </button>
            </div>

            {/* List */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading content...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                                <th className="p-4">Title</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {items.length === 0 && (
                                <tr><td colSpan={3} className="p-8 text-center text-slate-400">No items found.</td></tr>
                            )}
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{item.title}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                                            {item.is_active ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        <button onClick={() => handleToggle(item)} className="p-2 text-slate-500 hover:text-indigo-600 transition-colors" title="Toggle Status">
                                            {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                        <button onClick={() => handleEdit(item)} className="p-2 text-slate-500 hover:text-blue-600 transition-colors" title="Edit">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-500 hover:text-red-600 transition-colors" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Edit/Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                            <h3 className="font-bold text-lg dark:text-white">{editingItem ? 'Edit Item' : 'Create New'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-red-500"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-300">Active (Visible to Users)</label>
                            </div>

                            {/* Dynamic Fields based on Type - Simplified for Part 2 */}
                            {(activeSection === 'articles' || activeSection === 'awareness') && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description/Teaser</label>
                                    <textarea
                                        className="w-full px-4 py-2 rounded-lg border dark:bg-slate-900 dark:border-slate-700 dark:text-white h-24"
                                        value={formData.description || formData.teaser || ''}
                                        onChange={e => setFormData({ ...formData, description: e.target.value, teaser: e.target.value })}
                                    />
                                </div>
                            )}

                            {/* JSON Editor Fallback for Complex Data */}
                            {['games', 'quiz', 'awareness'].includes(activeSection) && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Advanced Data (JSON)
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-2 rounded-lg border dark:bg-slate-900 dark:border-slate-700 dark:text-white font-mono text-xs h-40"
                                        defaultValue={
                                            JSON.stringify(
                                                activeSection === 'games' ? formData.game_data :
                                                    activeSection === 'quiz' ? formData.questions :
                                                        activeSection === 'awareness' ? formData.modules : {},
                                                null, 2
                                            )
                                        }
                                        onChange={e => {
                                            try {
                                                const val = JSON.parse(e.target.value);
                                                // Only update if valid JSON
                                                if (activeSection === 'games') setFormData({ ...formData, game_data: val });
                                                if (activeSection === 'quiz') setFormData({ ...formData, questions: val });
                                                if (activeSection === 'awareness') setFormData({ ...formData, modules: val });
                                            } catch (err) {
                                                // Ignore errors while typing
                                            }
                                        }}
                                    />
                                </div>
                            )}

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md flex items-center gap-2">
                                    <Save className="w-4 h-4" /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminContentManager;
