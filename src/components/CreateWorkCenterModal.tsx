'use client';

import { useState, useEffect } from 'react';

interface WorkCenterData {
    id?: number;
    name?: string;
    code?: string;
    tag?: string | null;
    cost_per_hour?: number;
    capacity_time_efficiency?: number;
    oee_target?: number | null;
    is_active?: boolean;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: WorkCenterData | null;
}

export default function CreateWorkCenterModal({ isOpen, onClose, initialData }: Props) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        tag: '',
        costPerHour: '0',
        capacityTimeEfficiency: '100',
        oeeTarget: '',
        isActive: true
    });

    // Populate form when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                code: initialData.code || '',
                tag: initialData.tag || '',
                costPerHour: initialData.cost_per_hour?.toString() || '0',
                capacityTimeEfficiency: initialData.capacity_time_efficiency?.toString() || '100',
                oeeTarget: initialData.oee_target?.toString() || '',
                isActive: initialData.is_active !== undefined ? initialData.is_active : true
            });
        } else {
            setFormData({
                name: '',
                code: '',
                tag: '',
                costPerHour: '0',
                capacityTimeEfficiency: '100',
                oeeTarget: '',
                isActive: true
            });
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!formData.name || !formData.code) {
            alert('Please enter work center name and code.');
            return;
        }

        try {
            setLoading(true);
            const isEditing = initialData && initialData.id;
            const url = isEditing ? `/api/workcenters/${initialData.id}` : '/api/workcenters';
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
                throw new Error(result.error || `Failed to ${isEditing ? 'update' : 'create'} work center`);
            }

            onClose();
        } catch (error: any) {
            console.error('Error saving work center:', error);
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
            const response = await fetch(`/api/workcenters/${initialData.id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete work center');
            }

            alert('Work center deleted successfully');
            onClose();
        } catch (error: any) {
            console.error('Error deleting work center:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white w-full max-w-3xl rounded shadow-2xl flex flex-col">

                <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4">
                    <div className="flex items-center space-x-2 text-sm">
                        <span className="text-[#714B67] font-bold">Work Centers</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-600 font-medium">{initialData ? 'Edit Work Center' : 'New Work Center'}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="bg-[#f8f9fa] border-b border-gray-200 px-4 py-2 flex items-center space-x-2">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-1.5 bg-[#017E84] hover:bg-[#015f64] text-white text-xs font-bold rounded shadow-sm disabled:opacity-50"
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

                <div className="p-8">
                    <div className="mb-6">
                        <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Work Center Name *</label>
                        <input
                            type="text"
                            placeholder="e.g. Assembly Line 1"
                            className="text-3xl font-bold text-[#495057] w-full border-b border-transparent focus:border-[#714B67] focus:outline-none placeholder:text-gray-200 py-1 text-black"
                            value={formData.name}
                            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Code *</label>
                                <input
                                    type="text"
                                    className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 text-black"
                                    value={formData.code}
                                    onChange={e => setFormData(p => ({ ...p, code: e.target.value }))}
                                    placeholder="WC-001"
                                />
                            </div>

                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Tag</label>
                                <input
                                    type="text"
                                    className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 text-black"
                                    value={formData.tag}
                                    onChange={e => setFormData(p => ({ ...p, tag: e.target.value }))}
                                    placeholder="Production"
                                />
                            </div>

                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Cost/Hour ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 text-black"
                                    value={formData.costPerHour}
                                    onChange={e => setFormData(p => ({ ...p, costPerHour: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Capacity Efficiency (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 text-black"
                                    value={formData.capacityTimeEfficiency}
                                    onChange={e => setFormData(p => ({ ...p, capacityTimeEfficiency: e.target.value }))}
                                />
                            </div>

                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">OEE Target (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 text-black"
                                    value={formData.oeeTarget}
                                    onChange={e => setFormData(p => ({ ...p, oeeTarget: e.target.value }))}
                                    placeholder="Optional"
                                />
                            </div>

                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Status</label>
                                <div className="col-span-2 flex items-center space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, isActive: true }))}
                                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-colors ${formData.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                    >
                                        Active
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, isActive: false }))}
                                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-colors ${!formData.isActive ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                    >
                                        Inactive
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
