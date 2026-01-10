"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";

export default function HomePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await api.auth.me();
                // Redirect based on role
                if (user.role === "admin") {
                    router.replace("/overview");
                } else {
                    router.replace("/dashboard");
                }
            } catch (error) {
                // Not authenticated, redirect to login
                router.replace("/login");
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-500">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xl">O</span>
                    </div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return null;
}
