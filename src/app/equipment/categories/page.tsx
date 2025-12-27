'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import CreateCategoryModal from '@/components/CreateCategoryModal';

interface Category {
    id: number;
    name: string;
    company_id: number;
    responsible_technician_id: number | null;
    responsible_technician_name: string | null;
    created_at: string;
}

export default function CategoriesPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ username: string; id: number } | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/equipment/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories || []);
            }
        } catch (err) {
            console.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (err) {
                console.error('Session check failed');
            }
        };
        checkSession();
        fetchCategories();
    }, [fetchCategories]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    const handleRowClick = (category: Category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleNewCategory = () => {
        setSelectedCategory(null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
        fetchCategories();
    };

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
            <header className="h-16 bg-[#714B67] text-white flex items-center justify-between px-6 shadow-md shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="text-xl font-bold tracking-tight cursor-pointer" onClick={() => router.push('/dashboard')}>GearGuard</div>
                    <nav className="hidden md:flex space-x-6 text-sm font-medium">
                        <span className="opacity-70 hover:opacity-100 cursor-pointer" onClick={() => router.push('/dashboard')}>Dashboard</span>
                        <span className="opacity-100 border-b-2 border-white pb-1">Equipment</span>
                        <span className="opacity-70 hover:opacity-100 cursor-pointer" onClick={() => router.push('/workcenters')}>Work Centers</span>
                        <span className="opacity-70 hover:opacity-100 cursor-pointer" onClick={() => router.push('/teams')}>Teams</span>
                    </nav>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 mr-4 opacity-90">
                        <div className="w-8 h-8 rounded-full bg-[#017E84] flex items-center justify-center font-bold text-xs">
                            {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
                        </div>
                        <span className="text-sm font-medium">{user?.username || 'Mitchell Admin'}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-1.5 bg-[#017E84] hover:bg-[#015f64] rounded text-sm font-bold transition-all shadow"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="flex-grow p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-8 border-b-2 border-[#dee2e6] pb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-[#495057]">Equipment Categories</h1>
                            <p className="text-[#6c757d] text-sm">Manage equipment categories and their responsible technicians.</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => router.push('/equipment')}
                                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded text-sm font-bold shadow-sm border border-gray-300 transition-all"
                            >
                                BACK TO EQUIPMENT
                            </button>
                            <button
                                onClick={handleNewCategory}
                                className="px-4 py-2 bg-[#017E84] hover:bg-[#015f64] text-white rounded text-sm font-bold shadow-sm transition-all"
                            >
                                NEW CATEGORY
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded shadow-sm border border-[#dee2e6] overflow-hidden">
                        <div className="bg-[#f8f9fa] px-6 py-4 border-b border-[#dee2e6] flex justify-between items-center">
                            <span className="font-bold text-[#495057] text-sm uppercase tracking-wide">Categories List</span>
                            <button onClick={fetchCategories} className="text-[#017E84] text-xs font-bold hover:underline">Refresh</button>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="p-12 text-center text-gray-500">Loading categories...</div>
                            ) : categories.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f8f9fa] text-[11px] uppercase font-bold text-gray-500 border-b border-gray-100">
                                            <th className="px-6 py-3">Category Name</th>
                                            <th className="px-6 py-3">Company</th>
                                            <th className="px-6 py-3">Responsible Technician</th>
                                            <th className="px-6 py-3">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {categories.map((cat) => (
                                            <tr
                                                key={cat.id}
                                                onClick={() => handleRowClick(cat)}
                                                className="hover:bg-gray-50 transition-colors text-sm text-[#495057] cursor-pointer"
                                            >
                                                <td className="px-6 py-4 font-medium">{cat.name}</td>
                                                <td className="px-6 py-4">Company #{cat.company_id}</td>
                                                <td className="px-6 py-4">{cat.responsible_technician_name || 'Unassigned'}</td>
                                                <td className="px-6 py-4">{new Date(cat.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12 flex flex-col items-center justify-center text-center">
                                    <h3 className="text-[#495057] font-bold mb-1">No categories found</h3>
                                    <p className="text-[#6c757d] text-sm max-w-xs">Create your first equipment category to organize your assets.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <CreateCategoryModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                initialData={selectedCategory}
            />

            <footer className="h-10 bg-white border-t border-[#dee2e6] flex items-center px-6 text-[10px] text-[#adb5bd] uppercase tracking-widest">
                GearGuard Maintenance v1.0 &copy; 2025
            </footer>
        </div>
    );
}
