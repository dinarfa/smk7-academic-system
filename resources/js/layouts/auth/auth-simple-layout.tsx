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
        <div className="relative min-h-svh bg-background text-foreground">
            <div className="absolute top-6 right-6 z-20">
                <AppearanceToggleTab />
            </div>

            <div className="relative z-10 grid min-h-svh items-center gap-10 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
                <section className="mx-auto flex w-full max-w-2xl flex-col gap-8">
                    <Link
                        href={home()}
                        className="flex w-fit items-center gap-3 rounded-full border border-border bg-card px-4 py-2 font-medium"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <AppLogoIcon className="size-5 fill-current" />
                        </span>
                        <span className="text-sm tracking-wide text-muted-foreground">
                            {name ?? 'Academic System'}
                        </span>
                    </Link>

                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            <Sparkles className="size-3.5 text-primary" />
                            Fast access for school operations
                        </div>

                        <div className="space-y-4">
                            <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                                Sign in with a cleaner, sharper interface.
                            </h1>
                            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                                {description}
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-lg border border-border bg-card p-4">
                                <ShieldCheck className="size-5 text-primary" />
                                <p className="mt-3 text-sm font-semibold">
                                    Secure sessions
                                </p>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    Fortify-backed login and registration.
                                </p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-4">
                                <UsersRound className="size-5 text-primary" />
                                <p className="mt-3 text-sm font-semibold">
                                    Built for every role
                                </p>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    Staff, teachers, and students on one portal.
                                </p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-4">
                                <Sparkles className="size-5 text-primary" />
                                <p className="mt-3 text-sm font-semibold">
                                    Theme ready
                                </p>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    Light, dark, and system modes included.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-md">
                    <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
                        <div className="mb-6 flex items-center gap-3 border-b border-border pb-5">
                            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <AppLogoIcon className="size-5 fill-current" />
                            </span>
                            <div>
                                <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                    Secure access
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    One portal. One session.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                {title}
                            </h2>
                            <p className="text-sm leading-6 text-muted-foreground">
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
