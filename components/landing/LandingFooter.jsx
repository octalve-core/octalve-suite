"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function LandingFooter() {
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [newsletterMsg, setNewsletterMsg] = useState({ text: "", isError: false });

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail);
        if (!ok) {
            setNewsletterMsg({ text: "Please enter a valid email address.", isError: true });
            return;
        }
        setNewsletterMsg({ text: "Subscribed! (Connect your backend later)", isError: false });
        setNewsletterEmail("");
    };

    return (
        <footer className="w-full bg-white border-t border-black/10">
            {/* CTA BANNER SECTION */}
            <section id="ctaBanner" className="w-full bg-white">
                <div className="max-w-7xl mx-auto px-4 py-14 md:py-20">
                    <div className="rounded-[44px] md:rounded-[56px] overflow-hidden border border-black/5 bg-[#E5ECFF]">
                        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 px-8 sm:px-12 lg:px-16 py-12 lg:py-16">
                            {/* LEFT (Text) */}
                            <div className="lg:col-span-6">
                                <h3 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-black">
                                    Less blah,<br />
                                    More Sales
                                </h3>

                                <p className="mt-5 text-base sm:text-lg font-semibold text-black/70">
                                    Join Octalve and scale building today.
                                </p>

                                <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
                                    <Link href="/start-now"
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-black text-white px-7 py-3.5 font-semibold shadow-sm hover:opacity-90 transition">
                                        Free 30min. Call
                                        <span className="text-lg leading-none">›</span>
                                    </Link>

                                    <Link href="/contact"
                                        className="inline-flex items-center justify-center rounded-full bg-white/70 text-black px-7 py-3.5 font-semibold border border-black/10 hover:bg-white transition">
                                        Book a Demo
                                    </Link>
                                </div>
                            </div>

                            {/* RIGHT (Illustration) */}
                            <div className="lg:col-span-6">
                                <div className="relative mx-auto w-full max-w-xl">
                                    <div id="ctaMedia" className="relative rounded-[28px] sm:rounded-[34px] overflow-hidden">
                                        <Image src="/brand/OctalveSuiteTM0.png" alt="CTA illustration"
                                            width={600} height={400}
                                            className="w-full h-auto object-cover" />
                                    </div>
                                    <div className="absolute -bottom-8 left-10 right-10 h-10 rounded-[999px] bg-black/5 blur-xl"
                                        aria-hidden="true"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-14 md:py-16">
                {/* Top: Brand + Newsletter */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Brand */}
                    <div className="lg:col-span-6">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <Image src="/brand/logo/Octalve Suite.png" alt="Logo" width={180} height={40} className="h-10 w-auto object-contain" />
                        </Link>

                        <p className="mt-6 max-w-xl text-black/70 leading-relaxed font-secondary">
                            Octalve Suite™ is our all-in-one production house designed to take you from "idea" to
                            "market-ready."
                            Whether you are a solo founder, a
                            growing NGO, or an agency looking for a reliable production partner, our specialized suites provide
                            the foundation you
                            need.
                        </p>
                    </div>

                    {/* Newsletter */}
                    <div className="lg:col-span-6 lg:pl-10">
                        <div className="font-primary font-extrabold text-black/90 text-lg">
                            Join Octalve Suite's monthly newsletter
                        </div>

                        <form onSubmit={handleNewsletterSubmit} className="mt-4">
                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                                <div className="flex-1">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={newsletterEmail}
                                        onChange={(e) => setNewsletterEmail(e.target.value)}
                                        className="w-full rounded-full bg-black/5 px-6 py-3.5 outline-none border border-black/10 focus:border-black/30 font-secondary"
                                        required
                                    />
                                </div>

                                <button type="submit"
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-black text-white px-7 py-3.5 font-primary font-extrabold hover:opacity-90 transition">
                                    Subscribe <span aria-hidden="true">›</span>
                                </button>
                            </div>

                            {newsletterMsg.text && (
                                <p className={`mt-3 text-sm font-secondary ${newsletterMsg.isError ? "text-red-600" : "text-green-700"}`}>
                                    {newsletterMsg.text}
                                </p>
                            )}

                            <p className="mt-4 text-sm font-secondary text-black/60">
                                By subscribing you agree with our
                                <Link href="#" className="text-[color:var(--primary)] font-bold hover:underline ml-1">Privacy Policy</Link>
                            </p>
                        </form>
                    </div>
                </div>

                {/* Links grid */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-10">
                    {/* Column 1 */}
                    <div>
                        <h4 className="font-primary font-extrabold text-black">Suites</h4>
                        <ul className="mt-6 space-y-4 font-secondary text-black/70">
                            <li><Link className="hover:text-black" href="/launch">Launch-Suite</Link></li>
                            <li><Link className="hover:text-black" href="/impact">Impact-Suite</Link></li>
                            <li><Link className="hover:text-black" href="/pricing">Growth-Suite</Link></li>
                            <li><Link className="hover:text-black" href="#">Partner-Suite</Link></li>
                        </ul>
                    </div>

                    {/* Column 2 */}
                    <div>
                        <h4 className="font-primary font-extrabold text-black">Company</h4>
                        <ul className="mt-6 space-y-4 font-secondary text-black/70">
                            <li><a className="hover:text-black" href="https://octalve.com/who-we-are/">About Octalve</a></li>
                            <li><a className="hover:text-black" href="https://octalve.com/consult/">Octalve Consult</a></li>
                            <li><a className="hover:text-black" href="https://octalve.com/lab/">Octalve Lab</a></li>
                            <li><a className="hover:text-black" href="https://octalve.cloud/">Octalve Cloud</a></li>
                            <li><a className="hover:text-black" href="https://octalve.com/leap/">Octalve Leap</a></li>
                        </ul>
                    </div>

                    {/* Column 3 */}
                    <div>
                        <h4 className="font-primary font-extrabold text-black">Compare</h4>
                        <ul className="mt-6 space-y-4 font-secondary text-black/70">
                            <li><Link className="hover:text-black" href="#">Octalve Suite vs.</Link></li>
                            <li><Link className="hover:text-black" href="#">Octalve Suite vs.</Link></li>
                            <li><Link className="hover:text-black" href="#">Octalve Suite vs.</Link></li>
                        </ul>
                    </div>

                    {/* Column 4 */}
                    <div>
                        <h4 className="font-primary font-extrabold text-black">Learn</h4>
                        <ul className="mt-6 space-y-4 font-secondary text-black/70">
                            <li><Link className="hover:text-black" href="#">Branding</Link></li>
                            <li><Link className="hover:text-black" href="#">NGO</Link></li>
                            <li><Link className="hover:text-black" href="#">Founder</Link></li>
                            <li><Link className="hover:text-black" href="#">Enterprise</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="mt-16 border-t border-black/10"></div>

                {/* Bottom row */}
                <div className="pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                        <div className="font-secondary text-black/70">
                            <span>© Octalve {new Date().getFullYear()}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 font-secondary font-bold text-black/70">
                        <Link href="#" className="hover:text-black">Terms of service</Link>
                        <Link href="#" className="hover:text-black">Privacy policy</Link>
                    </div>

                    <div className="flex items-center gap-5">
                        {/* Social icons placeholders */}
                        <Link href="#" className="text-black/70 hover:text-black">FB</Link>
                        <Link href="#" className="text-black/70 hover:text-black">IG</Link>
                        <Link href="#" className="text-black/70 hover:text-black">LI</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
