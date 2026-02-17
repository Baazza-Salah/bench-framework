import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, Save, X, Settings, ChevronRight, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const CriteriaBuilder = () => {
    const [criteria, setCriteria] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState({});

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

    const toggleCategory = (cat) => {
        setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const handleEdit = (c) => {
        setEditingId(c.id);
        setFormData({
            ...c,
            rubric: c.rubric || initialForm.rubric
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData(initialForm);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure? This will affect scoring for all solutions.')) return;
        try {
            await axios.delete(`/api/criteria/${id}`);
            setCriteria(criteria.filter(c => c.id !== id));
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/api/criteria/${editingId}`, formData);
                setCriteria(criteria.map(c => c.id === editingId ? { ...formData, id: editingId } : c));
            } else {
                const res = await axios.post('/api/criteria', formData);
                setCriteria([...criteria, res.data]);
            }
            handleCancel();
        } catch (err) {
            alert('Failed to save');
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

    const categories = [...new Set(criteria.map(c => c.category))];

    if (loading) return <div className="p-20 text-center animate-pulse text-muted-foreground">Loading Configuration...</div>;

    return (
        <div className="max-w-[1400px] mx-auto pb-20 fade-in animate-in duration-500">
            <div className="flex justify-between items-end mb-8 border-b border-border pb-6">
                <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                        <Settings className="text-primary" />
                        Criteria Builder
                    </h1>
                    <p className="text-muted-foreground">Define criteria and scoring rubrics to standardize assessments.</p>
                </div>
                <div className="text-sm font-mono text-muted-foreground">
                    Total Criteria: {criteria.length}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Panel */}
                <div className="lg:col-span-5">
                    <Card className="sticky top-6 rounded-2xl shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                                {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
                                {editingId ? 'Edit Criterion' : 'Add New Criterion'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Name</label>
                                        <input
                                            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary outline-none"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            placeholder="e.g. Multi-Factor Authentication"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Category</label>
                                        <input
                                            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary outline-none"
                                            list="categories"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            required
                                        />
                                        <datalist id="categories">
                                            {categories.map(c => <option key={c} value={c} />)}
                                        </datalist>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Weight (1-5)</label>
                                        <input
                                            type="number" min="1" max="5"
                                            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:ring-1 focus:ring-primary outline-none"
                                            value={formData.weight}
                                            onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Description</label>
                                    <textarea
                                        className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary outline-none h-20 text-sm resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                {/* Rubric Editor */}
                                <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                                    <div className="flex items-center gap-2 mb-3">
                                        <HelpCircle size={14} className="text-primary" />
                                        <span className="text-xs font-bold text-foreground uppercase">Scoring Rubric (1-5)</span>
                                    </div>
                                    <div className="space-y-2">
                                        {[1, 2, 3, 4, 5].map(level => (
                                            <div key={level} className="flex gap-2 items-center">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${level >= 4 ? 'bg-emerald-100 text-emerald-600' :
                                                    level === 3 ? 'bg-blue-100 text-blue-600' :
                                                        'bg-secondary text-muted-foreground'
                                                    }`}>
                                                    {level}
                                                </div>
                                                <input
                                                    className="flex-1 bg-transparent border-b border-input px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary outline-none"
                                                    value={formData.rubric[level] || ''}
                                                    onChange={e => updateRubricLevel(level, e.target.value)}
                                                    placeholder={`Define specific criteria for Level ${level}...`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button type="submit" className="flex-1">
                                        <Save size={16} className="mr-2" /> Save Item
                                    </Button>
                                    {editingId && (
                                        <Button type="button" variant="secondary" onClick={handleCancel} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                            <X size={16} />
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* List Panel */}
                <div className="lg:col-span-7 space-y-4">
                    {categories.map(cat => (
                        <Card key={cat} className="shadow-sm hover:shadow-md transition-all">
                            <button
                                onClick={() => toggleCategory(cat)}
                                className="w-full px-6 py-4 flex justify-between items-center hover:bg-secondary/50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-1 rounded-full bg-secondary text-muted-foreground transition-transform duration-200 ${expandedCategories[cat] ? 'rotate-90' : ''}`}>
                                        <ChevronRight size={16} />
                                    </div>
                                    <h3 className="font-bold text-foreground text-lg">{cat}</h3>
                                </div>
                                <Badge variant="secondary" className="font-mono">
                                    {criteria.filter(c => c.category === cat).length}
                                </Badge>
                            </button>

                            {expandedCategories[cat] && (
                                <CardContent className="divide-y divide-border pt-0 pb-0">
                                    {criteria.filter(c => c.category === cat).map(c => (
                                        <div key={c.id} className="p-4 pl-12 hover:bg-secondary/20 transition-colors group flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-foreground">{c.name}</span>
                                                    <Badge variant={c.weight >= 4 ? "default" : "outline"} className="text-[10px] h-5">
                                                        W{c.weight}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{c.description}</p>

                                                {/* Mini Rubric Preview */}
                                                <div className="grid grid-cols-5 gap-1 mt-2 text-[10px] text-muted-foreground">
                                                    {Object.entries(c.rubric || {}).map(([lvl, desc]) => (
                                                        <div key={lvl} className="truncate" title={`Level ${lvl}: ${desc}`}>
                                                            <span className="font-bold text-muted-foreground">{lvl}.</span> {desc}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(c)} className="h-8 w-8 text-muted-foreground hover:text-blue-600">
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CriteriaBuilder;
