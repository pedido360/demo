import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import Header from "@/components/admin/layout/Header";
import Sidebar from "@/components/admin/layout/Sidebar";

import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";

interface DashboardLayoutProps {
    children: ReactNode;
}

export default async function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    const profile = await getCurrentProfile();

    if (!profile) {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />

            <div className="flex flex-1 flex-col">
                <Header
                    profile={profile}
                    title="Dashboard"
                    description="Bienvenido a Pedidos360."
                />

                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}