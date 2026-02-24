import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bar, Radar, Doughnut, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import {
    Shield,
    Plus,
    TrendingUp,
    Zap,
    Activity,
    ArrowRight,
    CheckCircle2,
    Clock,
    Target,
    BarChart3,
    Trophy,
    LayoutDashboard,
    ArrowUpRight,
    PieChart,
    Layers,
    CreditCard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

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
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                <Shield className="relative text-primary animate-bounce" size={64} />
            </div>
            <div className="text-muted-foreground text-lg font-medium animate-pulse">Initializing Dashboard...</div>
        </div>
    );

    const rankings = comparison?.rankings || [];
    const avgScore = rankings.length > 0
        ? (rankings.reduce((acc, s) => acc + (s.overallScore || 0), 0) / rankings.length).toFixed(1)
        : '0.0';

    const topPerformer = rankings.length > 0
        ? rankings.reduce((prev, current) => (prev.overallScore > current.overallScore) ? prev : current)
        : null;

    // --- Chart Data ---

    // 1. Top Performers Bar Chart
    const barChartData = {
        labels: rankings.slice(0, 5).map(s => s.solutionName),
        datasets: [{
            label: 'Overall Score',
            data: rankings.slice(0, 5).map(s => s.overallScore),
            backgroundColor: rankings.slice(0, 5).map(s => {
                if (s.overallScore >= 4) return 'rgba(16, 185, 129, 0.7)'; // Emerald
                if (s.overallScore >= 3) return 'rgba(59, 130, 246, 0.7)'; // Blue
                return 'rgba(245, 158, 11, 0.7)'; // Amber
            }),
            borderColor: 'transparent',
            borderRadius: 6,
            barThickness: 30,
        }]
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#e2e8f0',
                bodyColor: '#cbd5e1',
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 5,
                grid: { color: 'rgba(148, 163, 184, 0.1)' },
                ticks: { color: '#64748b', font: { size: 10 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { size: 11, weight: 500 } }
            }
        }
    };

    // 2. Market Score Range (Floating Bar)
    // Calculate min/max for each category
    const categoryLabels = comparison?.categoryAverages ? Object.keys(comparison.categoryAverages) : [];
    const categoryValues = comparison?.categoryAverages ? Object.values(comparison.categoryAverages) : [];

    const rangeDataPoints = categoryLabels.map((cat, i) => {
        let min = 10;
        let max = 0;
        rankings.forEach(sol => {
            const score = sol.categoryScores.find(c => c.category === cat)?.score || 0;
            if (score < min) min = score;
            if (score > max) max = score;
        });
        return {
            category: cat,
            min,
            max,
            avg: categoryValues[i] // Use pre-calculated avg for sorting if needed
        };
    }).sort((a, b) => b.avg - a.avg);

    const rangeChartData = {
        labels: rangeDataPoints.map(d => d.category),
        datasets: [{
            label: 'Score Range',
            data: rangeDataPoints.map(d => [d.min, d.max]), // Floating bars [min, max]
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            barPercentage: 0.6,
            borderRadius: 4,
            borderSkipped: false,
        }]
    };

    const rangeChartOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function (ctx) {
                        const val = ctx.raw;
                        return ` Range: ${val[0]} - ${val[1]}`;
                    }
                }
            }
        },
        scales: {
            x: {
                min: 0,
                max: 10,
                grid: { color: 'rgba(148, 163, 184, 0.1)' },
            },
            y: {
                grid: { display: false },
            }
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-20">
            {/* Header Flex */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-3">
                        <LayoutDashboard className="text-primary" />
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">Real-time benchmarking intelligence.</p>
                </div>
                <div className="flex gap-2 sm:gap-3 flex-wrap">
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/compare">
                            <BarChart3 className="mr-2 h-4 w-4" /> Full Report
                        </Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link to="/solution">
                            <Plus className="mr-2 h-4 w-4" /> New Assessment
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-blue-100 dark:border-blue-900/50">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Solutions</p>
                                <h3 className="text-3xl font-black text-foreground mt-2">{solutions.length}</h3>
                            </div>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <Shield size={20} />
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
                            <Activity size={12} />
                            <span>{rankings.length} evaluated</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background border-emerald-100 dark:border-emerald-900/50">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Avg Market Score</p>
                                <h3 className="text-3xl font-black text-foreground mt-2">{avgScore}</h3>
                            </div>
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
                            <Zap size={12} className="text-amber-500" />
                            <span>out of 5.0 scale</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background border-amber-100 dark:border-amber-900/50 lg:col-span-2">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Current Leader</p>
                                <h3 className="text-2xl font-black text-foreground mt-1 truncate max-w-[200px] md:max-w-none">
                                    {topPerformer ? topPerformer.solutionName : 'No Data'}
                                </h3>
                                {topPerformer && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 pointer-events-none">
                                            Score: {topPerformer.overallScore.toFixed(2)}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {topPerformer.vendor}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                                <Trophy size={20} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid (Bento) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">

                {/* 1. Top Performers Chart (Span 2) */}
                <Card className="lg:col-span-2 flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">Top Performers</CardTitle>
                        <CardDescription>Highest scoring solutions by overall weighted score</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[300px]">
                        {rankings.length > 0 ? (
                            <Bar data={barChartData} options={barOptions} />
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
                        )}
                    </CardContent>
                </Card>

                {/* 2. Market Score Range (Span 1) */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">Market Score Range</CardTitle>
                        <CardDescription>Min-Max score spread by category</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[300px] flex items-center justify-center">
                        {rankings.length > 0 ? (
                            <div className="w-full h-full max-h-[300px]">
                                <Bar data={rangeChartData} options={rangeChartOptions} />
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Critical Market Structure Charts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">

                {/* 1. Deployment Distribution (Doughnut) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Layers className="text-blue-500" size={18} />
                            Deployment Models
                        </CardTitle>
                        <CardDescription>Infrastructure preference</CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[250px] flex items-center justify-center p-4">
                        {solutions.length > 0 ? (
                            <div className="w-full h-[200px]">
                                <Doughnut
                                    data={{
                                        labels: ['SaaS', 'Hybrid', 'On-Prem'],
                                        datasets: [{
                                            data: [
                                                solutions.filter(s => s.deploymentModel === 'SaaS').length,
                                                solutions.filter(s => s.deploymentModel === 'Hybrid').length,
                                                solutions.filter(s => s.deploymentModel === 'On-Prem').length
                                            ],
                                            backgroundColor: ['#3b82f6', '#8b5cf6', '#64748b'],
                                            borderWidth: 0
                                        }]
                                    }}
                                    options={{
                                        maintainAspectRatio: false,
                                        plugins: { legend: { position: 'right', labels: { boxWidth: 10, usePointStyle: true } } }
                                    }}
                                />
                            </div>
                        ) : <div className="text-muted-foreground">No data</div>}
                    </CardContent>
                </Card>

                {/* 2. Solution Types (Horizontal Bar) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PieChart className="text-emerald-500" size={18} />
                            Solution Types
                        </CardTitle>
                        <CardDescription>Market classification</CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[250px] flex items-center justify-center p-4">
                        {solutions.length > 0 ? (
                            <div className="w-full h-[200px]">
                                <Bar
                                    data={{
                                        labels: ['SIEM', 'SOC Platform', 'Log Mgmt', 'Other'],
                                        datasets: [{
                                            label: 'Count',
                                            data: [
                                                solutions.filter(s => s.methodType?.includes('SIEM')).length,
                                                solutions.filter(s => s.methodType?.includes('Platform')).length,
                                                solutions.filter(s => s.methodType?.includes('Log')).length,
                                                solutions.filter(s => !s.methodType?.match(/SIEM|Platform|Log/)).length
                                            ],
                                            backgroundColor: ['#10b981', '#f59e0b', '#ec4899', '#94a3b8'],
                                            borderRadius: 4
                                        }]
                                    }}
                                    options={{
                                        indexAxis: 'y',
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: { x: { grid: { display: false } }, y: { grid: { display: false } } }
                                    }}
                                />
                            </div>
                        ) : <div className="text-muted-foreground">No data</div>}
                    </CardContent>
                </Card>

                {/* 3. Licensing Models (Pie) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CreditCard className="text-purple-500" size={18} />
                            Licensing Models
                        </CardTitle>
                        <CardDescription>Cost structure breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[250px] flex items-center justify-center p-4">
                        {solutions.length > 0 ? (
                            <div className="w-full h-[200px]">
                                <Pie
                                    data={{
                                        labels: ['Ingest', 'Endpoint', 'User', 'Other'],
                                        datasets: [{
                                            data: [
                                                solutions.filter(s => s.licenseInfo?.includes('Ingest')).length,
                                                solutions.filter(s => s.licenseInfo?.includes('Endpoint')).length,
                                                solutions.filter(s => s.licenseInfo?.includes('User') || s.licenseInfo?.includes('Employee')).length,
                                                solutions.filter(s => !s.licenseInfo?.match(/Ingest|Endpoint|User|Employee/)).length
                                            ],
                                            backgroundColor: ['#6366f1', '#f43f5e', '#14b8a6', '#94a3b8'],
                                            borderWidth: 0
                                        }]
                                    }}
                                    options={{
                                        maintainAspectRatio: false,
                                        plugins: { legend: { position: 'right', labels: { boxWidth: 10, usePointStyle: true } } }
                                    }}
                                />
                            </div>
                        ) : <div className="text-muted-foreground">No data</div>}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

                {/* 3. Recent Activity / Feed */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Solutions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {solutions.slice(-5).reverse().map((sol, i) => (
                                <div key={sol.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                            {sol.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{sol.name}</div>
                                            <div className="text-xs text-muted-foreground">{new Date(sol.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8" asChild>
                                        <Link to={`/assess/${sol.id}`}><ArrowRight size={14} /></Link>
                                    </Button>
                                </div>
                            ))}
                            {solutions.length === 0 && (
                                <div className="p-6 text-center text-muted-foreground text-sm">No recent activity</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Detailed Leaderboard */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Leaderboard</h2>
                        <Button variant="link" size="sm" asChild>
                            <Link to="/compare">View Detailed Comparison</Link>
                        </Button>
                    </div>

                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto -mx-0">
                            <table className="w-full text-sm text-left min-w-[500px]">
                                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
                                    <tr>
                                        <th className="px-4 md:px-6 py-3 md:py-4 w-[50px] md:w-[60px] text-center">Rank</th>
                                        <th className="px-4 md:px-6 py-3 md:py-4">Solution</th>
                                        <th className="px-4 md:px-6 py-3 md:py-4 hidden sm:table-cell">Deployment</th>
                                        <th className="px-4 md:px-6 py-3 md:py-4 text-center">Score</th>
                                        <th className="px-4 md:px-6 py-3 md:py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {rankings.slice(0, 5).map((sol, idx) => (
                                        <tr key={sol.solutionId} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                                                <div className={`
                                                    inline-flex cursor-default items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                                                    ${idx === 0 ? 'bg-amber-100 text-amber-700' :
                                                        idx === 1 ? 'bg-slate-100 text-slate-700' :
                                                            idx === 2 ? 'bg-orange-100 text-orange-700' : 'text-muted-foreground'}
                                                `}>
                                                    {idx + 1}
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 font-medium">
                                                {sol.solutionName}
                                                <div className="text-xs text-muted-foreground font-normal">{sol.vendor}</div>
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                                                <Badge variant="outline" className="font-normal text-xs">
                                                    {sol.metrics?.deploymentType || 'N/A'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                                                <span className={`font-bold ${sol.overallScore >= 4 ? 'text-emerald-600' :
                                                    sol.overallScore >= 3 ? 'text-blue-600' : 'text-amber-600'
                                                    }`}>
                                                    {sol.overallScore.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                                                <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                                                    <Link to={`/assess/${sol.solutionId}`}>View</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {rankings.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                                                No rankings available yet. Start an assessment.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
