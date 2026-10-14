'use client';
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Logo } from '@/components/Brand';
import { EmailIcon, EyeIcon } from '@/components/icons';
import { getTheme } from '@/lib/themes';

interface AdminProfile {
    id: string;
    slug: string;
    business_name: string;
    email: string;
    whatsapp_e164: string | null;
    logo_url: string | null;
    theme: string | null;
    views: number | null;
    created_at: string;
}

type Sort = 'newest' | 'views';

const DAY = 24 * 60 * 60 * 1000;

function Stat({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="rounded-2xl border-2 border-ink bg-white p-5">
            <p className="eyebrow">{label}</p>
            <p className="mt-2 font-display text-4xl font-bold">{value}</p>
        </div>
    );
}

export default function AdminPage() {
    const [auth, setAuth] = useState<'checking' | 'out' | 'in'>('checking');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loggingIn, setLoggingIn] = useState(false);

    const [profiles, setProfiles] = useState<AdminProfile[]>([]);
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<Sort>('newest');
    const [busy, setBusy] = useState<string | null>(null);
    const [notice, setNotice] = useState('');

    const loadProfiles = useCallback(async () => {
        const res = await fetch('/api/admin/profiles', { cache: 'no-store' });
        if (res.status === 401) {
            setAuth('out');
            return;
        }
        const data = await res.json();
        setProfiles(data.profiles || []);
        setAuth('in');
    }, []);

    useEffect(() => {
        fetch('/api/admin/session', { cache: 'no-store' })
            .then((r) => r.json())
            .then((d) => (d.authenticated ? loadProfiles() : setAuth('out')))
            .catch(() => setAuth('out'));
    }, [loadProfiles]);

    const login = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoggingIn(true);
        setLoginError('');
        const res = await fetch('/api/admin/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });
        if (res.ok) {
            setPassword('');
            await loadProfiles();
        } else {
            const data = await res.json().catch(() => ({}));
            setLoginError(data.error || 'Invalid password');
        }
        setLoggingIn(false);
    };

    const logout = async () => {
        await fetch('/api/admin/session', { method: 'DELETE' });
        setProfiles([]);
        setAuth('out');
    };

    const flash = (msg: string) => {
        setNotice(msg);
        setTimeout(() => setNotice(''), 4000);
    };

    const remove = async (p: AdminProfile) => {
        if (!confirm(`Delete “${p.business_name}”? This can’t be undone and its QR code will stop working.`)) return;
        setBusy(p.id);
        const res = await fetch('/api/admin/profiles', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: p.id }),
        });
        if (res.ok) {
            setProfiles((prev) => prev.filter((x) => x.id !== p.id));
            flash(`Deleted ${p.business_name}`);
        } else flash('Delete failed');
        setBusy(null);
    };

    const sendLink = async (p: AdminProfile) => {
        setBusy(p.id);
        const res = await fetch(`/api/admin/profiles/${p.id}/recovery`, { method: 'POST' });
        flash(res.ok ? `Recovery link sent to ${p.email}` : 'Failed to send recovery link');
        setBusy(null);
    };

    const emailAll = async () => {
        if (!confirm(`Send the announcement email to all ${profiles.length} page owners?`)) return;
        setBusy('all');
        const res = await fetch('/api/admin/notify-all', { method: 'POST' });
        const data = await res.json().catch(() => ({}));
        flash(res.ok ? `Emails: ${data.sent} sent, ${data.failed} failed` : 'Failed to send emails');
        setBusy(null);
    };

    const stats = useMemo(() => {
        const now = Date.now();
        const startOfToday = new Date().setHours(0, 0, 0, 0);
        const days = Array.from({ length: 14 }, (_, i) => {
            const start = startOfToday - (13 - i) * DAY;
            return {
                label: new Date(start).toLocaleDateString('en', { weekday: 'narrow' }),
                date: new Date(start).toLocaleDateString(),
                count: profiles.filter((p) => {
                    const t = new Date(p.created_at).getTime();
                    return t >= start && t < start + DAY;
                }).length,
            };
        });
        return {
            total: profiles.length,
            today: profiles.filter((p) => new Date(p.created_at).getTime() >= startOfToday).length,
            week: profiles.filter((p) => now - new Date(p.created_at).getTime() <= 7 * DAY).length,
            views: profiles.reduce((sum, p) => sum + (p.views || 0), 0),
            days,
            max: Math.max(1, ...days.map((d) => d.count)),
        };
    }, [profiles]);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        const list = q
            ? profiles.filter((p) => [p.business_name, p.email, p.slug, p.whatsapp_e164 || ''].some((v) => v?.toLowerCase().includes(q)))
            : profiles;
        return sort === 'views' ? [...list].sort((a, b) => (b.views || 0) - (a.views || 0)) : list;
    }, [profiles, query, sort]);

    if (auth === 'checking') return <main className="flex min-h-screen items-center justify-center text-muted">Loading…</main>;

    if (auth === 'out') {
        return (
            <main className="flex min-h-screen items-center justify-center px-4">
                <form onSubmit={login} className="card w-full max-w-sm space-y-5">
                    <div className="flex items-center justify-between">
                        <Logo />
                        <span className="chip">Admin</span>
                    </div>
                    <div>
                        <label htmlFor="password" className="label">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                            autoComplete="current-password"
                            autoFocus
                        />
                    </div>
                    {loginError && <p className="text-sm font-medium text-[#D23A3A]">{loginError}</p>}
                    <button type="submit" disabled={loggingIn || !password} className="btn-primary w-full">
                        {loggingIn ? 'Checking…' : 'Sign in'}
                    </button>
                </form>
            </main>
        );
    }

    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-30 border-b-2 border-ink bg-paper">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <Logo />
                        <span className="chip">Admin</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={emailAll} disabled={!!busy || profiles.length === 0} className="btn-secondary px-3 py-2 text-sm">
                            <EmailIcon className="h-4 w-4" />
                            {busy === 'all' ? 'Sending…' : 'Email all'}
                        </button>
                        <button type="button" onClick={logout} className="btn-ghost px-3 py-2 text-sm">
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
                {notice && (
                    <p role="status" className="rounded-xl border-2 border-ink bg-accent px-4 py-3 text-sm font-semibold">
                        {notice}
                    </p>
                )}

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Stat label="Pages" value={stats.total} />
                    <Stat label="Created today" value={stats.today} />
                    <Stat label="Last 7 days" value={stats.week} />
                    <Stat label="Total visits" value={stats.views.toLocaleString()} />
                </div>

                <div className="rounded-2xl border-2 border-ink bg-white p-5">
                    <p className="eyebrow mb-4">New pages, last 14 days</p>
                    <div className="flex h-36 items-end gap-1.5">
                        {stats.days.map((d) => (
                            <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${d.date}: ${d.count}`}>
                                <span className="text-[10px] font-semibold">{d.count || ''}</span>
                                <div
                                    className="w-full rounded-t-md border-2 border-b-0 border-ink bg-accent"
                                    style={{ height: `${(d.count / stats.max) * 100}%`, minHeight: d.count ? 8 : 2 }}
                                />
                                <span className="text-[10px] text-muted">{d.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border-2 border-ink bg-white">
                    <div className="flex flex-col gap-3 border-b-2 border-ink p-4 sm:flex-row sm:items-center sm:justify-between">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search name, email, link or number…"
                            className="input py-2 sm:max-w-xs"
                        />
                        <div className="flex gap-1 rounded-xl border-2 border-ink p-1 text-sm">
                            {(['newest', 'views'] as Sort[]).map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setSort(s)}
                                    className={`rounded-lg px-3 py-1 font-semibold ${sort === s ? 'bg-ink text-paper' : ''}`}
                                >
                                    {s === 'newest' ? 'Newest' : 'Most visited'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b-2 border-ink bg-paper">
                                <tr className="eyebrow">
                                    <th className="px-4 py-3 font-medium">Business</th>
                                    <th className="px-4 py-3 font-medium">Contact</th>
                                    <th className="px-4 py-3 font-medium">Visits</th>
                                    <th className="px-4 py-3 font-medium">Created</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {visible.map((p) => {
                                    const theme = getTheme(p.theme);
                                    return (
                                        <tr key={p.id} className="hover:bg-paper/60">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-ink font-display font-bold"
                                                        style={{ background: theme.accent, color: theme.accentText }}
                                                    >
                                                        {p.logo_url ? <img src={p.logo_url} alt="" className="h-full w-full object-cover" /> : p.business_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="max-w-[200px] truncate font-semibold">{p.business_name}</p>
                                                        <a href={`/u/${p.slug}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-muted hover:underline">
                                                            /u/{p.slug}
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p>{p.email}</p>
                                                {p.whatsapp_e164 && <p className="text-xs text-muted">+{p.whatsapp_e164}</p>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 font-semibold">
                                                    <EyeIcon className="h-3.5 w-3.5" /> {(p.views || 0).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-muted">{new Date(p.created_at).toLocaleDateString()}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right">
                                                <div className="flex justify-end gap-3 text-xs font-semibold">
                                                    <button type="button" disabled={busy === p.id} onClick={() => sendLink(p)} className="hover:underline disabled:opacity-50">
                                                        Send edit link
                                                    </button>
                                                    <button type="button" disabled={busy === p.id} onClick={() => remove(p)} className="text-[#D23A3A] hover:underline disabled:opacity-50">
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {visible.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-muted">
                                            {profiles.length === 0 ? 'No pages yet.' : 'No matches.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
