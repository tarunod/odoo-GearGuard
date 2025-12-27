'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/dashboard');
                router.refresh();
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa]">
            <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-lg border-t-8 border-[#714B67]">
                <div className="flex flex-col items-center mb-8">
                    <div className="text-3xl font-bold text-[#714B67] mb-2 tracking-tight">GearGuard</div>
                    <div className="text-[#6c757d] text-sm uppercase tracking-widest">Maintenance Management</div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-white bg-red-500 rounded font-medium text-center animate-pulse">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-[#495057] mb-2 uppercase tracking-wide">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded border border-[#dee2e6] focus:outline-none focus:ring-2 focus:ring-[#714B67] transition-all text-black"
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#495057] mb-2 uppercase tracking-wide">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded border border-[#dee2e6] focus:outline-none focus:ring-2 focus:ring-[#714B67] transition-all text-black"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#017E84] hover:bg-[#015f64] text-white font-bold rounded shadow-lg transform active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
                    >
                        {loading ? 'Processing...' : 'Log In'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-[#6c757d]">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-[#017E84] font-bold hover:underline">
                        Register now
                    </Link>
                </div>
            </div>

            <div className="mt-6 text-[#adb5bd] text-xs">
                Powered by <span className="font-semibold">Odoo-inspired GearGuard</span>
            </div>
        </div>
    );
}
