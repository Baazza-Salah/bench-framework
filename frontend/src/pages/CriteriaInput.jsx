import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useData } from '../context/DataContext';
import { Save, AlertCircle, CheckCircle, ChevronRight, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const CriteriaInput = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { solutions, criteria } = useData();
    const [scores, setScores] = useState({});
    const [activeCategory, setActiveCategory] = useState('');

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
                if (res.data && res.data.length > 0) {
                    const latest = res.data[res.data.length - 1];
                    if (latest && latest.items) {
                        const scoreMap = {};
                        latest.items.forEach(item => {
                            scoreMap[item.criterionId] = item;
                        });
                        setScores(scoreMap);
                    }
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

        try {
            await axios.post('/api/scores', {
                solutionId: id,
                items
            });
            alert('Scores saved successfully!');
            navigate('/compare');
        } catch (error) {
            console.error(error);
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
            <div className="absolute z-50 left-0 bottom-full mb-2 w-[400px] bg-popover border border-border rounded-xl p-4 shadow-xl opacity-0 group-hover/rubric:opacity-100 pointer-events-none transition-opacity text-xs">
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
            <div className="flex justify-between items-end mb-8 border-b border-border pb-6">
                <div>
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <span className="text-sm font-semibold tracking-wider uppercase">Assessment</span>
                        <ChevronRight size={16} />
                        <span className="text-sm font-semibold tracking-wider uppercase text-foreground">{solution.name}</span>
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">Evaluate Solution</h1>
                    <p className="text-muted-foreground">Complete the benchmarking criteria below.</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">Progress</div>
                        <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${getProgress()}%` }} />
                            </div>
                            <span className="font-mono text-foreground">{getProgress()}%</span>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl shadow-sm flex items-center gap-2 font-semibold transition-all hover:-translate-y-0.5"
                    >
                        <Save size={20} />
                        Save Assessment
                    </button>
                </div>
            </div>

            <div className="flex gap-8 items-start">
                {/* Sidebar Categories */}
                <div className="w-[280px] shrink-0 sticky top-8">
                    <Card className="bg-card border border-border rounded-2xl p-4 space-y-1 shadow-sm">
                        <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Categories</div>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group ${activeCategory === cat
                                    ? 'bg-primary text-primary-foreground shadow-md font-medium'
                                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                    }`}
                            >
                                <span>{cat}</span>
                                {activeCategory === cat && <ChevronRight size={16} />}
                            </button>
                        ))}
                    </Card>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6">
                    {criteria.filter(c => c.category === activeCategory).map(c => (
                        <div key={c.id} className="group bg-card border border-border hover:border-primary/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{c.name}</h3>
                                        <Badge variant={c.weight >= 4 ? "default" : "outline"} className="text-[10px]">
                                            W{c.weight}
                                        </Badge>
                                    </div>
                                    <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">{c.description}</p>
                                </div>
                                {scores[c.id]?.score && (
                                    <CheckCircle className="text-emerald-500" size={24} />
                                )}
                            </div>

                            <div className="grid grid-cols-12 gap-6 items-start">
                                <div className="col-span-12 md:col-span-4 relative group/rubric">
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Score (1-5)
                                        </label>
                                        <HelpCircle size={14} className="text-muted-foreground cursor-help" />
                                    </div>

                                    {/* Tooltip */}
                                    {renderRubricTooltip(c)}

                                    <div className="relative">
                                        <input
                                            type="range"
                                            min="1" max="5"
                                            step="1"
                                            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                            value={scores[c.id]?.score || 3}
                                            onChange={e => handleScoreChange(c.id, 'score', parseInt(e.target.value))}
                                        />
                                        <div className="mt-2 flex justify-between text-xs text-muted-foreground font-mono">
                                            <span>1</span>
                                            <span>2</span>
                                            <span>3</span>
                                            <span>4</span>
                                            <span>5</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-center pointer-events-none">
                                        <span className={`inline-block px-4 py-1 rounded-lg font-mono font-bold text-lg 
                                            ${(scores[c.id]?.score || 0) >= 4 ? 'bg-emerald-100 text-emerald-600' :
                                                (scores[c.id]?.score || 0) >= 3 ? 'bg-blue-100 text-blue-600' :
                                                    'bg-secondary text-muted-foreground'}`}>
                                            {scores[c.id]?.score || '-'}
                                        </span>
                                        <div className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto truncate">
                                            {c.rubric && scores[c.id]?.score ? c.rubric[String(scores[c.id]?.score)] : 'Select a score'}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-12 md:col-span-4">
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                        Evaluation Mode
                                    </label>
                                    <select
                                        className="w-full bg-background border border-input rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none"
                                        value={scores[c.id]?.mode || 'Theoretical'}
                                        onChange={e => handleScoreChange(c.id, 'mode', e.target.value)}
                                    >
                                        <option>Theoretical Research</option>
                                        <option>Practical Lab Test</option>
                                        <option>Vendor Demo</option>
                                        <option>Customer Reference</option>
                                    </select>
                                </div>

                                <div className="col-span-12 md:col-span-4">
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                        Evidence / Notes
                                    </label>
                                    <textarea
                                        rows="3"
                                        className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                                        placeholder="Add specific observations, links, or justification..."
                                        value={scores[c.id]?.evidence || ''}
                                        onChange={e => handleScoreChange(c.id, 'evidence', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CriteriaInput;
