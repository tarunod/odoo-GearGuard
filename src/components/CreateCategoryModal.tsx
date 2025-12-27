'use client';

import { useState, useEffect } from 'react';

interface User {
    id: number;
    username: string;
}

interface CategoryData {
    id?: number;
    name?: string;
    responsible_technician_id?: number | null;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: CategoryData | null;
}

export default function CreateCategoryModal({ isOpen, onClose, initialData }: Props) {
    const [employees, setEmployees] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        responsibleTechnicianId: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetch('/api/maintenance/metadata')
                .then(res => res.json())
                .then(data => {
                    setEmployees(data.users || []);
                });
        }
    }, [isOpen]);

    // Populate form when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                responsibleTechnicianId: initialData.responsible_technician_id?.toString() || ''
            });
        } else {
            setFormData({
                name: '',
                responsibleTechnicianId: ''
            });
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!formData.name) {
            alert('Please enter a category name.');
            return;
        }

        try {
            setLoading(true);
            const isEditing = initialData && initialData.id;
            const url = isEditing ? `/api/equipment/categories/${initialData.id}` : '/api/equipment/categories';
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
                throw new Error(result.error || `Failed to ${isEditing ? 'update' : 'create'} category`);
            }

            onClose();
        } catch (error: any) {
            console.error('Error saving category:', error);
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
            const response = await fetch(`/api/equipment/categories/${initialData.id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete category');
            }

            alert('Category deleted successfully');
            onClose();
        } catch (error: any) {
            console.error('Error deleting category:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white w-full max-w-2xl rounded shadow-2xl flex flex-col">

                <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4">
                    <div className="flex items-center space-x-2 text-sm">
                        <span className="text-[#714B67] font-bold">Equipment Categories</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-600 font-medium">{initialData ? 'Edit Category' : 'New Category'}</span>
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
                        <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Category Name *</label>
                        <input
                            type="text"
                            placeholder="e.g. HVAC, Electrical, Mechanical"
                            className="text-3xl font-bold text-[#495057] w-full border-b border-transparent focus:border-[#714B67] focus:outline-none placeholder:text-gray-200 py-1 text-black"
                            value={formData.name}
                            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        />
                    </div>

                    <div className="grid grid-cols-3 items-center">
                        <label className="text-sm font-bold text-[#495057]">Responsible Technician</label>
                        <select
                            className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 bg-white text-black"
                            value={formData.responsibleTechnicianId}
                            onChange={e => setFormData(p => ({ ...p, responsibleTechnicianId: e.target.value }))}
                        >
                            <option value="">Select Technician...</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.username}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
