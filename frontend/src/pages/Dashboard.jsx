import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Shield, Plus, TrendingUp, Award, Activity, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [solutions, setSolutions] = useState([]);
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            axios.get('/api/solutions'),
            axios.get('/api/compare')
        ])
            .then(([solRes, compRes]) => {
                setSolutions(solRes.data);
                setComparison(compRes.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <Shield className="mx-auto text-primary mb-4 animate-pulse" size={56} />
                <div className="text-muted-foreground text-lg">Loading dashboard...</div>
            </div>
        </div>
    );

    const rankings = comparison?.rankings || [];
    const avgScore = rankings.length > 0
        ? (rankings.reduce((acc, s) => acc + (s.overallScore || 0), 0) / rankings.length).toFixed(1)
        : '0.0';

    const topPerformer = rankings.length > 0
        ? rankings.reduce((prev, current) => (prev.overallScore > current.overallScore) ? prev : current)
        : null;

    // Performance badge helper
    const getPerformanceBadge = (score) => {
        if (score >= 4) return { label: 'Excellent', color: '' }; // classes applied in render
        if (score >= 3) return { label: 'Good', color: '' };
        if (score >= 2) return { label: 'Fair', color: '' };
        return { label: 'Needs Improvement', color: '' };
    };

    // Bar Chart
    const barChartData = {
        labels: rankings.slice(0, 5).map(s => s.solutionName),
        datasets: [{
            label: 'Score',
            data: rankings.slice(0, 5).map(s => s.overallScore),
            backgroundColor: rankings.slice(0, 5).map(s =>
                s.overallScore >= 4 ? 'rgba(16, 185, 129, 0.8)' :
                    s.overallScore >= 3 ? 'rgba(59, 130, 246, 0.8)' :
                        'rgba(245, 158, 11, 0.8)'
            ),
            borderWidth: 0,
            borderRadius: 4
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#0f172a',
                bodyColor: '#334155',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                displayColors: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 5,
                grid: { color: '#e2e8f0' },
                ticks: { color: '#64748b', font: { size: 12 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { size: 12 } }
            }
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-4xl font-black text-foreground mb-3 tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground text-lg">SOC solution benchmarking overview and insights</p>
                </div>
                <Link to="/solution" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 gap-2 shadow-sm">
                    <Plus size={18} />
                    New Solution
                </Link>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {/* Total Solutions */}
                <Card className="hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                                <Shield size={24} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</span>
                        </div>
                        <div className="text-4xl font-black text-foreground mb-1">{solutions.length}</div>
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Solutions Assessed</div>
                    </CardContent>
                </Card>

                {/* Average Score */}
                <Card className="hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
                                <TrendingUp size={24} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Average</span>
                        </div>
                        <div className="text-4xl font-black text-foreground mb-1">{avgScore}</div>
                        <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Market Average Score</div>
                    </CardContent>
                </Card>

                {/* Top Performer */}
                <Card className="hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
                                <Award size={24} className="text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Leader</span>
                        </div>
                        <div className="text-xl font-bold text-foreground mb-1 truncate" title={topPerformer?.solutionName || 'N/A'}>
                            {topPerformer?.solutionName || 'No data'}
                        </div>
                        <div className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                            Score: <span className="font-mono font-bold">{topPerformer?.overallScore?.toFixed(1) || '-'}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Categories */}
                <Card className="hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                                <Activity size={24} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Criteria</span>
                        </div>
                        <div className="text-4xl font-black text-foreground mb-1">
                            {comparison?.categoryAverages ? Object.keys(comparison.categoryAverages).length : '-'}
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Assessment Categories</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                {/* Top 5 Chart */}
                <div className="lg:col-span-7">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Top Ranked Solutions</h2>
                    <Card className="shadow-sm">
                        <CardContent className="p-8">
                            <div className="h-[350px]">
                                {rankings.length > 0 ? (
                                    <Bar data={barChartData} options={chartOptions} />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        No assessment data available
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Stats */}
                <div className="lg:col-span-5">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-foreground">Rankings</h2>
                        <Link to="/compare" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {rankings.slice(0, 5).map((sol, idx) => {
                            const perf = getPerformanceBadge(sol.overallScore);
                            // Adjusting badge styles for light theme
                            let badgeClass = "text-[10px] mt-1 border ";
                            if (sol.overallScore >= 4) badgeClass += "bg-emerald-100 text-emerald-700 border-emerald-200";
                            else if (sol.overallScore >= 3) badgeClass += "bg-blue-100 text-blue-700 border-blue-200";
                            else if (sol.overallScore >= 2) badgeClass += "bg-amber-100 text-amber-700 border-amber-200";
                            else badgeClass += "bg-red-100 text-red-700 border-red-200";

                            return (
                                <Card key={idx} className="hover:shadow-md transition-all">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${idx === 0 ? 'bg-amber-100 text-amber-700' :
                                                    idx === 1 ? 'bg-slate-100 text-slate-600' :
                                                        idx === 2 ? 'bg-orange-100 text-orange-700' :
                                                            'bg-slate-50 text-slate-400'
                                                }`}>
                                                #{idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-foreground truncate">{sol.solutionName}</div>
                                                <div className="text-xs text-muted-foreground mt-0.5">{sol.metrics?.deploymentType || 'N/A'}</div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-xl font-black text-foreground">{sol.overallScore.toFixed(1)}</div>
                                                <Badge variant="outline" className={badgeClass}>
                                                    {perf.label}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        {rankings.length === 0 && (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <Activity className="mx-auto text-muted-foreground mb-3" size={32} />
                                    <div className="text-muted-foreground mb-4">No solutions ranked yet</div>
                                    <Link to="/solution" className="text-primary hover:text-primary/80 text-sm font-medium">
                                        Add your first solution →
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* All Solutions Grid */}
            <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">All Solutions</h2>
                {solutions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {solutions.map(sol => {
                            const ranking = rankings.find(r => r.solutionId === sol.id);
                            const hasAssessment = !!ranking;
                            const perf = ranking ? getPerformanceBadge(ranking.overallScore) : null;

                            let badgeClass = "text-[10px] ";
                            if (perf) {
                                if (ranking.overallScore >= 4) badgeClass += "bg-emerald-100 text-emerald-700 border-emerald-200";
                                else if (ranking.overallScore >= 3) badgeClass += "bg-blue-100 text-blue-700 border-blue-200";
                                else if (ranking.overallScore >= 2) badgeClass += "bg-amber-100 text-amber-700 border-amber-200";
                                else badgeClass += "bg-red-100 text-red-700 border-red-200";
                            }

                            return (
                                <Card key={sol.id} className="group hover:shadow-lg transition-all duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg text-foreground mb-1 truncate group-hover:text-primary transition-colors">
                                                    {sol.name}
                                                </h3>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs text-muted-foreground">{sol.vendor}</span>
                                                    <span className="text-xs text-muted-foreground">•</span>
                                                    <Badge variant="outline" className="text-[10px] h-5 border-slate-200 text-slate-600">
                                                        {sol.deploymentModel}
                                                    </Badge>
                                                </div>
                                            </div>
                                            {hasAssessment ? (
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="text-2xl font-black text-emerald-600">
                                                        {ranking.overallScore.toFixed(1)}
                                                    </div>
                                                    <Badge variant="outline" className={badgeClass}>
                                                        {perf.label}
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Clock size={14} />
                                                    <span className="text-xs">Pending</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2 mb-5 text-sm">
                                            {hasAssessment && ranking.metrics && (
                                                <>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">MITRE Coverage</span>
                                                        <span className="text-foreground font-mono">{ranking.metrics.mitreCoverage || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Method</span>
                                                        <span className="text-foreground">{sol.methodType || 'N/A'}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <Link
                                            to={`/assess/${sol.id}`}
                                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 w-full gap-2"
                                        >
                                            {hasAssessment ? (
                                                <>
                                                    <CheckCircle2 size={16} />
                                                    Review Assessment
                                                </>
                                            ) : (
                                                <>
                                                    <Activity size={16} />
                                                    Start Assessment
                                                </>
                                            )}
                                        </Link>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Shield className="mx-auto text-muted-foreground mb-4" size={48} />
                            <h3 className="text-xl font-bold text-foreground mb-2">No Solutions Yet</h3>
                            <p className="text-muted-foreground mb-6">Get started by adding your first security solution to benchmark.</p>
                            <Link to="/solution" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 gap-2">
                                <Plus size={20} />
                                Add Solution
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
