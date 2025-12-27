'use client';

import { useState, useEffect } from 'react';

interface Equipment {
    id: number;
    name: string;
    category_name: string;
    maintenance_team_id: number;
}

interface Team {
    id: number;
    name: string;
    team_leader_id: number;
    team_leader_name: string;
}

interface WorkCenter {
    id: number;
    name: string;
}

interface User {
    id: number;
    username: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    user: { username: string; id: number } | null;
    initialData?: any;
}

export default function MaintenanceRequestModal({ isOpen, onClose, user, initialData }: Props) {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
    const [employees, setEmployees] = useState<User[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        id: '',
        subject: '',
        maintenanceFor: 'Equipment',
        equipmentId: '',
        workCenterId: '',
        category: '',
        teamId: '',
        technicianId: '',
        technicianName: '',
        requestedById: user?.id || '',
        responsibleId: user?.id || '',
        scheduledDate: '',
        duration: '0',
        priority: 1,
        maintenanceType: 'corrective',
        description: '',
        stage: 'new',
    });

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetch('/api/maintenance/metadata')
                .then(res => res.json())
                .then(data => {
                    const fetchedEquipment = data.equipment || [];
                    const fetchedWorkCenters = data.workCenters || [];
                    const fetchedEmployees = data.users || [];
                    const fetchedTeams = data.teams || [];

                    setEquipment(fetchedEquipment);
                    setWorkCenters(fetchedWorkCenters);
                    setEmployees(fetchedEmployees);
                    setTeams(fetchedTeams);

                    if (initialData) {
                        // Populate form from existing data
                        setFormData({
                            id: initialData.id?.toString() || '',
                            subject: initialData.subject || '',
                            maintenanceFor: initialData.maintenance_for || 'Equipment',
                            equipmentId: initialData.equipment_id?.toString() || '',
                            workCenterId: initialData.work_center_id?.toString() || '',
                            category: initialData.category || '',
                            teamId: initialData.maintenance_team_id?.toString() || '',
                            technicianId: initialData.technician_id?.toString() || '',
                            technicianName: initialData.technician_name || '',
                            requestedById: initialData.requested_by_id?.toString() || '',
                            responsibleId: initialData.technician_id?.toString() || '',
                            scheduledDate: initialData.scheduled_date ? new Date(initialData.scheduled_date).toISOString().split('T')[0] : '',
                            duration: initialData.duration_hours?.toString() || '00:00',
                            priority: initialData.priority || 0,
                            maintenanceType: initialData.maintenance_type || 'corrective',
                            description: initialData.description || '',
                            stage: initialData.stage || 'new',
                        });
                    } else if (fetchedTeams.length > 0) {
                        const defaultTeam = fetchedTeams[0];
                        setFormData(prev => ({
                            ...prev,
                            id: '',
                            subject: '',
                            maintenanceFor: 'Equipment',
                            equipmentId: '',
                            workCenterId: '',
                            category: '',
                            teamId: defaultTeam.id.toString(),
                            technicianId: defaultTeam.team_leader_id?.toString() || '',
                            technicianName: defaultTeam.team_leader_name || '',
                            requestedById: user?.id?.toString() || '',
                            scheduledDate: '',
                            duration: '00:00',
                            priority: 1,
                            maintenanceType: 'corrective',
                            description: '',
                            stage: 'new',
                        }));
                    }
                    setLoading(false);
                });
        }
    }, [isOpen, initialData, user]);

    if (!isOpen) return null;

    const handleSave = async (overrideData?: any) => {
        const actualData = overrideData || formData;
        const targetId = actualData.maintenanceFor === 'Work Center' ? actualData.workCenterId : actualData.equipmentId;
        const targetLabel = actualData.maintenanceFor === 'Work Center' ? 'Work Center' : 'Equipment';

        console.log('Attempting to save with data:', actualData);
        console.log('Full formData object:', {
            subject: actualData.subject,
            equipmentId: actualData.equipmentId,
            workCenterId: actualData.workCenterId,
            teamId: actualData.teamId,
            priority: actualData.priority,
            maintenanceFor: actualData.maintenanceFor
        });
        console.log('Validation check:', {
            subject: actualData.subject,
            targetId: targetId,
            teamId: actualData.teamId,
            priority: actualData.priority
        });

        if (!actualData.subject || (!targetId && actualData.maintenanceFor !== 'None') || !actualData.teamId) {
            const missingFields = [];
            if (!actualData.subject) missingFields.push('Subject');
            if (!targetId && actualData.maintenanceFor !== 'None') missingFields.push(targetLabel);
            if (!actualData.teamId) missingFields.push('Team');

            if (!overrideData) {
                alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
            }
            console.log('Validation failed. Missing:', missingFields);
            return;
        }

        if (!actualData.priority || actualData.priority === 0) {
            if (!overrideData) {
                alert('Please select a priority (1-3 stars)');
            }
            console.log('Priority not set');
            return;
        }

        try {
            setLoading(true);
            const url = actualData.id ? `/api/maintenance/request/${actualData.id}` : '/api/maintenance/request';
            const method = actualData.id ? 'PUT' : 'POST';

            console.log('Sending request to:', url, 'with method:', method);

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(actualData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to save maintenance request');
            }

            console.log('Request saved successfully:', result);
            alert('Maintenance request saved successfully!');
            onClose();
            // Optional: You might want to refresh the parent list here if exists
        } catch (error: any) {
            console.error('Error saving maintenance request:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-5xl rounded shadow-2xl flex flex-col min-h-[80vh] animate-in fade-in zoom-in duration-200">

                {/* Odoo-style Top Bar */}
                <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center space-x-2 text-sm">
                        <span className="text-[#714B67] font-bold cursor-pointer hover:underline">Maintenance Requests</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-600 font-medium">{formData.id ? 'Edit Request' : 'New'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                </div>

                {/* Action Buttons & Status bar */}
                <div className="bg-[#f8f9fa] border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handleSave()}
                            disabled={loading}
                            className="px-4 py-1.5 bg-[#017E84] hover:bg-[#015f64] text-white text-xs font-bold rounded shadow-sm border border-[#017E84] disabled:opacity-50"
                        >
                            {loading ? 'SAVING...' : (formData.id ? 'UPDATE' : 'SAVE')}
                        </button>
                        <button onClick={onClose} className="px-4 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded shadow-sm border border-gray-300">DISCARD</button>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex items-center space-x-0 overflow-hidden rounded border border-gray-300">
                        {['new', 'in_progress', 'repaired', 'scrap'].map((stage, i) => (
                            <button
                                key={stage}
                                type="button"
                                onClick={() => {
                                    setFormData(p => ({ ...p, stage }));
                                    if (formData.id) {
                                        handleSave({ ...formData, stage });
                                    }
                                }}
                                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider relative flex items-center transition-colors
                  ${formData.stage === stage ? 'bg-[#e0f3f3] text-[#017E84]' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                            >
                                {stage.replace('_', ' ')}
                                {i < 3 && (
                                    <div className={`absolute -right-[8px] z-10 w-4 h-4 border-r border-t border-gray-300 transform rotate-45 translate-y-[-0%] 
                                        ${formData.stage === stage ? 'bg-[#e0f3f3]' : 'bg-white'}`}></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form Body */}
                <div className="flex-grow p-8 bg-white overflow-y-auto">
                    {/* Large Subject/Title */}
                    <div className="mb-8">
                        <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Request</label>
                        <input
                            type="text"
                            placeholder="e.g. Drill not working"
                            className="text-3xl font-bold text-[#495057] w-full border-b border-transparent focus:border-[#714B67] focus:outline-none placeholder:text-gray-200 py-1 transition-all"
                            value={formData.subject}
                            onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Requested By</label>
                                <select
                                    className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 bg-white text-black"
                                    value={formData.requestedById}
                                    onChange={e => setFormData(p => ({ ...p, requestedById: e.target.value }))}
                                >
                                    <option value="">Select Employee...</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.username}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">For</label>
                                <select
                                    className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 bg-white text-black"
                                    value={formData.maintenanceFor}
                                    onChange={e => setFormData(p => ({ ...p, maintenanceFor: e.target.value, equipmentId: '', workCenterId: '' }))}
                                >
                                    <option value="Equipment">Equipment</option>
                                    <option value="Work Center">Work Center</option>
                                </select>
                            </div>

                            {formData.maintenanceFor === 'Equipment' ? (
                                <div className="grid grid-cols-3 items-center">
                                    <label className="text-sm font-bold text-[#495057]">Equipment</label>
                                    <select
                                        className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 bg-white text-black"
                                        value={formData.equipmentId}
                                        onChange={e => {
                                            const eqId = e.target.value;
                                            const selectedEq = equipment.find(eq => eq.id.toString() === eqId);
                                            const team = teams.find(t => t.id === selectedEq?.maintenance_team_id);
                                            setFormData(p => ({
                                                ...p,
                                                equipmentId: eqId,
                                                category: selectedEq?.category_name || '',
                                                teamId: selectedEq?.maintenance_team_id?.toString() || p.teamId,
                                                technicianId: team?.team_leader_id?.toString() || p.technicianId,
                                                technicianName: team?.team_leader_name || p.technicianName
                                            }));
                                        }}
                                    >
                                        <option value="">Select Equipment...</option>
                                        {equipment.map(eq => (
                                            <option key={eq.id} value={eq.id}>{eq.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
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
                            )}

                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Category</label>
                                <input
                                    type="text"
                                    readOnly
                                    className="col-span-2 text-sm border-b border-gray-200 focus:outline-none py-1 bg-gray-50 text-gray-500 cursor-not-allowed"
                                    value={formData.category}
                                    placeholder="Auto-filled from selection..."
                                />
                            </div>

                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Request Date</label>
                                <span className="col-span-2 text-sm text-gray-600">{new Date().toLocaleDateString()}</span>
                            </div>

                            <div className="grid grid-cols-3 items-start pt-2">
                                <label className="text-sm font-bold text-[#495057]">Maintenance Type</label>
                                <div className="col-span-2 space-y-2">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="mtype"
                                            checked={formData.maintenanceType === 'corrective'}
                                            onChange={() => setFormData(p => ({ ...p, maintenanceType: 'corrective' }))}
                                            className="w-4 h-4 text-[#017E84] focus:ring-[#017E84]"
                                        />
                                        <span className="text-sm text-gray-600">Corrective</span>
                                    </label>
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="mtype"
                                            checked={formData.maintenanceType === 'preventive'}
                                            onChange={() => setFormData(p => ({ ...p, maintenanceType: 'preventive' }))}
                                            className="w-4 h-4 text-[#017E84] focus:ring-[#017E84]"
                                        />
                                        <span className="text-sm text-gray-600">Preventive</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Team</label>
                                <select
                                    className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 bg-white text-black"
                                    value={formData.teamId}
                                    onChange={e => {
                                        const tId = e.target.value;
                                        const selectedTeam = teams.find(t => t.id.toString() === tId);
                                        setFormData(p => ({
                                            ...p,
                                            teamId: tId,
                                            technicianId: selectedTeam?.team_leader_id?.toString() || '',
                                            technicianName: selectedTeam?.team_leader_name || ''
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
                                <label className="text-sm font-bold text-[#495057]">Responsible</label>
                                <span className="col-span-2 text-sm text-gray-600">{formData.technicianName || user?.username || 'Admin'}</span>
                            </div>

                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Scheduled Date</label>
                                <input
                                    type="date"
                                    className="col-span-2 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 bg-transparent text-black"
                                    value={formData.scheduledDate}
                                    onChange={e => setFormData(p => ({ ...p, scheduledDate: e.target.value }))}
                                />
                            </div>

                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Duration</label>
                                <div className="col-span-2 flex items-center space-x-2">
                                    <input
                                        type="text"
                                        className="w-16 text-sm border-b border-gray-200 focus:border-[#714B67] focus:outline-none py-1 bg-transparent text-black"
                                        value={formData.duration}
                                        onChange={e => setFormData(p => ({ ...p, duration: e.target.value }))}
                                    />
                                    <span className="text-sm text-gray-500">hours</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Priority</label>
                                <div className="col-span-2 flex items-center space-x-1">
                                    {[1, 2, 3].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setFormData(p => ({ ...p, priority: star }))}
                                            className="focus:outline-none"
                                        >
                                            <svg
                                                className={`w-5 h-5 ${formData.priority >= star ? 'text-[#714B67] fill-current' : 'text-gray-300'}`}
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 items-center">
                                <label className="text-sm font-bold text-[#495057]">Company</label>
                                <span className="col-span-2 text-sm text-gray-400">Demo Company</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="mt-12">
                        <div className="border-b border-gray-200 pb-2">
                            <span className="text-sm font-bold text-[#495057]">Notes</span>
                        </div>
                        <div className="py-4">
                            <textarea
                                className="w-full h-32 text-sm text-black border-transparent focus:outline-none focus:ring-0 resize-none transition-all placeholder:text-gray-300"
                                placeholder="Internal notes..."
                                value={formData.description}
                                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
