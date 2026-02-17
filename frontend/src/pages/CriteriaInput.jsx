import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useData } from '../context/DataContext';
import { Save, CheckCircle2, ChevronRight, HelpCircle, AlertCircle, LayoutDashboard, Target } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

// SCORE_LABELS removed as per user request for simpler UI

const CriteriaInput = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { solutions, criteria } = useData();
    const [scores, setScores] = useState({});
    const [activeCategory, setActiveCategory] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const categories = [...new Set(criteria.map(c => c.category))];

    useEffect(() => {
        if (categories.length > 0 && !activeCategory) {
            setActiveCategory(categories[0]);
        }
    }, [categories]);

    useEffect(() => {
        const fetchExistingScores = async () => {
            try {
                const res = await axios.get(`/api/scores/${id}`);
                // API returns array of score items directly: [ { criterionId, score... }, ... ]
                if (res.data && Array.isArray(res.data)) {
                    const scoreMap = {};
                    res.data.forEach(item => {
                        scoreMap[item.criterionId] = item;
                    });
                    setScores(scoreMap);
                }
            } catch (err) {
                console.log("No existing scores found or error fetching.");
            }
        };
        fetchExistingScores();
    }, [id]);

    const handleScoreChange = (criterionId, field, value) => {
        setScores(prev => ({
            ...prev,
            [criterionId]: {
                ...prev[criterionId],
                [field]: value,
                criterionId
            }
        }));
    };

    const handleSave = async () => {
        const items = Object.values(scores);
        if (items.length === 0) return;

        setIsSaving(true);
        try {
            await axios.post('/api/scores', {
                solutionId: id,
                items
            });
            // Simulate brief delay for feedback
            setTimeout(() => {
                setIsSaving(false);
                navigate('/compare');
            }, 500);
        } catch (error) {
            console.error(error);
            setIsSaving(false);
            alert('Failed to save scores.');
        }
    };

    const solution = solutions.find(s => s.id === id);
    if (!solution) return <div className="p-8 text-center animate-pulse text-xl text-muted-foreground">Loading solution...</div>;

    const getProgress = () => {
        const total = criteria.length;
        const current = Object.keys(scores).length;
        if (total === 0) return 0;
        return Math.round((current / total) * 100);
    };

    // Helper to get rubric levels for custom tooltip
    const renderRubricTooltip = (c) => {
        if (!c.rubric) return null;
        return (
            <div className="absolute z-50 left-0 bottom-full mb-2 w-[400px] bg-popover border border-border rounded-xl p-4 shadow-xl opacity-0 group-hover/rubric:opacity-100 pointer-events-none transition-all duration-200 text-xs translate-y-2 group-hover/rubric:translate-y-0">
                <div className="font-bold text-foreground mb-2 border-b border-border pb-1">SCORING GUIDE</div>
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(lvl => (
                        <div key={lvl} className="grid grid-cols-12 gap-2">
                            <span className={`col-span-1 font-bold ${lvl >= 4 ? 'text-emerald-600' : 'text-muted-foreground'}`}>{lvl}</span>
                            <span className="col-span-11 text-muted-foreground">{c.rubric[String(lvl)] || 'N/A'}</span>
                        </div>
                    ))}
                </div>
                {/* Arrow */}
                <div className="absolute left-4 top-full w-2 h-2 bg-popover border-r border-b border-border transform rotate-45 -mt-1"></div>
            </div>
        );
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 border-b border-border pb-6">
                <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                        <Link to="/" className="hover:text-foreground transition-colors">Dashboard</Link>
                        <ChevronRight size={14} />
                        <span className="text-foreground font-medium">{solution.name}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Evaluate Solution</h1>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground font-medium">Progress</span>
                        <div className="w-32 h-2.5 bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${getProgress()}%` }}
                            />
                        </div>
                        <span className="font-bold text-foreground w-8 text-right">{getProgress()}%</span>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-6 rounded-lg font-medium"
                    >
                        {isSaving ? 'Saving...' : 'Save Assessment'}
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Sidebar Categories */}
                <div className="w-full lg:w-[260px] shrink-0 sticky top-4">
                    <div className="space-y-1">
                        <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                            Categories
                        </div>
                        {categories.map(cat => {
                            const isActive = activeCategory === cat;
                            const count = criteria.filter(c => c.category === cat).length;
                            const answered = criteria.filter(c => c.category === cat && scores[c.id]).length;

                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${isActive
                                        ? 'bg-primary text-primary-foreground font-medium'
                                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                        }`}
                                >
                                    <span>{cat}</span>
                                    {answered === count && <CheckCircle2 size={14} className={isActive ? "text-primary-foreground/70" : "text-emerald-500"} />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-4 min-w-0">
                    {criteria.filter(c => c.category === activeCategory).map(c => {
                        const score = scores[c.id]?.score || 0;

                        return (
                            <div key={c.id} className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-foreground text-lg">{c.name}</h3>
                                            <Badge variant="outline" className="text-[10px] font-normal">
                                                Weight: {c.weight}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground text-sm max-w-2xl">{c.description}</p>
                                    </div>
                                    {/* 
                                     * Removed score labels (5/5, Excellent) per user request 
                                     * Keeping layout structure balanced 
                                     */}
                                    <div className="text-right">
                                        {/* Empty or minimal indicator if needed, currently requested to be removed */}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                    {/* Slider */}
                                    <div>
                                        <div className="flex justify-between items-end mb-3">
                                            <label className="text-xs font-medium text-muted-foreground uppercase">
                                                Score
                                            </label>
                                            <span className="text-sm font-bold text-primary font-mono">{score}/5</span>
                                        </div>

                                        <div className="relative h-6 flex items-center select-none group/slider">
                                            {/* Track Background */}
                                            <div className="absolute w-full h-2 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 opacity-90 transition-all duration-150"
                                                    style={{ width: `${(score / 5) * 100}%` }}
                                                />
                                            </div>

                                            {/* Tick Marks */}
                                            <div className="absolute w-full flex justify-between px-1 pointer-events-none">
                                                {[0, 1, 2, 3, 4, 5].map(val => (
                                                    <div key={val} className={`w-1 h-1 rounded-full transition-colors z-10 ${val <= score ? 'bg-white shadow-sm' : 'bg-muted-foreground/30'}`} />
                                                ))}
                                            </div>

                                            {/* Thumb (Visual) */}
                                            <div
                                                className="absolute w-5 h-5 bg-background border-2 border-primary rounded-full shadow-md transition-all duration-75 pointer-events-none flex items-center justify-center z-20 group-hover/slider:scale-110"
                                                style={{ left: `calc(${score * 20}% - 10px)` }}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${score > 0 ? 'bg-primary' : 'bg-muted'}`} />
                                            </div>

                                            {/* Actual Input (Invisible Overlay) */}
                                            <input
                                                type="range"
                                                min="0" max="5"
                                                step="1"
                                                className="absolute w-full h-full opacity-0 cursor-pointer z-30"
                                                value={score}
                                                onChange={e => handleScoreChange(c.id, 'score', parseInt(e.target.value))}
                                            />
                                        </div>

                                        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1 font-medium">
                                            <span>Poor</span>
                                            <span>Excellent</span>
                                        </div>
                                    </div>

                                    {/* Inputs */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground uppercase mb-1.5 block">
                                                Mode
                                            </label>
                                            <select
                                                className="w-full text-xs h-9 bg-background border border-input rounded px-2 focus:ring-1 focus:ring-primary outline-none"
                                                value={scores[c.id]?.mode || 'Theoretical'}
                                                onChange={e => handleScoreChange(c.id, 'mode', e.target.value)}
                                            >
                                                <option>Theoretical Research</option>
                                                <option>Practical Lab Test</option>
                                                <option>Vendor Demo</option>
                                                <option>Customer Reference</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground uppercase mb-1.5 block">
                                                Notes
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full text-xs h-9 bg-background border border-input rounded px-2 focus:ring-1 focus:ring-primary outline-none"
                                                placeholder="Add evidence..."
                                                value={scores[c.id]?.evidence || ''}
                                                onChange={e => handleScoreChange(c.id, 'evidence', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Floating Action Button (Mobile) - Optional, kept inline for now */}
        </div>
    );
};

export default CriteriaInput;
