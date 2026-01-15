import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { LayoutDashboard, Users, MessageSquare, Trophy, LogOut, ChartBar, User, Award, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function Sidebar({ isAdmin, className, collapsed = false, onClose, onToggleCollapse }) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const pathName = useLocation().pathname;

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navItems = isAdmin ? [
        { to: "/admin/stats", label: "Statistics", icon: LayoutDashboard },
        { to: "/admin/users", label: "Users", icon: Users },
        { to: "/admin/games", label: "Game Config", icon: Trophy }
    ] : [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/dashboard/ranking", label: "Ranking", icon: ChartBar },
        { to: "/dashboard/games", label: "Games", icon: Trophy },
        { to: "/dashboard/friends", label: "Friends", icon: Users },
        { to: "/dashboard/messages", label: "Messages", icon: MessageSquare },
        { to: "/dashboard/achievements", label: "Achievements", icon: Award },
        { to: "/dashboard/profile", label: "Profile", icon: User },
    ];

    return (
        <div className={cn("flex flex-col h-screen border-r bg-white dark:bg-[#072D44]", className)} style={{ borderColor: '#D0D7E1' }}>
            {/* Header */}
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 justify-between" style={{ borderColor: '#D0D7E1' }}>
                {/* Logo - clickable when collapsed */}
                {collapsed ? (
                    <button 
                        onClick={onToggleCollapse}
                        className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity text-[#5790AB] dark:text-white"
                        title="Mở sidebar"
                    >
                        <span className="text-xl">🎮</span>
                    </button>
                ) : (
                    <Link to="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-90 transition-opacity text-[#5790AB] dark:text-white">
                        <span className="text-[#5790AB]">WebGame</span>
                    </Link>
                )}
                
                {/* Toggle button - desktop only */}
                {!collapsed && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex hover:bg-[#F8F9FA] dark:hover:bg-white/10 text-[#5790AB] dark:text-white"
                        onClick={onToggleCollapse}
                        title="Thu gọn sidebar"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}
                
                {/* Close button for mobile */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden hover:bg-[#F8F9FA] dark:hover:bg-white/10 text-[#072D44] dark:text-white"
                    onClick={onClose}
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-4">
                    {navItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.to}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                                    collapsed && "justify-center"
                                )
                            }
                            style={({ isActive }) => ({
                                backgroundColor: pathName === item.to ? '#9CCDDB' : 'transparent',
                                color: pathName === item.to ? '#072D44' : '#5790AB'
                            })}
                            title={collapsed ? item.label : ""}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className="h-4 w-4" style={{ color: pathName === item.to ? '#072D44' : '#5790AB' }} />
                                    <span className={cn(collapsed ? "hidden" : "", "dark:text-[#D0D7E1]")}>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Logout Button */}
            <div className="mt-auto p-4 border-t" style={{ borderColor: '#D0D7E1' }}>
                <Button 
                    className={cn(
                        "w-full gap-2 hover:opacity-90 bg-[#064469] text-white dark:bg-[#5790AB]",
                        collapsed ? "justify-center px-2" : "justify-start"
                    )}
                    onClick={handleLogout}
                    title={collapsed ? "Logout" : ""}
                >
                    <LogOut className="h-4 w-4" />
                    <span className={collapsed ? "hidden" : ""}>Logout</span>
                </Button>
            </div>
        </div>
    );
}
