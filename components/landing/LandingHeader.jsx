"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function LandingHeader() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState({
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
    });

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);

        // Countdown logic
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 28); // Placeholder: 28 days from now

        const timer = setInterval(() => {
            const now = new Date();
            const diff = targetDate.getTime() - now.getTime();

            if (diff <= 0) {
                clearInterval(timer);
                return;
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({
                days: d.toString().padStart(2, "0"),
                hours: h.toString().padStart(2, "0"),
                minutes: m.toString().padStart(2, "0"),
                seconds: s.toString().padStart(2, "0"),
            });
        }, 1000);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearInterval(timer);
        };
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 w-full z-50">
            {/* Promo bar */}
            <div className="w-full bg-[var(--promo-bg)]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between gap-4 py-3">
                        <div className="hidden sm:flex items-center gap-3 min-w-[120px]">
                            <Image
                                src="/brand/powercharge.png"
                                alt="Promo art"
                                width={100}
                                height={40}
                                className="h-10 w-auto object-contain"
                                style={{ width: "auto" }}
                            />
                        </div>

                        <div className="flex-1 text-center font-primary">
                            <span className="text-base sm:text-lg font-extrabold text-black/90">
                                New year Sale: Save up to{" "}
                                <span className="text-[color:var(--primary)]">#80,000</span> on
                                any Octalve Suite plan!
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-2">
                            <div className="bg-white rounded-xl px-3 py-2 text-center shadow-sm">
                                <div className="text-lg font-extrabold leading-none">
                                    {timeLeft.days}
                                </div>
                                <div className="text-[11px] font-bold text-black/70">Days</div>
                            </div>
                            <div className="bg-white rounded-xl px-3 py-2 text-center shadow-sm">
                                <div className="text-lg font-extrabold leading-none">
                                    {timeLeft.hours}
                                </div>
                                <div className="text-[11px] font-bold text-black/70">Hours</div>
                            </div>
                            <div className="bg-white rounded-xl px-3 py-2 text-center shadow-sm">
                                <div className="text-lg font-extrabold leading-none">
                                    {timeLeft.minutes}
                                </div>
                                <div className="text-[11px] font-bold text-black/70">
                                    Minutes
                                </div>
                            </div>
                            <div className="bg-white rounded-xl px-3 py-2 text-center shadow-sm">
                                <div className="text-lg font-extrabold leading-none">
                                    {timeLeft.seconds}
                                </div>
                                <div className="text-[11px] font-bold text-black/70">
                                    Seconds
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/start-now"
                            className="inline-flex items-center justify-center rounded-full border border-black/70 px-5 py-2 text-sm font-bold hover:bg-white/40 transition"
                        >
                            Claim 10% Off
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main nav bar */}
            <div
                className={`w-full transition-all duration-200 border-b ${isScrolled
                        ? "bg-white/90 backdrop-blur-md shadow-md py-3"
                        : "bg-[#E5ECFF] border-transparent shadow-lg py-6"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between gap-5">
                        <Link href="/" className="flex items-center gap-3">
                            <Image
                                src="/brand/logo/Octalve Suite.png"
                                alt="Octalve Suite™ Logo"
                                width={180}
                                height={36}
                                className="h-9 w-auto object-contain transition-all duration-200"
                                style={{ width: "auto" }}
                            />
                        </Link>

                        <nav className="hidden lg:flex items-center gap-10 font-primary">
                            <Link
                                href="/"
                                className="font-bold text-black/90 hover:text-black"
                            >
                                Home
                            </Link>
                            <Link
                                href="/launch"
                                className="font-bold text-black/90 hover:text-black"
                            >
                                Launch
                            </Link>
                            <Link
                                href="/impact"
                                className="font-bold text-black/90 hover:text-black"
                            >
                                Impact
                            </Link>
                            <Link
                                href="/pricing"
                                className="font-bold text-black/90 hover:text-black"
                            >
                                Pricing
                            </Link>
                            <Link
                                href="/contact"
                                className="font-bold text-black/90 hover:text-black"
                            >
                                Contact
                            </Link>
                        </nav>

                        <div className="hidden md:flex items-center gap-4 font-primary">
                            <Link
                                href="/start-now"
                                className="inline-flex items-center justify-center rounded-full bg-white/70 text-black px-7 py-3 font-bold border border-black/10 hover:bg-white transition"
                            >
                                Start Now
                            </Link>
                            <Link
                                href="/start-now"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-black text-white px-7 py-3 font-bold shadow-sm hover:opacity-90 transition"
                            >
                                Free 30min. Call <span aria-hidden="true">›</span>
                            </Link>
                        </div>

                        <button
                            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                            className="lg:hidden inline-flex items-center justify-center rounded-full border border-black/15 bg-white/60 px-4 py-2 font-primary font-extrabold"
                        >
                            {isMobileNavOpen ? "Close" : "Menu"}
                        </button>
                    </div>

                    {isMobileNavOpen && (
                        <div className="lg:hidden mt-4 pb-6">
                            <div className="rounded-3xl bg-white/70 border border-black/10 p-4 font-primary">
                                <Link
                                    className="block px-3 py-3 rounded-2xl font-bold hover:bg-black/5"
                                    href="/"
                                >
                                    Home
                                </Link>
                                <Link
                                    className="block px-3 py-3 rounded-2xl font-bold hover:bg-black/5"
                                    href="/launch"
                                >
                                    Launch
                                </Link>
                                <Link
                                    className="block px-3 py-3 rounded-2xl font-bold hover:bg-black/5"
                                    href="/impact"
                                >
                                    Impact
                                </Link>
                                <Link
                                    className="block px-3 py-3 rounded-2xl font-bold hover:bg-black/5"
                                    href="/pricing"
                                >
                                    Pricing
                                </Link>
                                <Link
                                    className="block px-3 py-3 rounded-2xl font-bold hover:bg-black/5"
                                    href="/contact"
                                >
                                    Contact
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
