import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

interface AuthGateModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;
}

const AuthGateModal: React.FC<AuthGateModalProps> = ({ isOpen, onClose, featureName = 'This feature' }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleLogin = () => {
        onClose();
        navigate('/login');
    };

    const handleCreateAccount = () => {
        onClose();
        navigate('/report'); // Usually Register/Report flow starts here or a register page if separate
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 relative transform transition-all scale-100 animate-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Account Required
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                        {featureName} is available only to verified users. Please sign in to continue securely.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleLogin}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                        >
                            Log In
                        </button>
                        <button
                            onClick={handleCreateAccount}
                            className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthGateModal;
