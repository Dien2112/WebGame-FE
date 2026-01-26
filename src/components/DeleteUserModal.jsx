import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

export default function DeleteUserModal({ isOpen, onClose, user, onConfirm }) {
    if (!isOpen || !user) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-[#064469] rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                        Delete User Account
                    </h2>

                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {user.fullName}
                        </span>
                        ? All associated game data, credits, and profile history will be permanently removed.
                    </p>

                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6">
                        <div className="flex gap-2">
                            <div className="flex-shrink-0">
                                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">!</span>
                                </div>
                            </div>
                            <p className="text-xs text-red-800 dark:text-red-300">
                                This action is irreversible. Once deleted, the user cannot recover their progression or assets.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2"
                            onClick={() => {
                                onConfirm(user.playerId);
                                onClose();
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete User
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
