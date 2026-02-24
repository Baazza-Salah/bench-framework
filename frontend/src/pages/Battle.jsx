import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Swords,
    Trophy,
    Crown,
    Flame,
    Zap,
    TrendingUp,
    Target,
    Shield,
    CheckCircle2,
    XCircle,
    ArrowRightLeft,
    Scale,
    Medal,
    BarChart3
} from 'lucide-react';
import { Radar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const Battle = () => {
    const [data, setData] = useState(null);
    const [leftId, setLeftId] = useState('');
    const [rightId, setRightId] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/api/compare');
                setData(res.data);
                if (res.data.rankings.length >= 2) {
                    setLeftId(res.data.rankings[0].solutionId);
                    setRightId(res.data.rankings[1].solutionId);
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                <Scale className="relative text-primary animate-bounce" size={64} />
            </div>
            <div className="text-xl font-medium text-muted-foreground tracking-wide animate-pulse">
                Initializing Comparison Engine...
            </div>
        </div>
    );

    const solutions = data?.rankings || [];
    const leftSol = solutions.find(s => s.solutionId === leftId);
    const rightSol = solutions.find(s => s.solutionId === rightId);
    const categories = leftSol?.categoryScores.map(c => c.category) || [];

    const getWinner = (cat) => {
        if (!leftSol || !rightSol) return null;
        const lScore = leftSol.categoryScores.find(c => c.category === cat)?.score || 0;
        const rScore = rightSol.categoryScores.find(c => c.category === cat)?.score || 0;
        if (lScore > rScore) return 'left';
        if (rScore > lScore) return 'right';
        return 'tie';
    };

    const radarData = {
        labels: categories,
        datasets: [
            {
                label: leftSol?.solutionName || 'Left',
                data: categories.map(cat => leftSol?.categoryScores.find(c => c.category === cat)?.score || 0),
                backgroundColor: 'rgba(59, 130, 246, 0.2)', // Blue
                borderColor: '#3b82f6',
                borderWidth: 2,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#3b82f6',
            },
            {
                label: rightSol?.solutionName || 'Right',
                data: categories.map(cat => rightSol?.categoryScores.find(c => c.category === cat)?.score || 0),
                backgroundColor: 'rgba(239, 68, 68, 0.2)', // Red
                borderColor: '#ef4444',
                borderWidth: 2,
                pointBackgroundColor: '#ef4444',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#ef4444',
            }
        ]
    };

    const radarOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#64748b', usePointStyle: true, padding: 20, font: { family: "'Outfit', sans-serif", weight: 'bold' } }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleFont: { family: "'Outfit', sans-serif" },
                bodyFont: { family: "'Outfit', sans-serif" },
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        return ` ${context.dataset.label}: ${context.raw.toFixed(1)}`;
                    }
                }
            }
        },
        scales: {
            r: {
                angleLines: { color: 'rgba(148, 163, 184, 0.1)' },
                grid: { color: 'rgba(148, 163, 184, 0.1)', circular: true },
                pointLabels: { color: '#64748b', font: { size: 10, weight: '700', family: "'Outfit', sans-serif" } },
                ticks: { display: false, backdropColor: 'transparent', stepSize: 1, max: 5 },
                suggestedMin: 0,
                suggestedMax: 5
            }
        }
    };

    const leftScore = leftSol?.overallScore || 0;
    const rightScore = rightSol?.overallScore || 0;
    const scoreDiff = Math.abs(leftScore - rightScore).toFixed(2);
    const leader = leftScore > rightScore ? 'left' : rightScore > leftScore ? 'right' : 'tie';

    // Calculate advantages
    let leftAdvantages = 0;
    let rightAdvantages = 0;
    categories.forEach(cat => {
        const w = getWinner(cat);
        if (w === 'left') leftAdvantages++;
        if (w === 'right') rightAdvantages++;
    });

    return (
        <div className="max-w-[1600px] mx-auto pb-20 font-sans">

            {/* 1. Header & Controls */}
            <div className="flex flex-col gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-2">
                        <ArrowRightLeft className="text-primary" size={24} />
                        Comparison Engine
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">Side-by-side technical evaluation.</p>
                </div>

                {/* Solution Selectors */}
                <div className="flex flex-wrap items-center gap-3 bg-card border border-border p-2 rounded-xl shadow-sm w-full sm:w-fit">
                    <select
                        className="bg-transparent text-sm font-semibold outline-none text-foreground cursor-pointer p-1 flex-1 min-w-0"
                        value={leftId}
                        onChange={e => setLeftId(e.target.value)}
                    >
                        {solutions.map(s => <option key={s.solutionId} value={s.solutionId}>{s.solutionName}</option>)}
                    </select>
                    <span className="text-xs font-bold text-muted-foreground px-2">VS</span>
                    <select
                        className="bg-transparent text-sm font-semibold outline-none text-foreground cursor-pointer p-1 flex-1 min-w-0"
                        value={rightId}
                        onChange={e => setRightId(e.target.value)}
                    >
                        {solutions.map(s => <option key={s.solutionId} value={s.solutionId}>{s.solutionName}</option>)}
                    </select>
                </div>
            </div>

            {/* 2. Scoreboard Hero Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 mb-6 md:mb-8 rounded-2xl overflow-hidden border border-border shadow-sm">

                {/* Left Side */}
                <div className={`p-6 md:p-12 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500 ${leader === 'left' ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'bg-card'}`}>
                    {leader === 'left' && <div className="absolute top-4 right-4 text-blue-500 font-bold text-xs bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-full animate-pulse flex items-center gap-1"><Crown size={12} /> LEADER</div>}

                    <h2 className="text-xl md:text-4xl font-black text-foreground text-center mb-2">{leftSol?.solutionName}</h2>
                    <p className="text-sm text-muted-foreground mb-4 md:mb-6 font-medium">{leftSol?.vendor}</p>

                    <div className="relative">
                        <div className="text-5xl md:text-8xl font-black text-blue-600 dark:text-blue-400 tabular-nums tracking-tighter">
                            {leftScore.toFixed(2)}
                        </div>
                        <div className="absolute -right-8 top-2">
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 text-[10px] pointer-events-none">
                                {leftSol?.metrics?.deploymentType || 'SaaS'}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div className={`p-6 md:p-12 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500 border-t sm:border-t-0 sm:border-l border-border ${leader === 'right' ? 'bg-red-50/50 dark:bg-red-950/20' : 'bg-card'}`}>
                    {leader === 'right' && <div className="absolute top-4 left-4 text-red-500 font-bold text-xs bg-red-100 dark:bg-red-900/40 px-3 py-1 rounded-full animate-pulse flex items-center gap-1"><Crown size={12} /> LEADER</div>}

                    <h2 className="text-xl md:text-4xl font-black text-foreground text-center mb-2">{rightSol?.solutionName}</h2>
                    <p className="text-sm text-muted-foreground mb-4 md:mb-6 font-medium">{rightSol?.vendor}</p>

                    <div className="relative">
                        <div className="text-5xl md:text-8xl font-black text-red-600 dark:text-red-400 tabular-nums tracking-tighter">
                            {rightScore.toFixed(2)}
                        </div>
                        <div className="absolute -right-8 top-2">
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0 text-[10px] pointer-events-none">
                                {rightSol?.metrics?.deploymentType || 'SaaS'}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Detailed Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">

                {/* Radar Chart (1 col) */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Target className="text-primary" size={18} /> Capability Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="aspect-square relative">
                            <Radar data={radarData} options={radarOptions} />
                        </div>
                        <div className="mt-6 space-y-3">
                            <div className="flex justify-between items-center text-sm p-3 bg-muted/20 rounded-lg">
                                <span className="font-medium text-blue-600">{leftSol?.solutionName} Wins</span>
                                <span className="font-bold">{leftAdvantages}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm p-3 bg-muted/20 rounded-lg">
                                <span className="font-medium text-red-600">{rightSol?.solutionName} Wins</span>
                                <span className="font-bold">{rightAdvantages}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Category Breakdown (2 cols) */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BarChart3 className="text-primary" size={18} /> Category Analysis
                        </CardTitle>
                        <CardDescription>Detailed scoring breakdown per evaluation category.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {categories.map((cat, idx) => {
                            const winner = getWinner(cat);
                            const lScore = leftSol?.categoryScores.find(c => c.category === cat)?.score || 0;
                            const rScore = rightSol?.categoryScores.find(c => c.category === cat)?.score || 0;
                            const maxScore = 5;

                            return (
                                <div key={cat} className="group">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-semibold text-foreground">{cat}</span>
                                        {winner !== 'tie' && (
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${winner === 'left' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                                +{Math.abs(lScore - rScore).toFixed(1)} {winner === 'left' ? leftSol.solutionName : rightSol.solutionName}
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Left Bar */}
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-bold w-6 text-right ${winner === 'left' ? 'text-blue-600' : 'text-muted-foreground'}`}>{lScore.toFixed(1)}</span>
                                            <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden flex justify-end">
                                                <div
                                                    className={`h-full rounded-full ${winner === 'left' ? 'bg-blue-500' : 'bg-blue-300/50'}`}
                                                    style={{ width: `${(lScore / maxScore) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Right Bar */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${winner === 'right' ? 'bg-red-500' : 'bg-red-300/50'}`}
                                                    style={{ width: `${(rScore / maxScore) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className={`text-xs font-bold w-6 ${winner === 'right' ? 'text-red-600' : 'text-muted-foreground'}`}>{rScore.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
};

export default Battle;
