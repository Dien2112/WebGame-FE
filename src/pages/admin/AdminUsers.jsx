import { useState, useEffect, useCallback } from "react";
import { Search, Ban, CheckCircle, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { debounce } from "@/lib/utils";
import DeleteUserModal from "@/components/DeleteUserModal"; 

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = useCallback(async (page, query) => {
        try {
            setLoading(true);
            const res = await api.get(`/api/users?page=${page}&limit=5&q=${encodeURIComponent(query || '')}`);
            setUsers(res.data);
            setPagination(res.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const debouncedFetch = useCallback(debounce((page, query) => {
        fetchUsers(page, query);
    }, 500), []);

    useEffect(() => {
        fetchUsers(currentPage, searchTerm);
    }, [currentPage, fetchUsers]); 
    const handleSearch = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        setCurrentPage(1);
        debouncedFetch(1, val);
    };

    const handleToggleBan = async (user) => {
        const action = user.is_active ? 'disable' : 'enable';
        if (!confirm(`Are you sure you want to ${action} ${user.username}?`)) return;

        try {
            const res = await api.post(`/api/users/${action}/${user.id}`);
            setUsers(users.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
        } catch (err) {
            alert(`Failed to ${action} user`);
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`/api/users/${userToDelete.id}`);
            setDeleteModalOpen(false);
            fetchUsers(currentPage, searchTerm);
        } catch (err) {
            alert("Failed to delete user");
        }
    };

    const getAvatarColor = (initials) => {
        const colors = [
            "bg-blue-100 text-blue-600",
            "bg-pink-100 text-pink-600",
            "bg-yellow-100 text-yellow-600",
            "bg-green-100 text-green-600",
            "bg-cyan-100 text-cyan-600",
            "bg-purple-100 text-purple-600"
        ];
        const index = (initials?.charCodeAt(0) || 0) % colors.length;
        return colors[index];
    };

    const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : "??";

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-bold text-[#072D44] dark:text-white">User Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Manage registered users, ban/unban accounts, and delete users
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search by Name, Email..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="pl-10 bg-white dark:bg-[#064469] border-gray-200 dark:border-gray-700"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-[#064469] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-[#072D44] border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="5" className="p-4 text-center">No users found</td></tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-[#072D44]/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm ${getAvatarColor(getInitials(user.username))}`}>
                                                    {getInitials(user.username)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {user.role}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-500"}`}></span>
                                                {user.is_active ? "ACTIVE" : "DISABLED"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleBan(user)}
                                                    className={`p-2 rounded-lg transition-colors ${user.is_active
                                                        ? "text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                                        : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                        }`}
                                                    title={user.is_active ? "Disable User" : "Enable User"}
                                                >
                                                    {user.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(user)}
                                                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm">Page {currentPage} of {pagination.totalPages}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                                disabled={currentPage === pagination.totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {userToDelete && (
                <DeleteUserModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    user={userToDelete}
                    onConfirm={confirmDeleteUser}
                />
            )}
        </div>
    );
}
