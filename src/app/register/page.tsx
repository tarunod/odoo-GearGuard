'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        department: 'Maintenance',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordValidations, setPasswordValidations] = useState({
        minLength: false,
        hasUpper: false,
        hasLower: false,
        hasSymbol: false,
    });
    const router = useRouter();

    useEffect(() => {
        const pass = formData.password;
        setPasswordValidations({
            minLength: pass.length >= 8,
            hasUpper: /[A-Z]/.test(pass),
            hasLower: /[a-z]/.test(pass),
            hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
        });
    }, [formData.password]);

    const validatePassword = () => {
        if (!passwordValidations.minLength) return 'Password must be at least 8 characters long.';
        if (!passwordValidations.hasUpper) return 'Password must contain at least one uppercase letter.';
        if (!passwordValidations.hasLower) return 'Password must contain at least one lowercase letter.';
        if (!passwordValidations.hasSymbol) return 'Password must contain at least one special character.';
        return null;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const passwordError = validatePassword();
        if (passwordError) {
            setError(passwordError);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/login');
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const ValidationItem = ({ met, text }: { met: boolean; text: string }) => (
        <div className={`flex items-center space-x-2 text-[10px] font-medium transition-colors ${met ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${met ? 'bg-green-100 border-green-500' : 'bg-gray-100 border-gray-300'}`}>
                {met && (
                    <svg className="w-2 h-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                )}
            </div>
            <span>{text}</span>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-lg border-t-8 border-[#017E84]">
                <div className="flex flex-col items-center mb-8">
                    <div className="text-3xl font-bold text-[#714B67] mb-2 tracking-tight">GearGuard</div>
                    <div className="text-[#6c757d] text-sm uppercase tracking-widest">Create New Account</div>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
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
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-4 py-3 rounded border border-[#dee2e6] focus:outline-none focus:ring-2 focus:ring-[#017E84] transition-all text-black"
                            placeholder="Pick a unique username"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#495057] mb-2 uppercase tracking-wide">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded border border-[#dee2e6] focus:outline-none focus:ring-2 focus:ring-[#017E84] transition-all text-black"
                            placeholder="you@gearguard.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#495057] mb-2 uppercase tracking-wide">
                            Password
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-3 rounded border border-[#dee2e6] focus:outline-none focus:ring-2 focus:ring-[#017E84] transition-all text-black"
                            placeholder="••••••••"
                            required
                        />
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <ValidationItem met={passwordValidations.minLength} text="8+ characters" />
                            <ValidationItem met={passwordValidations.hasUpper} text="Uppercase letter" />
                            <ValidationItem met={passwordValidations.hasLower} text="Lowercase letter" />
                            <ValidationItem met={passwordValidations.hasSymbol} text="Special symbol" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#495057] mb-2 uppercase tracking-wide">
                            Department
                        </label>
                        <select
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="w-full px-4 py-3 rounded border border-[#dee2e6] focus:outline-none focus:ring-2 focus:ring-[#017E84] transition-all text-black bg-white"
                            required
                        >
                            <option value="Maintenance">Maintenance</option>
                            <option value="Operations">Operations</option>
                            <option value="Management">Management</option>
                            <option value="Engineering">Engineering</option>
                            <option value="IT">IT</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#714B67] hover:bg-[#5d3e55] text-white font-bold rounded shadow-lg transform active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
                    >
                        {loading ? 'Registering...' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-[#6c757d]">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[#017E84] font-bold hover:underline">
                        Log In
                    </Link>
                </div>
            </div>
        </div>
    );
}
