import { useState, useEffect } from "react";
import { Search, Filter, UserPlus, Edit2, Trash2, Ban, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DeleteUserModal from "@/components/DeleteUserModal";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const usersPerPage = 5;

    // Mock data - Replace with API call
    useEffect(() => {
        // Simulated API data
        const mockUsers = [
            {
                playerId: "JD-X32-2A",
                email: "john.doe@email.com",
                fullName: "John Doe",
                status: "ACTIVE",
                createdAt: "Oct 12, 2025",
                avatar: "JD"
            },
            {
                playerId: "JS-Y21-0S",
                email: "jane.smith@email.com",
                fullName: "Jane Smith",
                status: "BANNED",
                createdAt: "Oct 10, 2025",
                avatar: "JS"
            },
            {
                playerId: "MJ-U12-8U",
                email: "mike.jones@email.com",
                fullName: "Mike Jones",
                status: "ACTIVE",
                createdAt: "Oct 08, 2025",
                avatar: "MJ"
            },
            {
                playerId: "SC-P44-9C",
                email: "sara.connor@email.com",
                fullName: "Sara Connor",
                status: "ACTIVE",
                createdAt: "Oct 05, 2025",
                avatar: "SC"
            },
            {
                playerId: "AV-I29-4V",
                email: "alex.vance@email.com",
                fullName: "Alex Vance",
                status: "BANNED",
                createdAt: "Sep 30, 2025",
                avatar: "AV"
            },
            {
                playerId: "CE-K45-7E",
                email: "chris.evans@email.com",
                fullName: "Chris Evans",
                status: "ACTIVE",
                createdAt: "Sep 25, 2025",
                avatar: "CE"
            },
            {
                playerId: "EW-L88-3W",
                email: "emma.watson@email.com",
                fullName: "Emma Watson",
                status: "ACTIVE",
                createdAt: "Sep 22, 2025",
                avatar: "EW"
            },
            {
                playerId: "DB-M12-5B",
                email: "david.brown@email.com",
                fullName: "David Brown",
                status: "BANNED",
                createdAt: "Sep 20, 2025",
                avatar: "DB"
            }
        ];
        setUsers(mockUsers);
        setTotalUsers(12408); // Mock total
    }, []);

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.playerId.toString().includes(searchTerm)
    );

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    // Handle ban/unban toggle
    const handleToggleBan = (userId) => {
        setUsers(users.map(user =>
            user.playerId === userId
                ? { ...user, status: user.status === "ACTIVE" ? "BANNED" : "ACTIVE" }
                : user
        ));
    };

    // Handle delete user - open modal
    const handleDeleteUser = (userId) => {
        const user = users.find(u => u.playerId === userId);
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };

    // Confirm delete user
    const confirmDeleteUser = (userId) => {
        setUsers(users.filter(user => user.playerId !== userId));
    };

    // Generate avatar color based on initials
    const getAvatarColor = (initials) => {
        const colors = [
            "bg-blue-100 text-blue-600",
            "bg-pink-100 text-pink-600",
            "bg-yellow-100 text-yellow-600",
            "bg-green-100 text-green-600",
            "bg-cyan-100 text-cyan-600",
            "bg-purple-100 text-purple-600"
        ];
        const index = initials.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-2xl font-bold text-[#072D44] dark:text-white">User Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Manage registered users, ban/unban accounts, and delete users
                </p>
            </div>

            {/* Search and Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                {/* Search Input */}
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search by Name, Email, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white dark:bg-[#064469] border-gray-200 dark:border-gray-700"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-[#064469] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-[#072D44] border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Full Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {currentUsers.map((user) => (
                                <tr key={user.playerId} className="hover:bg-gray-50 dark:hover:bg-[#072D44]/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {user.playerId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm ${getAvatarColor(user.avatar)}`}>
                                                {user.avatar}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {user.fullName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === "ACTIVE"
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                                                }`}></span>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {user.createdAt}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center gap-2">
                                            {/* Ban/Unban Button */}
                                            <button
                                                onClick={() => handleToggleBan(user.playerId)}
                                                className={`p-2 rounded-lg transition-colors ${user.status === "ACTIVE"
                                                    ? "text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                                    : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                    }`}
                                                title={user.status === "ACTIVE" ? "Ban User" : "Unban User"}
                                            >
                                                {user.status === "ACTIVE" ? (
                                                    <Ban className="h-4 w-4" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4" />
                                                )}
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDeleteUser(user.playerId)}
                                                className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="border-gray-200 dark:border-gray-700"
                        >
                            ‹
                        </Button>

                        {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = idx + 1;
                            } else if (currentPage <= 3) {
                                pageNum = idx + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + idx;
                            } else {
                                pageNum = currentPage - 2 + idx;
                            }

                            return (
                                <Button
                                    key={idx}
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={currentPage === pageNum
                                        ? "bg-[#00BCD4] hover:bg-[#00ACC1] text-white"
                                        : "border-gray-200 dark:border-gray-700"
                                    }
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}

                        {totalPages > 5 && (
                            <>
                                <span className="text-gray-400">...</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(totalPages)}
                                    className="border-gray-200 dark:border-gray-700"
                                >
                                    {totalPages}
                                </Button>
                            </>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="border-gray-200 dark:border-gray-700"
                        >
                            ›
                        </Button>
                    </div>
                </div>
            </div>

            {/* Delete User Modal */}
            <DeleteUserModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                user={userToDelete}
                onConfirm={confirmDeleteUser}
            />
        </div>
    );
}
