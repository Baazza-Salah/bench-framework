import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Edit2, Save, X, Search, Filter, Shield, Building2, Cloud, DollarSign, ArrowRight, PlayCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';

const SolutionManager = () => {
    const navigate = useNavigate();
    const [solutions, setSolutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');

    // Initial form state
    const initialForm = {
        name: '',
        vendor: '',
        version: '',
        deploymentModel: 'SaaS',
        methodType: 'SIEM',
        licenseInfo: ''
    };

    const [formData, setFormData] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchSolutions();
    }, []);

    const fetchSolutions = async () => {
        try {
            const res = await axios.get('/api/solutions');
            setSolutions(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleEdit = (s) => {
        setEditingId(s.id);
        setFormData({
            name: s.name || '',
            vendor: s.vendor || '',
            version: s.version || '',
            deploymentModel: s.deploymentModel || 'SaaS',
            methodType: s.methodType || 'SIEM',
            licenseInfo: s.licenseInfo || ''
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingId(null);
        setFormData(initialForm);
        setErrors({});
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData(initialForm);
        setErrors({});
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure? This will delete the solution and ALL associated scores.')) return;
        try {
            await axios.delete(`/api/solutions/${id}`);
            setSolutions(solutions.filter(s => s.id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
            alert('Failed to delete solution');
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name?.trim()) newErrors.name = 'Required';
        if (!formData.vendor?.trim()) newErrors.vendor = 'Required';
        if (!formData.version?.trim()) newErrors.version = 'Required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            if (editingId) {
                const res = await axios.put(`/api/solutions/${editingId}`, formData);
                setSolutions(solutions.map(s => s.id === editingId ? { ...res.data, id: editingId } : s));
            } else {
                const res = await axios.post('/api/solutions', formData);
                setSolutions([...solutions, res.data]);
            }
            handleCancel();
        } catch (err) {
            console.error("Save failed:", err);
            alert('Failed to save solution');
        } finally {
            setSubmitting(false);
        }
    };

    const uniqueTypes = ['All', ...new Set(solutions.map(s => s.methodType).filter(Boolean))];

    const filteredSolutions = solutions.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.vendor.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'All' || s.methodType === typeFilter;
        return matchesSearch && matchesType;
    });

    if (loading && !isModalOpen) return <div className="p-20 text-center animate-pulse text-muted-foreground">Loading Solutions...</div>;

    return (
        <div className="max-w-[1400px] mx-auto pb-20 fade-in animate-in duration-500 relative">
            {/* Header */}
            <div className="flex justify-between items-end mb-8 border-b border-border pb-6">
                <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                        <Shield className="text-primary" />
                        Solution Manager
                    </h1>
                    <p className="text-muted-foreground">Manage SOC solutions, vendors, and configurations.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <Badge variant="outline" className="font-mono text-xs">
                        {solutions.length} Solutions
                    </Badge>
                    <Button onClick={handleAddNew} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" /> Add Solution
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4 mb-6 bg-card p-4 rounded-xl border border-border items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search solutions..."
                        className="pl-9 bg-background"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-muted-foreground h-4 w-4" />
                    <select
                        className="bg-background border border-input rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                    >
                        {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            {/* Table View */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                        <tr>
                            <th className="px-6 py-4">Name & Vendor</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Deployment</th>
                            <th className="px-6 py-4 text-center">Version</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredSolutions.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                                    No solutions found. Add one to get started!
                                </td>
                            </tr>
                        ) : (
                            filteredSolutions.map(s => (
                                <tr key={s.id} className="hover:bg-secondary/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-foreground text-base">{s.name}</div>
                                        <div className="text-muted-foreground text-xs flex items-center gap-1">
                                            <Building2 size={10} /> {s.vendor}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="secondary" className="font-medium">
                                            {s.methodType}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Cloud size={12} /> {s.deploymentModel}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono text-xs text-muted-foreground">
                                        {s.version}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/assess/${s.id}`)}
                                                className="h-8 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900"
                                            >
                                                <PlayCircle size={14} className="mr-1" /> Assess
                                            </Button>
                                            <div className="w-px h-8 bg-border mx-1"></div>
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(s)} className="h-8 w-8 hover:text-primary opacity-50 group-hover:opacity-100 transition-opacity">
                                                <Edit2 size={16} />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="h-8 w-8 hover:text-destructive opacity-50 group-hover:opacity-100 transition-opacity">
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 border-none ring-1 ring-border">
                        <CardContent className="p-0">
                            <div className="p-6 border-b border-border flex justify-between items-center bg-card sticky top-0 z-10">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    {editingId ? <Edit2 size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
                                    {editingId ? 'Edit Solution' : 'Add New Solution'}
                                </h2>
                                <Button variant="ghost" size="icon" onClick={handleCancel}>
                                    <X size={20} />
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                                                Solution Name <span className="text-destructive">*</span>
                                            </label>
                                            <Input
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className={errors.name ? 'border-destructive' : ''}
                                                placeholder="e.g. Microsoft Sentinel"
                                                autoFocus
                                            />
                                            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                                                Vendor <span className="text-destructive">*</span>
                                            </label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-2.5 text-muted-foreground h-4 w-4" />
                                                <Input
                                                    value={formData.vendor}
                                                    onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                                                    className={`pl-9 ${errors.vendor ? 'border-destructive' : ''}`}
                                                    placeholder="e.g. Microsoft"
                                                />
                                            </div>
                                            {errors.vendor && <p className="text-destructive text-xs mt-1">{errors.vendor}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                                                Version <span className="text-destructive">*</span>
                                            </label>
                                            <Input
                                                value={formData.version}
                                                onChange={e => setFormData({ ...formData, version: e.target.value })}
                                                className={errors.version ? 'border-destructive' : ''}
                                                placeholder="e.g. 2024.1"
                                            />
                                            {errors.version && <p className="text-destructive text-xs mt-1">{errors.version}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-border my-4" />

                                {/* Deployment Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                                            Deployment Model
                                        </label>
                                        <div className="relative">
                                            <Cloud className="absolute left-3 top-2.5 text-muted-foreground h-4 w-4" />
                                            <select
                                                className="w-full bg-background border border-input rounded-md pl-9 pr-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                                value={formData.deploymentModel}
                                                onChange={e => setFormData({ ...formData, deploymentModel: e.target.value })}
                                            >
                                                <option value="SaaS">SaaS (Cloud)</option>
                                                <option value="On-Premise">On-Premise</option>
                                                <option value="Hybrid">Hybrid</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                                            Solution Type
                                        </label>
                                        <select
                                            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                            value={formData.methodType}
                                            onChange={e => setFormData({ ...formData, methodType: e.target.value })}
                                        >
                                            <option value="SIEM">SIEM</option>
                                            <option value="SIEM/SOAR">SIEM/SOAR</option>
                                            <option value="SOC Platform">SOC Platform</option>
                                            <option value="XDR">XDR</option>
                                            <option value="Log Management">Log Management</option>
                                            <option value="CNAPP">CNAPP</option>
                                        </select>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                                            Licensing Model
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-2.5 text-muted-foreground h-4 w-4" />
                                            <select
                                                className="w-full bg-background border border-input rounded-md pl-9 pr-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                                value={formData.licenseInfo}
                                                onChange={e => setFormData({ ...formData, licenseInfo: e.target.value })}
                                            >
                                                <option value="">Select licensing model...</option>
                                                <option value="Consumption">Consumption-based</option>
                                                <option value="Endpoint-based">Per-Endpoint</option>
                                                <option value="EPS-based">Events Per Second (EPS)</option>
                                                <option value="Ingest-based">Data Ingest-based</option>
                                                <option value="Employee-count">Per-Employee</option>
                                                <option value="User-based">Per-User</option>
                                                <option value="Perpetual">Perpetual License</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-border bg-card sticky bottom-0">
                                    <Button type="button" variant="outline" onClick={handleCancel} className="flex-1" disabled={submitting}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" disabled={submitting}>
                                        {submitting ? 'Saving...' : <><Save size={16} className="mr-2" /> Save Solution</>}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default SolutionManager;
