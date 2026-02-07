"use client";

import { useState, useEffect, Fragment } from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import Link from "next/link";

const PRICES_NGN = {
    launch: 450000,
    impact: 470000,
    growth: 200000,
};

const PLANS = {
    launch: { name: "Launch Suite", color: "red", periodLabel: "one-time" },
    impact: { name: "Impact Suite", color: "green", periodLabel: "one-time" },
    growth: { name: "Growth Suite", color: "blue", periodLabel: "month" },
};

const SECTIONS = [
    {
        title: "Strategy & Brand",
        rows: [
            { label: "Discovery / Strategy (Phase 1)", launch: true, impact: true, growth: true },
            { label: "Brand Identity (Phase 2)", launch: true, impact: true, growth: true },
            { label: "Mini Brand Guideline", launch: true, impact: true, growth: true },
            { label: "Social Profile Kit (DP + banners + templates)", launch: true, impact: false, growth: true },
            { label: "Letterhead + ID card/badge", launch: false, impact: true, growth: false },
        ],
    },
    {
        title: "Website & Integrations",
        rows: [
            { label: "Website Design & Build (Mobile-first)", launch: true, impact: true, growth: true },
            { label: "Basic SEO + Speed Setup", launch: true, impact: true, growth: true },
            { label: "WhatsApp click-to-chat + Forms + Map embed", launch: true, impact: true, growth: true },
            { label: "Donation-friendly website structure", launch: false, impact: true, growth: false },
            { label: "Recurring donation option + donor email copy", launch: false, impact: true, growth: false },
        ],
    },
    {
        title: "Content & Launch Support",
        rows: [
            { label: "14 branded post designs (starter pack)", launch: true, impact: false, growth: false },
            { label: "5 story templates + ad-ready creatives", launch: true, impact: false, growth: false },
            { label: "Caption prompts + posting plan", launch: true, impact: false, growth: true },
            { label: "Go-live support + tracking guidance", launch: true, impact: true, growth: true },
            { label: "Handoff (assets + usage guide)", launch: true, impact: true, growth: true },
        ],
    }
];

export default function PricingPage() {
    const [fxMode, setFxMode] = useState("NONE");
    const [fxRates, setFxRates] = useState({ USD: 0, EUR: 0 });
    const [selectedSuites, setSelectedSuites] = useState({
        launch: false,
        impact: false,
        growth: false,
    });
    const [activeMobileTab, setActiveMobileTab] = useState("launch");

    useEffect(() => {
        const fetchFx = async () => {
            try {
                const res = await fetch("https://open.er-api.com/v6/latest/NGN");
                const data = await res.json();
                if (data && data.rates) {
                    setFxRates({ USD: data.rates.USD, EUR: data.rates.EUR });
                }
            } catch (e) {
                console.error("FX fetch failed", e);
            }
        };
        fetchFx();
    }, []);

    const formatCurrency = (amount, currency = "NGN") => {
        if (currency === "NGN") {
            return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);
        }
        const locale = currency === "EUR" ? "de-DE" : "en-US";
        return new Intl.NumberFormat(locale, { style: "currency", currency: currency, maximumFractionDigits: 0 }).format(amount);
    };

    const calculateTotals = () => {
        const selected = Object.keys(selectedSuites).filter((k) => selectedSuites[k]);
        if (selected.length === 0) return { subtotal: 0, discount: 0, total: 0 };

        const amounts = selected.map((k) => PRICES_NGN[k]);
        const subtotal = amounts.reduce((a, b) => a + b, 0);

        // Sort to keep most expensive full price, 15% off others
        const sorted = [...amounts].sort((a, b) => b - a);
        const discount = sorted.slice(1).reduce((a, b) => a + b * 0.15, 0);
        const total = subtotal - discount;

        return { subtotal, discount, total };
    };

    const totals = calculateTotals();

    const renderIcon = (included, color) => {
        if (!included) return (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 border border-slate-200">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#f97316" strokeWidth="2.6" strokeLinecap="round" /></svg>
            </span>
        );
        const stroke = color === 'red' ? '#dc2626' : color === 'green' ? '#16a34a' : '#2563eb';
        return (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
        );
    };

    return (
        <>
            <LandingHeader />
            <main className="pt-[160px] pb-20">
                <section className="bg-white">
                    <div className="mx-auto max-w-7xl px-5 py-14">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Plans & Pricing</h1>
                            <p className="mt-3 text-base text-slate-600">Choose a suite or bundle multiple suites and get an automatic discount.</p>
                        </div>

                        {/* Price Calculator */}
                        <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-black/5">
                            <div className="flex flex-col lg:flex-row gap-5">
                                <div className="min-w-[260px]">
                                    <h3 className="text-sm font-extrabold text-slate-900">Price Calculation</h3>
                                    <p className="text-xs text-slate-600 mt-1">Bundle two or more suites to get 15% off each additional suite.</p>

                                    <div className="mt-4">
                                        <label className="text-xs font-bold text-slate-700">Show conversion</label>
                                        <select
                                            value={fxMode}
                                            onChange={(e) => setFxMode(e.target.value)}
                                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#0064E0]"
                                        >
                                            <option value="NONE">None (NGN only)</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                        </select>
                                    </div>

                                    <div className="mt-5 space-y-3">
                                        {Object.entries(PLANS).map(([key, plan]) => (
                                            <label key={key} className="flex items-center justify-between p-3 bg-white rounded-2xl ring-1 ring-black/5 cursor-pointer">
                                                <span className="flex items-center gap-3">
                                                    <span className={`h-3 w-3 rounded-full bg-${plan.color}-600`}></span>
                                                    <span className="text-sm font-extrabold">{plan.name}</span>
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSuites[key]}
                                                    onChange={(e) => setSelectedSuites({ ...selectedSuites, [key]: e.target.checked })}
                                                    className="h-5 w-5 rounded border-slate-300"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-1 bg-white rounded-3xl p-6 ring-1 ring-black/5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-sm font-extrabold">Instant Quote</h4>
                                            <p className="text-xs text-slate-600">Select suites on the left to see the total immediately.</p>
                                        </div>
                                        <div className="text-right text-xs text-slate-500">
                                            <div className="font-semibold">Discount rule:</div>
                                            <div>15% off every additional suite</div>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                        <div className="bg-slate-50 p-4 rounded-2xl ring-1 ring-black/5">
                                            <div className="text-xs font-bold text-slate-600">Subtotal</div>
                                            <div className="text-lg font-extrabold">{formatCurrency(totals.subtotal)}</div>
                                            {fxMode !== "NONE" && <div className="text-xs text-slate-500 font-semibold">{formatCurrency(totals.subtotal * fxRates[fxMode], fxMode)}</div>}
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl ring-1 ring-black/5">
                                            <div className="text-xs font-bold text-slate-600">Discount</div>
                                            <div className="text-lg font-extrabold">{formatCurrency(totals.discount)}</div>
                                            {fxMode !== "NONE" && <div className="text-xs text-slate-500 font-semibold">{formatCurrency(totals.discount * fxRates[fxMode], fxMode)}</div>}
                                        </div>
                                        <div className="bg-slate-900 p-4 rounded-2xl text-white">
                                            <div className="text-xs font-bold opacity-70">Total</div>
                                            <div className="text-2xl font-extrabold">{formatCurrency(totals.total)}</div>
                                            {fxMode !== "NONE" && <div className="text-xs opacity-70 font-semibold">{formatCurrency(totals.total * fxRates[fxMode], fxMode)}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Comparison Table */}
                        <div className="mt-16 hidden lg:block overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/5">
                            <table className="w-full border-separate border-spacing-0">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-8 text-left text-sm font-semibold text-slate-500">Compare features</th>
                                        {Object.entries(PLANS).map(([key, plan]) => (
                                            <th key={key} className="px-6 py-8 text-center align-top">
                                                <div className="text-sm font-extrabold">{plan.name}</div>
                                                <div className="mt-2 text-2xl font-extrabold">{formatCurrency(PRICES_NGN[key])}</div>
                                                {fxMode !== "NONE" && <div className="text-xs text-slate-500 font-semibold">{formatCurrency(PRICES_NGN[key] * fxRates[fxMode], fxMode)}</div>}
                                                <Link href="/contact" className={`mt-4 inline-flex w-full justify-center px-5 py-2.5 rounded-full text-sm font-bold text-white bg-${plan.color}-600 hover:opacity-90`}>Choose Plan</Link>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {SECTIONS.map((sec, sIdx) => (
                                        <Fragment key={sIdx}>
                                            <tr>
                                                <td colSpan={4} className="bg-slate-50/80 px-8 py-4 text-sm font-extrabold">{sec.title}</td>
                                            </tr>
                                            {sec.rows.map((row, rIdx) => (
                                                <tr key={rIdx} className="border-t border-slate-100">
                                                    <td className="px-8 py-5 text-sm font-semibold text-slate-700">{row.label}</td>
                                                    <td className="px-6 py-5 text-center">{renderIcon(row.launch, 'red')}</td>
                                                    <td className="px-6 py-5 text-center">{renderIcon(row.impact, 'green')}</td>
                                                    <td className="px-6 py-5 text-center">{renderIcon(row.growth, 'blue')}</td>
                                                </tr>
                                            ))}
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>
            <LandingFooter />
        </>
    );
}

import React from "react";
