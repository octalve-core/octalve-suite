"use client";

import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

export default function ContactPage() {
    const contactMethods = [
        {
            title: "Location:",
            value: "Wuye, Abuja, Nigeria.",
            icon: (
                <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 22s7-5.2 7-12a7 7 0 10-14 0c0 6.8 7 12 7 12z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 10.2a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            bg: "bg-red-600",
            link: null
        },
        {
            title: "Phone:",
            value: "+2348073459090",
            icon: (
                <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1A19.4 19.4 0 013.2 10.8 19.8 19.8 0 01.1 2.2 2 2 0 012.1 0h3a2 2 0 012 1.7c.1.8.3 1.6.6 2.4a2 2 0 01-.4 2.1L6 7.8a16 16 0 008.2 8.2l1.6-1.3a2 2 0 012.1-.4c.8.3 1.6.5 2.4.6A2 2 0 0122 16.9z" fill="currentColor" />
                </svg>
            ),
            bg: "bg-blue-600",
            link: "tel:+2348073459090"
        },
        {
            title: "Email:",
            value: "info@octalve.com",
            icon: (
                <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 6h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 8l-10 7L2 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            bg: "bg-green-600",
            link: "mailto:info@octalve.com"
        }
    ];

    return (
        <>
            <LandingHeader />
            <main className="pt-[160px] pb-20">
                <section className="bg-white">
                    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-16 lg:py-24">
                        <div className="text-center">
                            <div className="text-sm font-semibold tracking-[0.35em] text-blue-600 uppercase">Contact Info</div>
                            <h1 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-slate-800 sm:text-5xl">
                                Reach Out to Us for any<br className="hidden sm:block" />
                                Inquiries or Support
                            </h1>
                        </div>

                        <div className="mt-12 grid gap-6 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
                            {contactMethods.map((method, idx) => (
                                <div key={idx} className="group rounded-3xl bg-white p-6 shadow-lg ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl">
                                    <div className="flex items-center gap-5">
                                        <div className={`grid h-20 w-20 place-items-center rounded-full ${method.bg} text-white ring-1 ring-black/5`}>
                                            {method.icon}
                                        </div>
                                        <div>
                                            <div className="text-xl font-extrabold text-slate-800">{method.title}</div>
                                            {method.link ? (
                                                <a href={method.link} className="mt-1 block text-base font-medium text-slate-600 hover:text-slate-900">{method.value}</a>
                                            ) : (
                                                <div className="mt-1 text-base font-medium text-slate-600">{method.value}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <LandingFooter />
        </>
    );
}
