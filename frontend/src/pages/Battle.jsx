import { useState, useEffect } from 'react';
import axios from 'axios';
import { Swords, Trophy } from 'lucide-react';
import { Radar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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

    if (loading) return <div className="p-20 text-center animate-pulse text-muted-foreground">Preparing Battle Arena...</div>;

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
                label: leftSol?.solutionName || 'Select Solution',
                data: categories.map(cat => leftSol?.categoryScores.find(c => c.category === cat)?.score || 0),
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: '#3b82f6',
                borderWidth: 2,
            },
            {
                label: rightSol?.solutionName || 'Select Solution',
                data: categories.map(cat => rightSol?.categoryScores.find(c => c.category === cat)?.score || 0),
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: '#ef4444',
                borderWidth: 2,
            }
        ]
    };

    const radarOptions = {
        scales: {
            r: {
                angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
                grid: { color: 'rgba(0, 0, 0, 0.1)' },
                pointLabels: { color: '#64748b', font: { size: 10, weight: 'bold' } },
                ticks: { display: false, backdropColor: 'transparent' },
                suggestedMin: 0,
                suggestedMax: 5
            }
        },
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#64748b', usePointStyle: true }
            }
        }
    };

    const leftWinsTotal = (leftSol?.overallScore || 0) > (rightSol?.overallScore || 0);
    const rightWinsTotal = (rightSol?.overallScore || 0) > (leftSol?.overallScore || 0);

    return (
        <div className="max-w-[1400px] mx-auto pb-20 fade-in animate-in duration-500">
            <div className="flex flex-col items-center justify-center mb-12 pt-8">
                <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/50 text-primary uppercase tracking-widest">
                    Head-to-Head Comparison
                </Badge>
                <h1 className="text-5xl font-black text-foreground flex items-center gap-4 flex-wrap justify-center text-center">
                    <span className={leftWinsTotal ? "text-blue-600" : "text-foreground"}>{leftSol?.solutionName || 'Select'}</span>
                    <span className="text-2xl text-muted-foreground font-mono">VS</span>
                    <span className={rightWinsTotal ? "text-red-600" : "text-foreground"}>{rightSol?.solutionName || 'Select'}</span>
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Card */}
                <Card className={`lg:col-span-3 transition-all duration-500 ${leftWinsTotal ? 'border-blue-500 bg-blue-500/5 shadow-lg' : 'bg-card'}`}>
                    <CardHeader>
                        <select
                            className="bg-transparent text-xl font-bold outline-none text-foreground w-full cursor-pointer p-2 rounded hover:bg-secondary/50 transition-colors"
                            value={leftId}
                            onChange={e => setLeftId(e.target.value)}
                        >
                            {solutions.map(s => <option key={s.solutionId} value={s.solutionId} className="bg-background">{s.solutionName}</option>)}
                        </select>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="text-7xl font-black text-foreground mb-2 tracking-tighter">{leftSol?.overallScore.toFixed(1)}</div>
                        <Badge variant={leftWinsTotal ? "default" : "secondary"} className={leftWinsTotal ? "bg-blue-600 hover:bg-blue-700" : ""}>
                            Overall Score
                        </Badge>
                        <div className="mt-8 space-y-4 text-left">
                            <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                                <span className="text-muted-foreground">MITRE Coverage</span>
                                <span className="font-mono font-bold text-foreground">{leftSol?.metrics?.mitreCoverage || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                                <span className="text-muted-foreground">Analyst Time</span>
                                <span className="font-mono font-bold text-foreground">{leftSol?.metrics?.averageAnalystTime || '0'}m</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Center Radar & Breakdown */}
                <div className="lg:col-span-6 space-y-8">
                    <Card className="shadow-sm">
                        <CardContent className="p-8">
                            <div className="aspect-square max-h-[400px] mx-auto">
                                <Radar data={radarData} options={radarOptions} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg text-center uppercase tracking-widest text-muted-foreground text-xs">Category Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {categories.map(cat => {
                                const winner = getWinner(cat);
                                const lScore = leftSol?.categoryScores.find(c => c.category === cat)?.score;
                                const rScore = rightSol?.categoryScores.find(c => c.category === cat)?.score;
                                return (
                                    <div key={cat} className="flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-secondary/30 px-2 rounded transition-colors group">
                                        <div className={`font-mono w-12 text-right ${winner === 'left' ? 'text-blue-600 font-bold' : 'text-muted-foreground'}`}>
                                            {lScore}
                                        </div>
                                        <div className="flex-1 text-center px-4 flex items-center justify-center gap-2">
                                            <span className="text-sm text-foreground font-medium group-hover:text-primary transition-colors">{cat}</span>
                                            {winner === 'left' && <Trophy size={12} className="text-blue-500" />}
                                            {winner === 'right' && <Trophy size={12} className="text-red-500" />}
                                        </div>
                                        <div className={`font-mono w-12 text-left ${winner === 'right' ? 'text-red-600 font-bold' : 'text-muted-foreground'}`}>
                                            {rScore}
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Card */}
                <Card className={`lg:col-span-3 transition-all duration-500 ${rightWinsTotal ? 'border-red-500 bg-red-500/5 shadow-lg' : 'bg-card'}`}>
                    <CardHeader>
                        <select
                            className="bg-transparent text-xl font-bold outline-none text-foreground w-full cursor-pointer text-right p-2 rounded hover:bg-secondary/50 transition-colors"
                            value={rightId}
                            onChange={e => setRightId(e.target.value)}
                        >
                            {solutions.map(s => <option key={s.solutionId} value={s.solutionId} className="bg-background">{s.solutionName}</option>)}
                        </select>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="text-7xl font-black text-foreground mb-2 tracking-tighter">{rightSol?.overallScore.toFixed(1)}</div>
                        <Badge variant={rightWinsTotal ? "destructive" : "secondary"}>
                            Overall Score
                        </Badge>
                        <div className="mt-8 space-y-4 text-left">
                            <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                                <span className="text-muted-foreground">MITRE Coverage</span>
                                <span className="font-mono font-bold text-foreground">{rightSol?.metrics?.mitreCoverage || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                                <span className="text-muted-foreground">Analyst Time</span>
                                <span className="font-mono font-bold text-foreground">{rightSol?.metrics?.averageAnalystTime || '0'}m</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
};

export default Battle;
