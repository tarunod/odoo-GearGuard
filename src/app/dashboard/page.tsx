'use client';

import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
            {/* Odoo-style Header */}
            <header className="h-16 bg-[#714B67] text-white flex items-center justify-between px-6 shadow-md shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="text-xl font-bold tracking-tight">GearGuard</div>
                    <nav className="hidden md:flex space-x-6 text-sm font-medium">
                        <span className="opacity-100 border-b-2 border-white pb-1">Dashboard</span>
                        <span className="opacity-70 hover:opacity-100 cursor-not-allowed">Maintenance</span>
                        <span className="opacity-70 hover:opacity-100 cursor-not-allowed">Equipment</span>
                    </nav>
                </div>

                <div className="flex items-center space-x-4">
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
                            <button className="px-4 py-2 bg-[#017E84] text-white rounded text-sm font-bold shadow-sm cursor-not-allowed">
                                NEW REQUEST
                            </button>
                        </div>
                    </div>

                    {/* Empty State / Placeholder */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded shadow-sm border-l-4 border-[#714B67]">
                            <div className="text-xs font-bold text-[#6c757d] uppercase tracking-wider mb-1">To Do</div>
                            <div className="text-3xl font-bold text-[#495057]">0</div>
                        </div>
                        <div className="bg-white p-6 rounded shadow-sm border-l-4 border-[#017E84]">
                            <div className="text-xs font-bold text-[#6c757d] uppercase tracking-wider mb-1">In Progress</div>
                            <div className="text-3xl font-bold text-[#495057]">0</div>
                        </div>
                        <div className="bg-white p-6 rounded shadow-sm border-l-4 border-yellow-500">
                            <div className="text-xs font-bold text-[#6c757d] uppercase tracking-wider mb-1">Pending</div>
                            <div className="text-3xl font-bold text-[#495057]">0</div>
                        </div>
                    </div>

                    <div className="bg-white rounded shadow-sm border border-[#dee2e6] overflow-hidden">
                        <div className="bg-[#f8f9fa] px-6 py-4 border-b border-[#dee2e6] flex justify-between items-center">
                            <span className="font-bold text-[#495057] text-sm uppercase tracking-wide">Recent Activities</span>
                            <span className="text-[#017E84] text-xs font-bold hover:underline cursor-pointer">View All</span>
                        </div>
                        <div className="p-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-[#f8f9fa] rounded-full flex items-center justify-center mb-4 text-[#dee2e6]">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h3 className="text-[#495057] font-bold mb-1">No maintenance requests yet</h3>
                            <p className="text-[#6c757d] text-sm max-w-xs">Start tracking your maintenance tasks by creating your first request.</p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="h-10 bg-white border-t border-[#dee2e6] flex items-center px-6 text-[10px] text-[#adb5bd] uppercase tracking-widest">
                GearGuard Maintenance v1.0 &copy; 2025
            </footer>
        </div>
    );
}
