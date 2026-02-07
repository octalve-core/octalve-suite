"use client";

import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import Link from "next/link";

export default function StartNowPage() {
    return (
        <>
            <LandingHeader />
            <main className="pt-[160px] pb-20">
                <section className="bg-white">
                    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14 lg:py-16">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                                    Book a Free 30-minute Call
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                                    Choose a convenient time and we’ll meet to discuss your needs.
                                </p>
                            </div>

                            <Link href="/"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"
                                        strokeLinejoin="round" />
                                </svg>
                                Back to Home
                            </Link>
                        </div>

                        <div className="mt-7 overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10">
                            <div className="h-[78vh] min-h-[620px] w-full">
                                <iframe title="Calendly booking" className="h-full w-full" src="https://calendly.com/octalve-info/30min"
                                    frameBorder="0" loading="lazy" allow="camera; microphone; fullscreen"></iframe>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <LandingFooter />
        </>
    );
}
