"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import { api } from "@/lib/api/client";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await api.auth.me();
                if (user) {
                    // If already logged in, redirect to overview/dashboard
                    if (user.role === "admin") {
                        router.replace("/overview");
                    } else {
                        router.replace("/dashboard");
                    }
                }
            } catch (error) {
                // Not authenticated, stay on landing page
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

    return (
        <>
            <LandingHeader />
            <main className="pt-[160px]">
                {/* HERO */}
                <section className="w-full bg-[#000A16]">
                    <div className="mx-auto container-max px-4 py-12 md:py-16">
                        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
                            {/* LEFT: Copy */}
                            <div className="space-y-6">
                                <p className="text-sm md:text-base font-semibold text-white/70">
                                    Octalve Suite™ is for Owners, Founders & Creators.
                                </p>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                                    One platform, Zero stress.
                                </h1>
                                <p className="text-base md:text-lg text-white/75 max-w-xl">
                                    is our all-in-one production house designed to take you from "idea" to "market-ready." Whether you are a solo founder, a growing NGO, or an agency looking for a reliable production partner, our specialized suites provide the foundation you need.
                                    <br className="hidden sm:block" />
                                    Launch faster, grow smarter, and manage everything in one place with Octalve Suite™.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                                    <button
                                        onClick={() => setIsCalendlyOpen(true)}
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0064E0] text-white px-7 py-3 font-bold shadow-sm hover:opacity-90 transition"
                                    >
                                        Free 30min. Call <span aria-hidden="true">›</span>
                                    </button>
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-extrabold bg-white transition hover:bg-white/80 soft-border"
                                    >
                                        Book a Demo
                                    </Link>
                                </div>

                                <div className="flex items-center gap-3 pt-3">
                                    <span className="text-sm font-semibold text-white">Excellent</span>
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <span key={i} className="inline-flex h-5 w-5 items-center justify-center rounded bg-emerald-600 text-white text-xs font-black">★</span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-bold opacity-80">Trustpilot</span>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Visual cluster */}
                            <div className="relative lg:justify-self-end w-full max-w-[560px] mx-auto">
                                <div className="absolute right-4 md:right-10 top-10 md:top-14 h-[320px] w-[320px] md:h-[380px] md:w-[380px] rounded-full bg-[#F5C837]/55" aria-hidden="true"></div>

                                {/* Analytics card */}
                                <div className="absolute left-0 top-0 md:left-2 md:top-2 z-20 w-[250px] sm:w-[280px]">
                                    <div className="rounded-3xl bg-white soft-border shadow-sm overflow-hidden">
                                        <div className="px-5 py-3 bg-pink-50 border-b border-[var(--border)]">
                                            <div className="flex items-center gap-2 font-bold">
                                                <span className="icon">auto_awesome</span>
                                                Analytics
                                            </div>
                                        </div>
                                        <div className="p-4 grid gap-3">
                                            <div className="rounded-2xl bg-slate-50 soft-border px-4 py-3 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Image src="/brand/Octalveicon.png" alt="logo" width={24} height={24} style={{ height: "auto" }} />
                                                    <div className="text-sm font-semibold">Total Orders</div>
                                                </div>
                                                <div className="text-sm font-extrabold text-black/60">200</div>
                                            </div>
                                            <div className="rounded-2xl bg-slate-50 soft-border px-4 py-3 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Image src="/brand/Octalveicon.png" alt="logo" width={24} height={24} style={{ height: "auto" }} />
                                                    <div className="text-sm font-semibold">Total Clients</div>
                                                </div>
                                                <div className="text-sm font-extrabold text-black/60">150</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Portrait */}
                                <div className="relative z-10 pt-10 md:pt-12">
                                    <div className="ml-auto w-[340px] h-[340px] md:w-[420px] md:h-[420px] rounded-[50px] overflow-hidden relative">
                                        <div className="absolute inset-0 rounded-full border-2 border-black/15" aria-hidden="true"></div>
                                        <Image src="/brand/Octalvesuiteihero.png" alt="Octalve Suite Hero" fill className="object-cover" priority sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 420px" />
                                    </div>
                                    <div className="absolute right-10 md:right-16 bottom-6 md:bottom-10 z-30">
                                        <div className="rounded-2xl bg-[#f4efcc] soft-border px-5 py-4 shadow-sm">
                                            <div className="text-lg font-extrabold">Launch Your Idea</div>
                                            <div className="text-sm font-semibold text-black/60">Grow your NGO</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Backed by */}
                        <div className="mt-12 md:mt-14">
                            <div className="rounded-3xl bg-white soft-border shadow-sm px-6 py-8 md:px-10">
                                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                                    <div className="text-xl md:text-2xl font-extrabold">Backed By The Best</div>
                                    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
                                        <Image height={32} width={100} className="h-8 w-auto object-contain opacity-90" src="/brand/logo/Octalve Cloud Logo.png" alt="Logo" style={{ width: "auto" }} />
                                        <Image height={32} width={100} className="h-8 w-auto object-contain opacity-90" src="/brand/logo/Octalve Consult.png" alt="Logo" style={{ width: "auto" }} />
                                        <Image height={32} width={100} className="h-8 w-auto object-contain opacity-90" src="/brand/logo/Octalve Lab.png" alt="Logo" style={{ width: "auto" }} />
                                        <Image height={32} width={100} className="h-8 w-auto object-contain opacity-90" src="/brand/logo/Octalve Vault Logo.png" alt="Logo" style={{ width: "auto" }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <LandingFooter />

            {/* Calendly Modal */}
            {isCalendlyOpen && (
                <div className="fixed inset-0 z-[9999]" aria-hidden="true" role="dialog" aria-modal="true">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsCalendlyOpen(false)}></div>
                    <div className="relative flex min-h-full items-center justify-center p-4 sm:p-6">
                        <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
                                <div className="text-sm font-semibold text-slate-900">Book a Free 30-minute Call</div>
                                <button onClick={() => setIsCalendlyOpen(false)} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200">
                                    Close
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
                                        <path d="M6 6l12 12" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
                                    </svg>
                                </button>
                            </div>
                            <div className="h-[78vh] min-h-[520px] w-full">
                                <iframe src="https://calendly.com/octalve-info/30min" title="Calendly booking" className="h-full w-full" frameborder="0"></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
