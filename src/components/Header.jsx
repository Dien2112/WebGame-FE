import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const isDarkMode = localStorage.getItem('theme') === 'dark';
        setIsDark(isDarkMode);
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newMode = !isDark;
        setIsDark(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleAvatarClick = () => {
        navigate('/dashboard/profile');
    };

    return (
        <header className="flex h-14 justify-end items-center w-full gap-4 px-4 lg:h-[60px] lg:px-6">
            {user && (
                <div className="flex items-center gap-3">
                    <span className="text-sm text-[#5790AB] dark:text-[#9CCDDB]">
                        Hello, <span className="font-semibold text-[#072D44] dark:text-white">{user.name || user.email?.split('@')[0] || 'User'}</span>
                    </span>
                    <button
                        onClick={handleAvatarClick}
                        className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#5790AB] hover:border-[#072D44] dark:hover:border-white transition-colors cursor-pointer"
                    >
                        {user.avatar ? (
                            <img 
                                src={user.avatar} 
                                alt="Avatar" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-[#5790AB] flex items-center justify-center text-white font-semibold text-sm">
                                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                            </div>
                        )}
                    </button>
                </div>
            )}
            <Button 
                size="icon" 
                onClick={toggleTheme}
                className=""
            >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
        </header>
    );
}
