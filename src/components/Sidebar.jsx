import { Link, NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { LayoutDashboard, Users, MessageSquare, Trophy, LogOut, ChartBar, User } from "lucide-react";

export default function Sidebar({ isAdmin, className }) {
    const { logout } = useAuth();
    const navigate = useNavigate();

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
        { to: "/dashboard/profile", label: "Profile", icon: User },
    ];

    return (
        <div className={cn("flex flex-col h-screen border-r bg-muted/40", className)}>
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link to="/" className="flex items-center gap-2 font-semibold">
                    <span className="">WebGame</span>
                </Link>
            </div>
            <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-4">
                    {navItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.to}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    isActive ? "bg-muted text-primary" : "text-muted-foreground"
                                )
                            }
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t">
                <Button className="w-full justify-start gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
