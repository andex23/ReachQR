'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Profile {
    id: string;
    business_name: string;
    slug: string;
    email: string;
    whatsapp_e164: string;
    created_at: string;
    edit_token_hash: string; // We won't use this directly, but good to know it exists
    logo_url: string | null;
}

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [error, setError] = useState('');

    // Check session on mount
    useEffect(() => {
        const stored = localStorage.getItem('reach_admin_key');
        if (stored) {
            fetchProfiles(stored);
        }
    }, []);

    const fetchProfiles = async (pwd: string) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/profiles', {
                headers: { 'x-admin-password': pwd },
            });

            if (res.ok) {
                const data = await res.json();
                setProfiles(data.profiles);
                setIsAuthenticated(true);
                localStorage.setItem('reach_admin_key', pwd);
            } else {
                setError('Invalid password');
                localStorage.removeItem('reach_admin_key');
                setIsAuthenticated(false);
            }
        } catch {
            setError('Failed to load data');
        }
        setLoading(false);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProfiles(password);
    };

    const handleLogout = () => {
        localStorage.removeItem('reach_admin_key');
        setIsAuthenticated(false);
        setProfiles([]);
        setPassword('');
    };

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-border">
                    <h1 className="text-xl font-mono font-semibold text-center mb-6">Admin Access</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password..."
                            className="input-field w-full"
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? 'Checking...' : 'Login'}
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-border px-4 md:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="font-mono font-semibold text-ink">
                        Reach<span className="text-ink/40">QR</span>
                    </Link>
                    <span className="bg-ink/5 px-2 py-0.5 rounded text-xs font-mono text-ink/60">ADMIN</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-sm text-ink/60 hover:text-ink hover:underline"
                >
                    Logout
                </button>
            </nav>

            {/* Dashboard */}
            <div className="max-w-6xl mx-auto py-8 px-4 md:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
                    <div className="bg-white px-4 py-2 rounded-lg border border-border text-sm font-medium">
                        Total Users: {profiles.length}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-border text-xs uppercase text-ink/50 font-medium tracking-wide">
                                    <th className="px-6 py-4">Business</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {profiles.map((profile) => (
                                    <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {profile.logo_url ? (
                                                        <img src={profile.logo_url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="font-mono text-sm font-semibold">{profile.business_name.charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-ink">{profile.business_name}</p>
                                                    <a
                                                        href={`/u/${profile.slug}`}
                                                        target="_blank"
                                                        rel="noopener"
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        reachqr.com/{profile.slug}
                                                    </a>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-ink">{profile.email}</p>
                                            <p className="text-xs text-ink/50">{profile.whatsapp_e164}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-ink/60">
                                            {new Date(profile.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a
                                                href={`/u/${profile.slug}`}
                                                target="_blank"
                                                className="text-sm font-medium text-ink/60 hover:text-ink hover:underline"
                                            >
                                                View
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                                {profiles.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-ink/50">
                                            No profiles found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
