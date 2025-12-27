'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import MaintenanceRequestModal from '@/components/MaintenanceRequestModal';

interface MaintenanceRequest {
    id: number;
    subject: string;
    description: string;
    maintenance_for: string;
    maintenance_type: string;
    priority: number;
    stage: string;
    scheduled_date: string | null;
    duration_hours: number;
    created_at: string;
    equipment_name: string | null;
    work_center_name: string | null;
    team_name: string;
    technician_name: string | null;
    creator_name: string;
    requested_employee_name: string | null;
    equipment_id: number | null;
    work_center_id: number | null;
    maintenance_team_id: number;
    technician_id: number | null;
    requested_by_id: number | null;
}

export default function DashboardPage() {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
    const [user, setUser] = useState<{ username: string; id: number } | null>(null);
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = useCallback(async () => {
        try {
            const res = await fetch('/api/maintenance/list');
            if (res.ok) {
                const data = await res.json();
                setRequests(data.requests || []);
            }
        } catch (err) {
            console.error('Failed to fetch requests');
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
        fetchRequests();
    }, [fetchRequests]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
        fetchRequests(); // Refresh data after closing modal (might have saved)
    };

    const handleRowClick = (req: MaintenanceRequest) => {
        setSelectedRequest(req);
        setIsModalOpen(true);
    };

    const handleNewRequest = () => {
        setSelectedRequest(null);
        setIsModalOpen(true);
    };

    // Calculate counts
    const todoCount = requests.filter(r => r.stage === 'new').length;
    const inProgressCount = requests.filter(r => r.stage === 'in_progress').length;
    const pendingCount = requests.filter(r => r.stage === 'repaired').length;

    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'new': return 'bg-blue-100 text-blue-700';
            case 'in_progress': return 'bg-yellow-100 text-yellow-700';
            case 'repaired': return 'bg-green-100 text-green-700';
            case 'scrap': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatStage = (stage: string) => {
        return stage.replace('_', ' ').toUpperCase();
    };

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
            {/* Odoo-style Header */}
            <header className="h-16 bg-[#714B67] text-white flex items-center justify-between px-6 shadow-md shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="text-xl font-bold tracking-tight cursor-pointer" onClick={() => router.push('/dashboard')}>GearGuard</div>
                    <nav className="hidden md:flex space-x-6 text-sm font-medium">
                        <span className="opacity-100 border-b-2 border-white pb-1">Dashboard</span>
                        <div className="relative group">
                            <span className="opacity-70 hover:opacity-100 cursor-pointer flex items-center" onClick={() => router.push('/equipment')}>
                                Equipment
                                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                            <div className="absolute top-full left-0 pt-2 w-48 z-50 hidden group-hover:block">
                                <div className="bg-white rounded shadow-lg border border-gray-200 py-1">
                                    <button
                                        onClick={() => router.push('/equipment')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-normal"
                                    >
                                        All Equipment
                                    </button>
                                    <button
                                        onClick={() => router.push('/equipment/categories')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-normal"
                                    >
                                        Equipment Categories
                                    </button>
                                </div>
                            </div>
                        </div>
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

            {/* Main Content Area */}
            <main className="flex-grow p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-8 border-b-2 border-[#dee2e6] pb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-[#495057]">Maintenance Dashboard</h1>
                            <p className="text-[#6c757d] text-sm">Welcome back to your GearGuard control panel.</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleNewRequest}
                                className="px-4 py-2 bg-[#017E84] hover:bg-[#015f64] text-white rounded text-sm font-bold shadow-sm transition-all"
                            >
                                NEW REQUEST
                            </button>
                        </div>
                    </div>

                    {/* Dashboard Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded shadow-sm border-l-4 border-[#714B67]">
                            <div className="text-xs font-bold text-[#6c757d] uppercase tracking-wider mb-1">To Do</div>
                            <div className="text-3xl font-bold text-[#495057]">{todoCount}</div>
                        </div>
                        <div className="bg-white p-6 rounded shadow-sm border-l-4 border-[#017E84]">
                            <div className="text-xs font-bold text-[#6c757d] uppercase tracking-wider mb-1">In Progress</div>
                            <div className="text-3xl font-bold text-[#495057]">{inProgressCount}</div>
                        </div>
                        <div className="bg-white p-6 rounded shadow-sm border-l-4 border-yellow-500">
                            <div className="text-xs font-bold text-[#6c757d] uppercase tracking-wider mb-1">Repaired / Pending</div>
                            <div className="text-3xl font-bold text-[#495057]">{pendingCount}</div>
                        </div>
                    </div>

                    <div className="bg-white rounded shadow-sm border border-[#dee2e6] overflow-hidden">
                        <div className="bg-[#f8f9fa] px-6 py-4 border-b border-[#dee2e6] flex justify-between items-center">
                            <span className="font-bold text-[#495057] text-sm uppercase tracking-wide">Maintenance Requests</span>
                            <div className="flex items-center space-x-4">
                                <button onClick={fetchRequests} className="text-[#017E84] text-xs font-bold hover:underline">Refresh</button>
                                <span className="text-[#017E84] text-xs font-bold hover:underline cursor-pointer">View All</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="p-12 text-center text-gray-500">Loading requests...</div>
                            ) : requests.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f8f9fa] text-[11px] uppercase font-bold text-gray-500 border-b border-gray-100">
                                            <th className="px-6 py-3">Subject</th>
                                            <th className="px-6 py-3">Equipment / Work Center</th>
                                            <th className="px-6 py-3">Team</th>
                                            <th className="px-6 py-3">Employee</th>
                                            <th className="px-6 py-3">Responsible</th>
                                            <th className="px-6 py-3">Scheduled Date</th>
                                            <th className="px-6 py-3">Priority</th>
                                            <th className="px-6 py-3">Stage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {requests.map((req) => (
                                            <tr
                                                key={req.id}
                                                onClick={() => handleRowClick(req)}
                                                className="hover:bg-gray-50 transition-colors text-sm text-[#495057] cursor-pointer"
                                            >
                                                <td className="px-6 py-4 font-medium">{req.subject}</td>
                                                <td className="px-6 py-4">{req.equipment_name || req.work_center_name || 'N/A'}</td>
                                                <td className="px-6 py-4">{req.team_name}</td>
                                                <td className="px-6 py-4">{req.requested_employee_name || req.creator_name}</td>
                                                <td className="px-6 py-4">{req.technician_name || req.creator_name}</td>
                                                <td className="px-6 py-4">{req.scheduled_date ? new Date(req.scheduled_date).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex text-[#714B67]">
                                                        {[1, 2, 3].map(star => (
                                                            <svg key={star} className={`w-4 h-4 ${req.priority >= star ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStageColor(req.stage)}`}>
                                                        {formatStage(req.stage)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-[#f8f9fa] rounded-full flex items-center justify-center mb-4 text-[#dee2e6]">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <h3 className="text-[#495057] font-bold mb-1">No maintenance requests yet</h3>
                                    <p className="text-[#6c757d] text-sm max-w-xs">Start tracking your maintenance tasks by creating your first request.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <MaintenanceRequestModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                user={user}
                initialData={selectedRequest}
            />

            <footer className="h-10 bg-white border-t border-[#dee2e6] flex items-center px-6 text-[10px] text-[#adb5bd] uppercase tracking-widest">
                GearGuard Maintenance v1.0 &copy; 2025
            </footer>
        </div>
    );
}
