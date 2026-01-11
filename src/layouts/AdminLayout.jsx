import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function AdminLayout() {
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <Sidebar isAdmin={true} className="hidden border-r bg-muted/40 md:block h-screen sticky top-0" />
            <div className="flex flex-col h-screen w-full overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <Outlet />
                </main>
                <footer className="border-t p-4 text-center text-xs text-muted-foreground bg-muted/20">
                    &copy; {new Date().getFullYear()} WebGame. All rights reserved.
                </footer>
            </div>
        </div>

    );
}
