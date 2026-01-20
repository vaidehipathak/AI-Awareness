import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    onClick: () => void;
    className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, className = '' }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg ${className}`}
        >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
        </button>
    );
};

export default BackButton;
