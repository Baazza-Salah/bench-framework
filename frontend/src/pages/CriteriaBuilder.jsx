import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, Save, X, Settings, Search, Filter, AlertCircle, ChevronRight } from 'lucide-react'; // Added ChevronRight
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';

const CriteriaBuilder = () => {
    const [criteria, setCriteria] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false); // Added state
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Initial form state
    const initialForm = {
        name: '',
        category: 'General',
        weight: 3,
        description: '',
        rubric: {
            "1": "Ad-hoc / Non-existent capability.",
            "2": "Reactive / Manual processes.",
            "3": "Defined / Standard process.",
            "4": "Managed / Metrics monitored.",
            "5": "Optimized / Automated & Proactive."
        }
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        fetchCriteria();
    }, []);

    const fetchCriteria = async () => {
        try {
            const res = await axios.get('/api/criteria');
            setCriteria(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (c) => {
        setEditingId(c.id);
        setFormData({
            ...c,
            rubric: c.rubric || initialForm.rubric
        });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingId(null);
        setFormData(initialForm);
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData(initialForm);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure? This will affect scoring for all solutions.')) return;
        try {
            await axios.delete(`/api/criteria/${id}`);
            setCriteria(criteria.filter(c => c.id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
            alert(`Failed to delete: ${err.response?.data?.error || err.message}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Ensure weight is a number
            const submissionData = {
                ...formData,
                weight: Number(formData.weight)
            };

            if (editingId) {
                const res = await axios.put(`/api/criteria/${editingId}`, submissionData);
                setCriteria(criteria.map(c => c.id === editingId ? res.data : c));
            } else {
                const res = await axios.post('/api/criteria', submissionData);
                setCriteria([...criteria, res.data]);
            }
            handleCancel();
        } catch (err) {
            console.error("Save failed:", err);
            alert(`Failed to save: ${err.response?.data?.error || err.message}`);
        }
    };

    const updateRubricLevel = (level, text) => {
        setFormData(prev => ({
            ...prev,
            rubric: {
                ...prev.rubric,
                [level]: text
            }
        }));
    };

    const categories = ['All', ...new Set(criteria.map(c => c.category))];

    const filteredCriteria = criteria.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    if (loading) return <div className="p-20 text-center animate-pulse text-muted-foreground">Loading Configuration...</div>;

    return (
        <div className="max-w-[1400px] mx-auto pb-20 fade-in animate-in duration-500 relative">
            {/* Header */}
            <div className="flex justify-between items-end mb-8 border-b border-border pb-6">
                <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                        <Settings className="text-primary" />
                        Criteria Manager
                    </h1>
                    <p className="text-muted-foreground">Manage assessment criteria, weights, and scoring rubrics.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <Badge variant="outline" className="font-mono text-xs">
                        {criteria.length} Items
                    </Badge>
                    <Button onClick={handleAddNew} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" /> Add Criterion
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4 mb-6 bg-card p-4 rounded-xl border border-border items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search criteria..."
                        className="pl-9 bg-background"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-muted-foreground h-4 w-4" />
                    <select
                        className="bg-background border border-input rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Table View */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                        <tr>
                            <th className="px-6 py-4">Name & Description</th>
                            <th className="px-6 py-4 w-[150px]">Category</th>
                            <th className="px-6 py-4 w-[100px] text-center">Weight</th>
                            <th className="px-6 py-4 w-[120px] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredCriteria.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-muted-foreground">
                                    No criteria found matching your filters.
                                </td>
                            </tr>
                        ) : (
                            filteredCriteria.map(c => (
                                <tr key={c.id} className="hover:bg-secondary/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-foreground text-base mb-1">{c.name}</div>
                                        <div className="text-muted-foreground text-xs line-clamp-2 max-w-2xl">{c.description}</div>
                                        {/* Optional Rubric Preview on Hover */}
                                        <div className="hidden group-hover:block mt-2 p-2 bg-secondary/30 rounded border border-border text-xs text-muted-foreground">
                                            <span className="font-bold">Rubric Preview:</span> {c.rubric["5"]?.substring(0, 60)}...
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="secondary" className="font-medium">
                                            {c.category}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className={`
                                            inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs
                                            ${c.weight >= 4 ? 'bg-emerald-100 text-emerald-700' :
                                                c.weight === 3 ? 'bg-blue-100 text-blue-700' :
                                                    'bg-orange-100 text-orange-700'
                                            }
                                        `}>
                                            {c.weight}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(c)} className="h-8 w-8 hover:text-primary">
                                                <Edit2 size={16} />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="h-8 w-8 hover:text-destructive">
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
                                    {editingId ? 'Edit Criterion' : 'Add New Criterion'}
                                </h2>
                                <Button variant="ghost" size="icon" onClick={handleCancel}>
                                    <X size={20} />
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-muted-foreground uppercase mb-1">Name</label>
                                        <Input
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            placeholder="e.g. Multi-Factor Authentication"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="col-span-1 relative group">
                                        <label className="block text-sm font-bold text-muted-foreground uppercase mb-1">Category</label>
                                        <div className="relative">
                                            <Input
                                                value={formData.category}
                                                onChange={e => {
                                                    setFormData({ ...formData, category: e.target.value });
                                                    setCategoryFilter(e.target.value); // Just to force open/keep open if I use filter
                                                }}
                                                onFocus={() => setIsCategoryDropdownOpen(true)}
                                                // Small delay on blur to allow option click to register
                                                onBlur={() => setTimeout(() => setIsCategoryDropdownOpen(false), 200)}
                                                required
                                                placeholder="Select or type new..."
                                                className="pr-10"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                <ChevronRight size={16} className={`transition-transform ${isCategoryDropdownOpen ? 'rotate-90' : ''}`} />
                                            </div>

                                            {isCategoryDropdownOpen && (
                                                <div className="absolute top-full left-0 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-48 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100">
                                                    {categories.filter(c => c !== 'All').length === 0 ? (
                                                        <div className="px-3 py-2 text-sm text-muted-foreground italic">No existing categories</div>
                                                    ) : (
                                                        categories
                                                            .filter(c => c !== 'All' && c.toLowerCase().includes(formData.category.toLowerCase()))
                                                            .map(c => (
                                                                <button
                                                                    key={c}
                                                                    type="button"
                                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                                                    onClick={() => {
                                                                        setFormData({ ...formData, category: c });
                                                                        setIsCategoryDropdownOpen(false);
                                                                    }}
                                                                >
                                                                    {c}
                                                                </button>
                                                            ))
                                                    )}
                                                    {formData.category && !categories.includes(formData.category) && (
                                                        <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border bg-secondary/20">
                                                            Creating new category: <span className="font-bold text-foreground">{formData.category}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-bold text-muted-foreground uppercase mb-1">Weight (1-5)</label>
                                        <Input
                                            type="number" min="1" max="5"
                                            value={formData.weight}
                                            onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-muted-foreground uppercase mb-1">Description</label>
                                    <textarea
                                        className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary outline-none h-24 text-sm resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description of what is being evaluated..."
                                    />
                                </div>

                                {/* Rubric Editor */}
                                <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                                    <div className="flex items-center gap-2 mb-4">
                                        <AlertCircle size={16} className="text-primary" />
                                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">Scoring Rubric Definition</span>
                                    </div>
                                    <div className="space-y-3">
                                        {[1, 2, 3, 4, 5].map(level => (
                                            <div key={level} className="flex gap-3 items-center group">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${level >= 4 ? 'bg-emerald-100 text-emerald-600' :
                                                    level === 3 ? 'bg-blue-100 text-blue-600' :
                                                        'bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                                                    }`}>
                                                    {level}
                                                </div>
                                                <Input
                                                    className="flex-1 text-sm bg-transparent border-transparent hover:border-input focus:border-primary px-0 border-b rounded-none focus:ring-0"
                                                    value={formData.rubric[level] || ''}
                                                    onChange={e => updateRubricLevel(level, e.target.value)}
                                                    placeholder={`Define specific criteria for Level ${level}...`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-border bg-card sticky bottom-0">
                                    <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                                        <Save size={16} className="mr-2" /> Save Criterion
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

export default CriteriaBuilder;
