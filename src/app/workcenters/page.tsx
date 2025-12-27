'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import CreateWorkCenterModal from '@/components/CreateWorkCenterModal';

interface WorkCenter {
    id: number;
    name: string;
    code: string;
    tag: string | null;
    cost_per_hour: number;
    capacity_time_efficiency: number;
    oee_target: number | null;
    is_active: boolean;
    created_at: string;
}

export default function WorkCentersPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ username: string; id: number } | null>(null);
    const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWorkCenter, setSelectedWorkCenter] = useState<WorkCenter | null>(null);

    const fetchWorkCenters = useCallback(async () => {
        try {
            const res = await fetch('/api/workcenters');
            if (res.ok) {
                const data = await res.json();
                setWorkCenters(data.workCenters || []);
            }
        } catch (err) {
            console.error('Failed to fetch work centers');
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
        fetchWorkCenters();
    }, [fetchWorkCenters]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    const handleRowClick = (workCenter: WorkCenter) => {
        setSelectedWorkCenter(workCenter);
        setIsModalOpen(true);
    };

    const handleNewWorkCenter = () => {
        setSelectedWorkCenter(null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedWorkCenter(null);
        fetchWorkCenters();
    };

    const activeWorkCenters = workCenters.filter(wc => wc.is_active);
    const inactiveWorkCenters = workCenters.filter(wc => !wc.is_active);

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
            <header className="h-16 bg-[#714B67] text-white flex items-center justify-between px-6 shadow-md shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="text-xl font-bold tracking-tight cursor-pointer" onClick={() => router.push('/dashboard')}>GearGuard</div>
                    <nav className="hidden md:flex space-x-6 text-sm font-medium">
                        <span className="opacity-70 hover:opacity-100 cursor-pointer" onClick={() => router.push('/dashboard')}>Dashboard</span>
                        <span className="opacity-70 hover:opacity-100 cursor-pointer" onClick={() => router.push('/equipment')}>Equipment</span>
                        <span className="opacity-100 border-b-2 border-white pb-1">Work Centers</span>
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
                            <h1 className="text-2xl font-bold text-[#495057]">Work Centers</h1>
                            <p className="text-[#6c757d] text-sm">Manage production work centers and their configurations.</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleNewWorkCenter}
                                className="px-4 py-2 bg-[#017E84] hover:bg-[#015f64] text-white rounded text-sm font-bold shadow-sm transition-all"
                            >
                                NEW WORK CENTER
                            </button>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded shadow-sm border-l-4 border-[#714B67]">
                            <div className="text-xs font-bold text-[#6c757d] uppercase tracking-wider mb-1">Total Work Centers</div>
                            <div className="text-3xl font-bold text-[#495057]">{workCenters.length}</div>
                        </div>
                        <div className="bg-white p-6 rounded shadow-sm border-l-4 border-[#017E84]">
                            <div className="text-xs font-bold text-[#6c757d] uppercase tracking-wider mb-1">Active</div>
                            <div className="text-3xl font-bold text-[#495057]">{activeWorkCenters.length}</div>
                        </div>
                        <div className="bg-white p-6 rounded shadow-sm border-l-4 border-gray-400">
                            <div className="text-xs font-bold text-[#6c757d] uppercase tracking-wider mb-1">Inactive</div>
                            <div className="text-3xl font-bold text-[#495057]">{inactiveWorkCenters.length}</div>
                        </div>
                    </div>

                    <div className="bg-white rounded shadow-sm border border-[#dee2e6] overflow-hidden">
                        <div className="bg-[#f8f9fa] px-6 py-4 border-b border-[#dee2e6] flex justify-between items-center">
                            <span className="font-bold text-[#495057] text-sm uppercase tracking-wide">Work Centers List</span>
                            <button onClick={fetchWorkCenters} className="text-[#017E84] text-xs font-bold hover:underline">Refresh</button>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="p-12 text-center text-gray-500">Loading work centers...</div>
                            ) : workCenters.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f8f9fa] text-[11px] uppercase font-bold text-gray-500 border-b border-gray-100">
                                            <th className="px-6 py-3">Name</th>
                                            <th className="px-6 py-3">Code</th>
                                            <th className="px-6 py-3">Tag</th>
                                            <th className="px-6 py-3">Cost/Hour</th>
                                            <th className="px-6 py-3">Capacity Efficiency</th>
                                            <th className="px-6 py-3">OEE Target</th>
                                            <th className="px-6 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {workCenters.map((wc) => (
                                            <tr
                                                key={wc.id}
                                                onClick={() => handleRowClick(wc)}
                                                className="hover:bg-gray-50 transition-colors text-sm text-[#495057] cursor-pointer"
                                            >
                                                <td className="px-6 py-4 font-medium">{wc.name}</td>
                                                <td className="px-6 py-4 text-gray-600">{wc.code}</td>
                                                <td className="px-6 py-4">{wc.tag || 'N/A'}</td>
                                                <td className="px-6 py-4">${Number(wc.cost_per_hour || 0).toFixed(2)}</td>
                                                <td className="px-6 py-4">{Number(wc.capacity_time_efficiency || 0).toFixed(0)}%</td>
                                                <td className="px-6 py-4">{wc.oee_target ? `${Number(wc.oee_target).toFixed(0)}%` : 'N/A'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${wc.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {wc.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12 flex flex-col items-center justify-center text-center">
                                    <h3 className="text-[#495057] font-bold mb-1">No work centers found</h3>
                                    <p className="text-[#6c757d] text-sm max-w-xs">Create your first work center to start managing production areas.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <CreateWorkCenterModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                initialData={selectedWorkCenter}
            />

            <footer className="h-10 bg-white border-t border-[#dee2e6] flex items-center px-6 text-[10px] text-[#adb5bd] uppercase tracking-widest">
                GearGuard Maintenance v1.0 &copy; 2025
            </footer>
        </div>
    );
}
