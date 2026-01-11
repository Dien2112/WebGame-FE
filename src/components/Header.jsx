import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
    const { user } = useAuth();
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

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <div className="w-full flex-1">
                {/* Simple breadcrumb or title could go here */}
                <h1 className="text-lg font-semibold md:text-xl">Welcome, {user?.username}</h1>
            </div>
            <Button variant="outline" size="icon" onClick={toggleTheme}>
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="sr-only">Toggle theme</span>
            </Button>
        </header>
    );
}
