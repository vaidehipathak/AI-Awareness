import React, { useState } from 'react';
import axios from 'axios';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ContentEditModal from './ContentEditModal';

interface AdminActionButtonsProps {
    item: any;
    contentType: 'articles' | 'games' | 'quiz' | 'awareness';
    onUpdate: () => void; // Trigger parent refresh
}

const AdminActionButtons: React.FC<AdminActionButtonsProps> = ({ item, contentType, onUpdate }) => {
    const { user, token } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Only show for ADMINS
    if (!user || user.role !== 'ADMIN') return null;

    const endpoints = {
        articles: 'http://localhost:8000/api/content/articles/',
        games: 'http://localhost:8000/api/content/games/',
        quiz: 'http://localhost:8000/api/content/quiz/',
        awareness: 'http://localhost:8000/api/content/awareness/'
    };

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setLoading(true);
        try {
            await axios.patch(`${endpoints[contentType]}${item.id}/`,
                { is_active: !item.is_active },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onUpdate();
        } catch (err) {
            console.error("Toggle failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this item? This is a soft delete.")) return;

        setLoading(true);
        try {
            await axios.delete(`${endpoints[contentType]}${item.id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onUpdate();
        } catch (err) {
            console.error("Delete failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowModal(true);
    };

    if (loading) return <div className="text-xs text-slate-400">Updating...</div>;

    return (
        <>
            <div className="flex items-center gap-1 bg-white/90 dark:bg-black/60 backdrop-blur rounded-lg shadow-sm border border-slate-200 dark:border-white/10 p-1" onClick={e => e.stopPropagation()}>
                <button
                    onClick={handleToggle}
                    className={`p-1.5 rounded-md transition-colors ${item.is_active ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                    title={item.is_active ? "Visible (Click to Hide)" : "Hidden (Click to Show)"}
                >
                    {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                    onClick={handleEditClick}
                    className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="Edit Content"
                >
                    <Edit className="w-4 h-4" />
                </button>

                <button
                    onClick={handleDelete}
                    className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete Content"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <ContentEditModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                item={item}
                contentType={contentType}
                onSuccess={onUpdate}
            />
        </>
    );
};

export default AdminActionButtons;
