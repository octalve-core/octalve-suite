"use client";

import Image from "next/image";
import Link from "next/link";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

export default function ImpactPage() {
    return (
        <>
            <LandingHeader />
            <main className="pt-[160px]">
                {/* HERO */}
                <section className="bg-white">
                    <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div className="max-w-xl">
                                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                                    <span className="text-slate-900">Donors trust</span>
                                    <span className="text-[#29BE3E]"> Impact</span>
                                    <span className="text-slate-900"> & Clarity.</span>
                                </h1>
                                <h2 className="mt-5 text-lg font-bold leading-relaxed text-slate-700">
                                    Impact Suite is the only platform that combines donor trust, clarity, and impact in one place.
                                </h2>
                                <p className="mt-1 text-lg leading-relaxed text-slate-700">
                                    Stop piecing together freelancers and struggling with DIY tools. We provide the complete identity, professional sale-AI driven website, and content engine you need to go live with authority.
                                </p>

                                <div className="mt-8 flex flex-wrap items-center gap-4">
                                    <Link href="/start-now" className="inline-flex items-center justify-center gap-3 rounded-full bg-black px-7 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900">
                                        Free 30-Min Strategy Call
                                        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                        </span>
                                    </Link>

                                    <Link href="/contact" className="inline-flex items-center justify-center rounded-full bg-slate-100 px-7 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
                                        Get Started
                                    </Link>
                                </div>
                            </div>

                            <div className="lg:justify-self-end">
                                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#29BE3E] via-white to-[#29BE3E] p-6 shadow-2xl">
                                    <div className="relative origin-center rounded-2xl bg-white shadow-lg ring-1 ring-black/5">
                                        <div className="flex items-center gap-2 px-4 py-2">
                                            <span className="h-2.5 w-2.5 rounded-full bg-red-400"></span>
                                            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
                                            <span className="h-2.5 w-2.5 rounded-full bg-green-400"></span>
                                        </div>
                                        <Image src="/brand/OctalveSuite0impact.png" alt="Impact screenshot" width={600} height={400} className="w-full h-auto rounded-b-2xl object-cover" />
                                    </div>
                                    <div className="pointer-events-none absolute bottom-6 left-6">
                                        <div className="flex items-end gap-3">
                                            <span className="h-12 w-2 rounded bg-[#29BE3E]"></span>
                                            <div className="leading-none text-white drop-shadow-lg">
                                                <div className="text-2xl font-semibold">Octalve</div>
                                                <div className="text-3xl font-extrabold">Impact</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* TIMELINE */}
                <section className="bg-white">
                    <div className="mx-auto max-w-6xl px-5 py-14 lg:py-24">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                Ready to make Impact?
                            </h2>
                        </div>

                        <div className="relative mt-12 sm:mt-14">
                            <div className="absolute left-5 top-0 bottom-0 w-px bg-[#29BE3E] lg:left-1/2 lg:-translate-x-1/2"></div>

                            <div className="space-y-14 lg:space-y-20">
                                <div className="relative pl-12 lg:grid lg:grid-cols-[1fr_140px_1fr] lg:items-start lg:gap-10 lg:pl-0">
                                    <div className="absolute left-5 top-6 z-10 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-xl border border-[#29BE3E] bg-white lg:left-1/2 lg:top-10">
                                        <span className="h-3 w-3 rounded bg-[#29BE3E]"></span>
                                    </div>
                                    <div className="lg:pr-6 lg:text-right">
                                        <span className="inline-flex rounded-md bg-green-100 px-3 py-1 text-xs font-semibold text-slate-900">Phase 1</span>
                                        <h3 className="mt-4 text-lg font-extrabold text-slate-900 sm:text-xl">Strategy & Planning</h3>
                                    </div>
                                    <div className="hidden lg:block"></div>
                                    <div className="lg:pl-6">
                                        <div className="rounded-3xl bg-[#29BE3E]/10 p-6 shadow-sm ring-1 ring-black/5">
                                            <p className="text-sm leading-relaxed text-slate-700">Align the vision, offer, and launch plan</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <LandingFooter />
        </>
    );
}
