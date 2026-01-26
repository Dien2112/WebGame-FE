import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen w-full">
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar 
                className={`
                    fixed md:sticky top-0 left-0 z-50 h-screen transition-all duration-300 dark:bg-[#1a335d]
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                    md:translate-x-0
                    ${sidebarCollapsed ? 'md:w-16' : 'md:w-[220px] lg:w-[280px]'}
                `}
                collapsed={sidebarCollapsed}
                onClose={() => setSidebarOpen(false)}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            <div className="flex flex-col min-h-screen w-full bg-[#F8F9FA] dark:bg-[#1a1a2e]">
                <div className="flex items-center gap-2 h-14 lg:h-[60px] border-b px-4 lg:px-6 bg-white dark:bg-[#0f3460]" style={{ borderColor: '#072D44' }}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden hover:bg-white/20 text-white"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <Header />
                </div>

                <main className="flex-1 p-4 lg:p-6">
                    <Outlet />
                </main>
                <footer className="border-t p-4 text-center text-xs bg-white dark:bg-[#0f3460] text-white" style={{ borderColor: '#072D44' }}>
                    &copy; {new Date().getFullYear()} WebGame. All rights reserved.
                </footer>
            </div>
        </div>
    );
}
