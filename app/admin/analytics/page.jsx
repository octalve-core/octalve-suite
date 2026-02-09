"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function OctalveAnalytics() {
    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Analytics</h1>
            <Card>
                <CardContent className="py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500">
                        Analytics dashboard coming soon.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
