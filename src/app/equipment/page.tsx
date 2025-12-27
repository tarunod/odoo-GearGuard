'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import CreateEquipmentModal from '@/components/CreateEquipmentModal';

interface Equipment {
    id: number;
    name: string;
    serial_number: string;
    category_name: string;
    location: string;
    purchase_date: string | null;
    warranty_end_date: string | null;
    is_scrapped: boolean;
    maintenance_team_name: string | null;
    assigned_employee_name: string | null;
    default_technician_name: string | null;
    used_by_employee_name: string | null;
}

export default function EquipmentPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ username: string; id: number } | null>(null);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

    const fetchEquipment = useCallback(async () => {
        try {
            const res = await fetch('/api/equipment/list');
            if (res.ok) {
                const data = await res.json();
                setEquipment(data.equipment || []);
            }
        } catch (err) {
            console.error('Failed to fetch equipment');
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
        fetchEquipment();
    }, [fetchEquipment]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    const handleRowClick = (eq: Equipment) => {
        setSelectedEquipment(eq);
        setIsModalOpen(true);
    };

    const handleNewEquipment = () => {
        setSelectedEquipment(null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedEquipment(null);
        fetchEquipment();
    };

    const activeEquipment = equipment.filter(e => !e.is_scrapped);
    const scrappedEquipment = equipment.filter(e => e.is_scrapped);

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
            {/* Odoo-style Header */}
            <header className="h-16 bg-[#714B67] text-white flex items-center justify-between px-6 shadow-md shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="text-xl font-bold tracking-tight cursor-pointer" onClick={() => router.push('/dashboard')}>GearGuard</div>
                    <nav className="hidden md:flex space-x-6 text-sm font-medium">
                        <span className="opacity-70 hover:opacity-100 cursor-pointer" onClick={() => router.push('/dashboard')}>Dashboard</span>
                        <div
                            className="relative"
                            onMouseEnter={() => setShowEquipmentDropdown(true)}
                            onMouseLeave={() => setShowEquipmentDropdown(false)}
                        >
                            <span className="opacity-100 border-b-2 border-white pb-1 cursor-pointer flex items-center">
                                Equipment
                                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                            {showEquipmentDropdown && (
                                <div className="absolute top-full left-0 pt-2 w-48 z-50">
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
                            )}
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
                            <h1 className="text-2xl font-bold text-[#495057]">Equipment</h1>
                            <p className="text-[#6c757d] text-sm">Manage and track all your equipment assets.</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleNewEquipment}
                                className="px-4 py-2 bg-[#017E84] hover:bg-[#015f64] text-white rounded text-sm font-bold shadow-sm transition-all"
                            >
                                NEW EQUIPMENT
                            </button>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded shadow-sm border-l-4 border-[#714B67]">
                            <div className="text-xs font-bold text-[#6c757d] uppercase tracking-wider mb-1">Total Equipment</div>
                            <div className="text-3xl font-bold text-[#495057]">{equipment.length}</div>
                        </div>
                        <div className="bg-white p-6 rounded shadow-sm border-l-4 border-[#017E84]">
                            <div className="text-xs font-bold text-[#6c757d] uppercase tracking-wider mb-1">Active</div>
                            <div className="text-3xl font-bold text-[#495057]">{activeEquipment.length}</div>
                        </div>
                        <div className="bg-white p-6 rounded shadow-sm border-l-4 border-red-500">
                            <div className="text-xs font-bold text-[#6c757d] uppercase tracking-wider mb-1">Scrapped</div>
                            <div className="text-3xl font-bold text-[#495057]">{scrappedEquipment.length}</div>
                        </div>
                    </div>

                    <div className="bg-white rounded shadow-sm border border-[#dee2e6] overflow-hidden">
                        <div className="bg-[#f8f9fa] px-6 py-4 border-b border-[#dee2e6] flex justify-between items-center">
                            <span className="font-bold text-[#495057] text-sm uppercase tracking-wide">Equipment List</span>
                            <div className="flex items-center space-x-4">
                                <button onClick={fetchEquipment} className="text-[#017E84] text-xs font-bold hover:underline">Refresh</button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="p-12 text-center text-gray-500">Loading equipment...</div>
                            ) : equipment.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f8f9fa] text-[11px] uppercase font-bold text-gray-500 border-b border-gray-100">
                                            <th className="px-6 py-3">Name</th>
                                            <th className="px-6 py-3">Serial Number</th>
                                            <th className="px-6 py-3">Category</th>
                                            <th className="px-6 py-3">Location</th>
                                            <th className="px-6 py-3">Maintenance Team</th>
                                            <th className="px-6 py-3">Assigned To</th>
                                            <th className="px-6 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {equipment.map((eq) => (
                                            <tr
                                                key={eq.id}
                                                onClick={() => handleRowClick(eq)}
                                                className="hover:bg-gray-50 transition-colors text-sm text-[#495057] cursor-pointer"
                                            >
                                                <td className="px-6 py-4 font-medium">{eq.name}</td>
                                                <td className="px-6 py-4 text-gray-600">{eq.serial_number}</td>
                                                <td className="px-6 py-4">{eq.category_name || 'N/A'}</td>
                                                <td className="px-6 py-4">{eq.location || 'N/A'}</td>
                                                <td className="px-6 py-4">{eq.maintenance_team_name || 'N/A'}</td>
                                                <td className="px-6 py-4">{eq.used_by_employee_name || 'Unassigned'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${eq.is_scrapped ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                        {eq.is_scrapped ? 'SCRAPPED' : 'ACTIVE'}
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
                                    <h3 className="text-[#495057] font-bold mb-1">No equipment found</h3>
                                    <p className="text-[#6c757d] text-sm max-w-xs">Start tracking your assets by adding equipment to the system.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <CreateEquipmentModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                initialData={selectedEquipment}
            />

            <footer className="h-10 bg-white border-t border-[#dee2e6] flex items-center px-6 text-[10px] text-[#adb5bd] uppercase tracking-widest">
                GearGuard Maintenance v1.0 &copy; 2025
            </footer>
        </div>
    );
}
