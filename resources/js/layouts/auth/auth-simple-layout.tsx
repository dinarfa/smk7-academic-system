import { Link, usePage } from '@inertiajs/react';
import { ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import AppearanceToggleTab from '@/components/appearance-tabs';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props as { name?: string };

    return (
        <div className="relative min-h-svh overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_48%,_#f8fafc_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_50%,_#020617_100%)] dark:text-slate-100">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35 dark:opacity-20" />
            <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl dark:bg-fuchsia-500/10" />

            <div className="absolute top-6 right-6 z-20">
                <AppearanceToggleTab />
            </div>

            <div className="relative z-10 grid min-h-svh items-center gap-10 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
                <section className="mx-auto flex w-full max-w-2xl flex-col gap-8">
                    <Link
                        href={home()}
                        className="flex w-fit items-center gap-3 rounded-full border border-white/60 bg-white/70 px-4 py-2 font-medium shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg shadow-slate-950/20 dark:bg-white dark:text-slate-950">
                            <AppLogoIcon className="size-5 fill-current" />
                        </span>
                        <span className="text-sm tracking-wide text-slate-600 dark:text-slate-300">
                            {name ?? 'Academic System'}
                        </span>
                    </Link>

                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-slate-500 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                            <Sparkles className="size-3.5 text-cyan-500" />
                            Fast access for school operations
                        </div>

                        <div className="space-y-4">
                            <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                                Sign in with a cleaner, sharper interface.
                            </h1>
                            <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                                {description}
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-white/60 bg-white/75 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                                <ShieldCheck className="size-5 text-cyan-500" />
                                <p className="mt-3 text-sm font-semibold">
                                    Secure sessions
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    Fortify-backed login and registration.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/60 bg-white/75 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                                <UsersRound className="size-5 text-indigo-500" />
                                <p className="mt-3 text-sm font-semibold">
                                    Built for every role
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    Staff, teachers, and students on one portal.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/60 bg-white/75 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                                <Sparkles className="size-5 text-fuchsia-500" />
                                <p className="mt-3 text-sm font-semibold">
                                    Theme ready
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    Light, dark, and system modes included.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-md">
                    <div className="relative rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70 dark:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.65)] sm:p-8">
                        <div className="mb-6 flex items-center gap-3 border-b border-slate-200/80 pb-5 dark:border-white/10">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/20 dark:bg-white dark:text-slate-950">
                                <AppLogoIcon className="size-5 fill-current" />
                            </span>
                            <div>
                                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                    Secure access
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    One portal. One session.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                {title}
                            </h2>
                            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                                {description}
                            </p>
                        </div>

                        <div className="mt-8">{children}</div>
                    </div>
                </section>
            </div>
        </div>
    );
}
