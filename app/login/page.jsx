"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("admin@octalve.local");
    const [name, setName] = useState("Octalve Admin");
    const [role, setRole] = useState("admin");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const quickFill = (r) => {
        setRole(r);
        if (r === "admin") {
            setEmail("admin@octalve.local");
            setName("Octalve Admin");
        } else {
            setEmail("client@octalve.local");
            setName("Demo Client");
        }
    };

    const onLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.auth.login({ email, full_name: name, role });
            router.replace(role === "admin" ? "/overview" : "/dashboard");
        } catch (err) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
                            <span className="text-white font-bold text-xl">O</span>
                        </div>
                        <CardTitle className="text-2xl">Octalve Suite</CardTitle>
                    </div>
                    <CardDescription>
                        Sign in to access your project dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 mb-6">
                        <Button
                            type="button"
                            variant={role === "admin" ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => quickFill("admin")}
                        >
                            Admin
                        </Button>
                        <Button
                            type="button"
                            variant={role === "client" ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => quickFill("client")}
                        >
                            Client
                        </Button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={onLogin}>
                        <div className="space-y-2">
                            <Label>Full name</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>

                    <p className="text-xs text-slate-500 mt-4">
                        Demo mode: Choose Admin or Client to explore the interface.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
