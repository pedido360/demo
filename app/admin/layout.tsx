import type { ReactNode } from "react";

import Header from "@/components/admin/layout/Header";
import Sidebar from "@/components/admin/layout/Sidebar";

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({
    children,
}: AdminLayoutProps) {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <Header />

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}