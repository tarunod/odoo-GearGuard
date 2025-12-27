'use client';

import { useState, useEffect } from 'react';

interface Team {
    id: number;
    name: string;
    team_leader_id: number;
    team_leader_name: string;
}

interface User {
    id: number;
    username: string;
}

interface Category {
    id: number;
    name: string;
}

interface WorkCenter {
    id: number;
    name: string;
}

interface EquipmentData {
    id?: number;
    name?: string;
    serial_number?: string;
    equipment_category_id?: number;
    used_by_type?: 'employee' | 'department';
    used_by_employee_id?: number;
    maintenance_team_id?: number;
    default_technician_id?: number;
    employee_id?: number;
    assigned_date?: string | null;
    description?: string | null;
    purchase_date?: string | null;
    warranty_end_date?: string | null;
    location?: string | null;
    work_center_id?: number;
    is_scrapped?: boolean;
    scrap_date?: string | null;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: EquipmentData | null;
}

export default function CreateEquipmentModal({ isOpen, onClose, initialData }: Props) {
    const [teams, setTeams] = useState<Team[]>([]);
    const [employees, setEmployees] = useState<User[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        serialNumber: '',
        equipmentCategoryId: '',
        usedByType: 'employee' as 'employee' | 'department',
        usedByEmployeeId: '',
        maintenanceTeamId: '',
        defaultTechnicianId: '',
        employeeId: '',
        assignedDate: '',
        description: '',
        purchaseDate: '',
        warrantyEndDate: '',
        location: '',
        workCenterId: '',
        isScrapped: false,
        scrapDate: ''
    });

    useEffect(() => {
        if (isOpen) {
            // Fetch all metadata
            Promise.all([
                fetch('/api/maintenance/metadata').then(res => res.json()),
                fetch('/api/equipment/categories').then(res => res.json())
            ]).then(([metaData, catData]) => {
                setTeams(metaData.teams || []);
                setEmployees(metaData.users || []);
                setWorkCenters(metaData.workCenters || []);
                setCategories(catData.categories || []);

                // Set default team and technician
                if (metaData.teams?.length > 0) {
                    const defaultTeam = metaData.teams[0];
                    setFormData(prev => ({
                        ...prev,
                        maintenanceTeamId: defaultTeam.id.toString(),
                        defaultTechnicianId: defaultTeam.team_leader_id?.toString() || ''
                    }));
                }
            });
        }
    }, [isOpen]);

    // Populate form when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                serialNumber: initialData.serial_number || '',
                equipmentCategoryId: initialData.equipment_category_id?.toString() || '',
                usedByType: initialData.used_by_type || 'employee',
                usedByEmployeeId: initialData.used_by_employee_id?.toString() || '',
                maintenanceTeamId: initialData.maintenance_team_id?.toString() || '',
                defaultTechnicianId: initialData.default_technician_id?.toString() || '',
                employeeId: initialData.employee_id?.toString() || '',
                assignedDate: initialData.assigned_date || '',
                description: initialData.description || '',
                purchaseDate: initialData.purchase_date || '',
                warrantyEndDate: initialData.warranty_end_date || '',
                location: initialData.location || '',
                workCenterId: initialData.work_center_id?.toString() || '',
                isScrapped: initialData.is_scrapped || false,
                scrapDate: initialData.scrap_date || ''
            });
        } else {
            // Reset form for new equipment
            setFormData({
                name: '',
                serialNumber: '',
                equipmentCategoryId: '',
                usedByType: 'employee',
                usedByEmployeeId: '',
                maintenanceTeamId: '',
                defaultTechnicianId: '',
                employeeId: '',
                assignedDate: '',
                description: '',
                purchaseDate: '',
                warrantyEndDate: '',
                location: '',
                workCenterId: '',
                isScrapped: false,
                scrapDate: ''
            });
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!formData.name || !formData.serialNumber || !formData.maintenanceTeamId || !formData.defaultTechnicianId) {
            alert('Please fill in all required fields: Name, Serial Number, Maintenance Team, and Default Technician.');
            return;
        }

        try {
            setLoading(true);
            const isEditing = initialData && initialData.id;
            const url = isEditing ? `/api/equipment/${initialData.id}` : '/api/equipment/create';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Failed to ${isEditing ? 'update' : 'create'} equipment`);
            }

            onClose();
        } catch (error: any) {
            console.error('Error saving equipment:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData || !initialData.id) {
            return;
        }

        const confirmDelete = window.confirm(
            `Are you sure you want to delete "${formData.name}"? This action cannot be undone.`
        );

        if (!confirmDelete) {
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/api/equipment/${initialData.id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete equipment');
            }

            alert('Equipment deleted successfully');
            onClose();
        } catch (error: any) {
            console.error('Error deleting equipment:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center space-x-2 text-sm">
                        <span className="text-[#714B67] font-bold cursor-pointer hover:underline">Equipment</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-600 font-medium">{initialData ? 'Edit Equipment' : 'New Equipment'}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="bg-[#f8f9fa] border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-4 py-1.5 bg-[#017E84] hover:bg-[#015f64] text-white text-xs font-bold rounded shadow-sm border border-[#017E84] disabled:opacity-50"
                        >
                            {loading ? (initialData ? 'UPDATING...' : 'SAVING...') : (initialData ? 'UPDATE' : 'SAVE')}
                        </button>
                        <button onClick={onClose} className="px-4 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded shadow-sm border border-gray-300">DISCARD</button>
                        {initialData && initialData.id && (
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shadow-sm border border-red-600 disabled:opacity-50"
                            >
                                DELETE
                            </button>
                        )}
                    </div>

                </div>

                {/* Form Body */}
                <div className="p-8 bg-white overflow-y-auto max-h-[70vh]">
                    <div className="mb-8">
                        <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Equipment Name *</label>
                        <input
                            type="text"
                            placeholder="e.g. Main AHU-01"
                            className="text-3xl font-bold text-[#495057] w-full border-b border-transparent focus:border-[#714B67] focus:outline-none placeholder:text-gray-200 py-1 transition-all text-black"
                            value={formData.name}
                            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Serial Number *</label>
                                <input
                                    type="text"
                                    className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 text-black"
                                    value={formData.serialNumber}
                                    onChange={e => setFormData(p => ({ ...p, serialNumber: e.target.value }))}
                                    placeholder="SN-XXX-001"
                                />
                            </div>

                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Category</label>
                                <select
                                    className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 bg-white text-black"
                                    value={formData.equipmentCategoryId}
                                    onChange={e => setFormData(p => ({ ...p, equipmentCategoryId: e.target.value }))}
                                >
                                    <option value="">Select Category...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Used By</label>
                                <select
                                    className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 bg-white text-black"
                                    value={formData.usedByType}
                                    onChange={e => setFormData(p => ({ ...p, usedByType: e.target.value as 'employee' | 'department' }))}
                                >
                                    <option value="employee">Employee</option>
                                    <option value="department">Department</option>
                                </select>
                            </div>

                            {formData.usedByType === 'employee' && (
                                <div className="grid grid-cols-3 items-center">
                                    <label className="text-sm font-bold text-[#495057]">Used By Employee</label>
                                    <select
                                        className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 bg-white text-black"
                                        value={formData.usedByEmployeeId}
                                        onChange={e => setFormData(p => ({ ...p, usedByEmployeeId: e.target.value }))}
                                    >
                                        <option value="">Select Employee...</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.username}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Location</label>
                                <input
                                    type="text"
                                    className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 text-black"
                                    value={formData.location}
                                    onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                                    placeholder="e.g. Roof Block A"
                                />
                            </div>

                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Work Center</label>
                                <select
                                    className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 bg-white text-black"
                                    value={formData.workCenterId}
                                    onChange={e => setFormData(p => ({ ...p, workCenterId: e.target.value }))}
                                >
                                    <option value="">Select Work Center...</option>
                                    {workCenters.map(wc => (
                                        <option key={wc.id} value={wc.id}>{wc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Purchase Date</label>
                                <input
                                    type="date"
                                    className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 text-black"
                                    value={formData.purchaseDate}
                                    onChange={e => setFormData(p => ({ ...p, purchaseDate: e.target.value }))}
                                />
                            </div>

                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Warranty End</label>
                                <input
                                    type="date"
                                    className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 text-black"
                                    value={formData.warrantyEndDate}
                                    onChange={e => setFormData(p => ({ ...p, warrantyEndDate: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">

                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Maintenance Team *</label>
                                <select
                                    className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 bg-white text-black"
                                    value={formData.maintenanceTeamId}
                                    onChange={e => {
                                        const tId = e.target.value;
                                        const selectedTeam = teams.find(t => t.id.toString() === tId);
                                        setFormData(p => ({
                                            ...p,
                                            maintenanceTeamId: tId,
                                            defaultTechnicianId: selectedTeam?.team_leader_id?.toString() || p.defaultTechnicianId
                                        }));
                                    }}
                                >
                                    <option value="">Select Team...</option>
                                    {teams.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Default Technician *</label>
                                <select
                                    className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 bg-white text-black"
                                    value={formData.defaultTechnicianId}
                                    onChange={e => setFormData(p => ({ ...p, defaultTechnicianId: e.target.value }))}
                                >
                                    <option value="">Select Technician...</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.username}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-3 items-start">
                                <label className="text-sm font-bold text-[#495057] pt-1">Description</label>
                                <textarea
                                    className="col-span-2 text-sm border border-gray-200 focus:border-[#714B67] focus:outline-none py-1 px-2 rounded text-black"
                                    value={formData.description}
                                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Equipment description..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
