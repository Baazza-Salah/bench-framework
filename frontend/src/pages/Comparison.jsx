import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Radar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    RadialLinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Download, Trophy, Medal } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    RadialLinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Comparison = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoveredSolution, setHoveredSolution] = useState(null);

    useEffect(() => {
        axios.get('/api/compare')
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const exportPDF = async () => {
        const element = document.getElementById('report-content');
        const exportBtn = document.getElementById('export-btn');

        // Temporarily hide button
        if (exportBtn) exportBtn.style.display = 'none';

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff', // White background for professional report
                logging: false,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`SOC-Benchmark-Report-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("PDF Export failed:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            // Restore button
            if (exportBtn) exportBtn.style.display = 'flex';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh] text-slate-400 text-lg">
            Analyzing benchmarking data...
        </div>
    );

    if (!data || !data.rankings || data.rankings.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-center">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">No Assessment Data</h2>
                    <p className="text-slate-400">Complete solution assessments to generate comparison.</p>
                </div>
            </div>
        );
    }

    const rankings = data.rankings;
    const categoryAverages = data.categoryAverages || {};
    const categories = Object.keys(categoryAverages);

    // Radar Chart - All solutions comparison
    const radarChartData = {
        labels: categories,
        datasets: rankings.map((sol, idx) => {
            const isHovered = hoveredSolution === idx;
            const isDimmed = hoveredSolution !== null && !isHovered;

            const colors = [
                { border: '#3B82F6', bg: 'rgba(59, 130, 246, 0.2)' },
                { border: '#10B981', bg: 'rgba(16, 185, 129, 0.2)' },
                { border: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)' },
                { border: '#EF4444', bg: 'rgba(239, 68, 68, 0.2)' },
                { border: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.2)' },
                { border: '#EC4899', bg: 'rgba(236, 72, 153, 0.2)' },
                { border: '#14B8A6', bg: 'rgba(20, 184, 166, 0.2)' },
                { border: '#F97316', bg: 'rgba(249, 115, 22, 0.2)' }
            ];
            const color = colors[idx % colors.length];

            // Adjust opacity based on hover state
            const borderColor = isDimmed ? 'rgba(200, 200, 200, 0.1)' : color.border;
            const backgroundColor = isDimmed ? 'rgba(200, 200, 200, 0.05)' : (isHovered ? color.bg.replace('0.2', '0.4') : color.bg);
            const borderWidth = isHovered ? 4 : (isDimmed ? 1 : 3);
            const pointRadius = isHovered ? 6 : (isDimmed ? 0 : 4);

            return {
                label: sol.solutionName,
                data: categories.map(cat => sol.categoryScores?.find(c => c.category === cat)?.score || 0),
                borderColor: borderColor,
                backgroundColor: backgroundColor,
                borderWidth: borderWidth,
                pointBackgroundColor: isDimmed ? 'transparent' : '#fff',
                pointBorderColor: borderColor,
                pointBorderWidth: 2,
                pointHoverBackgroundColor: color.border,
                pointHoverBorderColor: '#fff',
                pointRadius: pointRadius,
                pointHoverRadius: 8,
                fill: true,
                tension: 0.4,
                order: isHovered ? 1 : 2 // Bring hovered to front
            };
        })
    };

    // Pie Chart - MITRE Coverage Distribution
    const mitreData = rankings.map(r => r.metrics?.mitreCoverage ? parseFloat(r.metrics.mitreCoverage.replace('%', '')) : 0);
    const pieChartData = {
        labels: rankings.map(r => r.solutionName),
        datasets: [{
            data: mitreData,
            backgroundColor: [
                '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                '#EC4899', '#14B8A6', '#F97316', '#6366F1'
            ],
            borderWidth: 3,
            borderColor: '#0a1628'
        }]
    };

    // Grouped Bar Chart - Category Breakdown
    const groupedBarData = {
        labels: categories,
        datasets: rankings.map((sol, idx) => {
            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
            return {
                label: sol.solutionName,
                data: categories.map(cat => sol.categoryScores?.find(c => c.category === cat)?.score || 0),
                backgroundColor: colors[idx % colors.length],
                borderRadius: 4,
                borderWidth: 0
            };
        })
    };

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onHover: (event, chartElement) => {
            if (chartElement.length) {
                setHoveredSolution(chartElement[0].datasetIndex);
            } else {
                setHoveredSolution(null);
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'right',
                onHover: (event, legendItem) => {
                    setHoveredSolution(legendItem.datasetIndex);
                },
                onLeave: () => {
                    setHoveredSolution(null);
                },
                labels: {
                    color: '#64748b', // Slate-500
                    font: { size: 11, family: "'Outfit', sans-serif" },
                    padding: 15,
                    boxWidth: 10,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            title: {
                display: true,
                text: 'Efficiency Radar',
                color: '#0f172a', // Slate-900
                font: { size: 16, weight: '700', family: "'Outfit', sans-serif" },
                padding: { bottom: 20 },
                align: 'start'
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f8fafc',
                bodyColor: '#e2e8f0',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                padding: 10,
                boxPadding: 4,
                cornerRadius: 8,
                titleFont: { family: "'Outfit', sans-serif", size: 13 },
                bodyFont: { family: "'Outfit', sans-serif", size: 12 }
            }
        },
        scales: {
            r: {
                beginAtZero: true,
                max: 5,
                ticks: {
                    display: false, // Hide numeric ticks for cleaner look
                    stepSize: 1,
                    count: 6
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                    circular: true, // Circular grid for modern look
                    lineWidth: 1
                },
                angleLines: {
                    color: 'rgba(148, 163, 184, 0.15)',
                    lineWidth: 1
                },
                pointLabels: {
                    color: '#475569',
                    font: { size: 11, weight: '600', family: "'Outfit', sans-serif" },
                    backdropColor: 'transparent',
                    padding: 10
                }
            }
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.label}: ${context.parsed}%`
                },
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#0f172a',
                bodyColor: '#334155',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 10,
                displayColors: true,
                usePointStyle: true
            }
        },
        cutout: '70%',
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#64748b',
                    font: { size: 10, family: "'Outfit', sans-serif" },
                    padding: 10,
                    boxWidth: 12,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            title: {
                display: true,
                text: 'Category Breakdown',
                color: '#0f172a',
                font: { size: 14, weight: '700', family: "'Outfit', sans-serif" },
                padding: { bottom: 15 },
                align: 'start'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 5,
                grid: { color: '#e2e8f0' /* Slate-200 */ },
                ticks: { color: '#64748b', font: { size: 10 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { size: 9 }, maxRotation: 45, minRotation: 45 }
            }
        }
    };

    return (
        <div className="pb-12" id="report-content">
            {/* Header with Export */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Benchmark Analysis</h1>
                    <p className="text-muted-foreground mt-1">Comparative assessment of SOC solutions.</p>
                </div>
                <button
                    id="export-btn"
                    onClick={exportPDF}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-2 text-sm font-medium"
                >
                    <Download size={16} />
                    Export PDF
                </button>
            </div>

            <div className="space-y-6">
                {/* Top: Ranked Solution Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    {rankings.map((sol, idx) => {
                        const isHovered = hoveredSolution === idx;
                        const isDimmed = hoveredSolution !== null && !isHovered;

                        // Rank styling configuration
                        let cardBg = "bg-card";
                        let borderColor = "border-border";
                        let rankBadgeClass = "bg-slate-100/80 text-slate-500 border-slate-200";
                        let rankIcon = <span className="text-[10px] font-bold">#{idx + 1}</span>;
                        let shadowClass = "shadow-sm hover:shadow-md";
                        let scoreColor = "text-foreground";

                        if (idx === 0) { // Gold
                            cardBg = "bg-gradient-to-b from-yellow-50/50 to-amber-50/50";
                            borderColor = "border-amber-200/60";
                            rankBadgeClass = "bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700 border-amber-200 shadow-sm";
                            rankIcon = <Trophy size={11} className="text-amber-600 fill-amber-600" />;
                            shadowClass = "shadow-md hover:shadow-xl hover:shadow-amber-100/50";
                            scoreColor = "text-amber-700";
                        } else if (idx === 1) { // Silver
                            cardBg = "bg-gradient-to-b from-slate-50/50 to-gray-50/50";
                            borderColor = "border-slate-200/60";
                            rankBadgeClass = "bg-gradient-to-r from-slate-100 to-gray-200 text-slate-700 border-slate-300 shadow-sm";
                            rankIcon = <Medal size={11} className="text-slate-500 fill-slate-500" />;
                            shadowClass = "shadow hover:shadow-lg hover:shadow-slate-100/50";
                            scoreColor = "text-slate-700";
                        } else if (idx === 2) { // Bronze
                            cardBg = "bg-gradient-to-b from-orange-50/50 to-rose-50/50";
                            borderColor = "border-orange-200/60";
                            rankBadgeClass = "bg-gradient-to-r from-orange-100 to-rose-100 text-orange-800 border-orange-200 shadow-sm";
                            rankIcon = <Medal size={11} className="text-orange-700 fill-orange-700" />;
                            shadowClass = "shadow hover:shadow-lg hover:shadow-orange-100/50";
                            scoreColor = "text-orange-800";
                        }

                        // Dynamic interaction styles
                        const activeClass = isHovered
                            ? `ring-2 ring-primary ring-offset-2 scale-105 z-10 -translate-y-1 ${shadowClass}`
                            : (isDimmed ? "opacity-40 blur-[1px] grayscale scale-95" : `hover:-translate-y-1 hover:scale-105 ${shadowClass}`);

                        return (
                            <div
                                key={idx}
                                className={`relative rounded-xl border ${borderColor} ${cardBg} p-3 transition-all duration-300 cursor-default group flex flex-col justify-between overflow-hidden ${activeClass}`}
                                onMouseEnter={() => setHoveredSolution(idx)}
                                onMouseLeave={() => setHoveredSolution(null)}
                            >
                                {/* Active Indicator Bar */}
                                <div className={`absolute top-0 left-0 w-full h-0.5 ${isHovered ? 'bg-primary' : 'bg-transparent'} transition-colors duration-300`}></div>

                                {/* Header: Rank & Status */}
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${rankBadgeClass}`}>
                                        {rankIcon}
                                        {idx > 2 && rankIcon}
                                    </div>
                                    {/* Winner crown or shine for #1 */}
                                    {idx === 0 && <div className="text-amber-400 animate-pulse"><img src="/trophy-icon-placeholder" alt="" className="w-0 h-0" /><span className="text-[10px]">👑</span></div>}
                                </div>

                                {/* Solution Name */}
                                <div className="text-center mt-1 mb-3 px-1">
                                    <div className={`text-[10px] uppercase font-bold tracking-wider leading-tight line-clamp-2 h-7 flex items-center justify-center ${isHovered ? 'text-primary' : 'text-slate-600'}`} title={sol.solutionName}>
                                        {sol.solutionName}
                                    </div>
                                </div>

                                {/* Score & Visuals */}
                                <div className="mt-auto bg-white/50 rounded-lg p-2 border border-black/5">
                                    <div className="flex items-baseline justify-between mb-1.5">
                                        <span className="text-[9px] text-muted-foreground font-semibold uppercase">Score</span>
                                        <span className={`text-xl font-black tracking-tight ${scoreColor}`}>
                                            {sol.overallScore.toFixed(1)}
                                        </span>
                                    </div>

                                    {/* Mini Progress Bar */}
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ease-out ${idx === 0 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : (idx === 1 ? 'bg-slate-400' : (idx === 2 ? 'bg-orange-400' : 'bg-primary'))}`}
                                            style={{ width: `${(sol.overallScore / 5) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Middle: Radar + Pie */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Radar Chart */}
                    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                        <div className="h-[400px]">
                            <Radar data={radarChartData} options={radarOptions} />
                        </div>
                    </div>

                    {/* Pie Chart + Legend Table */}
                    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                        <h2 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2 uppercase tracking-wide">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            MITRE Coverage Distribution
                        </h2>
                        <div className="grid grid-cols-5 gap-6">
                            {/* Pie Chart */}
                            <div className="col-span-2 flex items-center justify-center">
                                <div className="w-full h-[320px] relative">
                                    <Doughnut data={pieChartData} options={pieOptions} />
                                    {/* Center Text */}
                                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                        <span className="text-3xl font-bold text-foreground">{rankings.length}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase font-medium">Solutions</span>
                                    </div>
                                </div>
                            </div>

                            {/* Legend Table */}
                            <div className="col-span-3 flex flex-col justify-center">
                                <div className="space-y-1">
                                    <div className="grid grid-cols-2 gap-x-4 text-[10px] font-bold text-muted-foreground pb-2 border-b border-border uppercase tracking-wider">
                                        <div>Solution</div>
                                        <div className="text-right">MITRE %</div>
                                    </div>
                                    {rankings.map((sol, idx) => {
                                        const colors = [
                                            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                                            '#EC4899', '#14B8A6', '#F97316', '#6366F1'
                                        ];
                                        return (
                                            <div key={idx} className="grid grid-cols-2 gap-x-4 text-xs py-1.5 hover:bg-secondary/50 rounded transition-colors items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors[idx] }}></div>
                                                    <span className="text-foreground truncate text-[11px] font-medium">{sol.solutionName}</span>
                                                </div>
                                                <div className="text-right font-mono font-bold text-xs text-muted-foreground">
                                                    {sol.metrics?.mitreCoverage || 'N/A'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom: Grouped Bar Chart */}
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                    <div className="h-[350px]">
                        <Bar data={groupedBarData} options={barOptions} />
                    </div>
                </div>

                {/* Best In Class Grid (Winner Cards) */}
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2 uppercase tracking-wide">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        Category Top Performers
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {categories.map(cat => {
                            let maxScore = -1;
                            let winner = null;
                            let winnerIdx = 0;

                            rankings.forEach((r, idx) => {
                                const score = r.categoryScores?.find(c => c.category === cat)?.score || 0;
                                if (score > maxScore) {
                                    maxScore = score;
                                    winner = r;
                                    winnerIdx = idx;
                                }
                            });

                            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
                            const color = colors[winnerIdx % colors.length];

                            return (
                                <div key={cat} className="relative bg-background border border-border rounded-lg p-4 flex flex-col justify-between hover:border-primary/50 transition-colors group">
                                    <div className="absolute top-0 left-0 w-1 h-full rounded-l-lg" style={{ backgroundColor: color }}></div>

                                    <div className="flex justify-between items-start mb-2 pl-3">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{cat}</span>
                                        <Trophy size={14} className="text-amber-500 opacity-80" />
                                    </div>

                                    <div className="pl-3">
                                        <div className="text-sm font-bold text-foreground truncate" title={winner?.solutionName}>
                                            {winner?.solutionName || 'N/A'}
                                        </div>
                                        <div className="flex items-end gap-2 mt-1">
                                            <span className="text-2xl font-black tabular-nums tracking-tight" style={{ color: color }}>
                                                {maxScore.toFixed(1)}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-medium mb-1.5">/ 5.0</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom: Scoring Matrix */}
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">Key Scoring Matrix</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="py-3 px-4 text-left text-muted-foreground font-bold text-[10px] uppercase tracking-wider">Solution</th>
                                    {categories.map(cat => (
                                        <th key={cat} className="py-3 px-2 text-center text-muted-foreground font-bold text-[9px] uppercase tracking-wider">
                                            {cat}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rankings.map((sol, idx) => (
                                    <tr key={idx} className="border-b border-border hover:bg-secondary/30 transition-colors">
                                        <td className="py-3 px-4 text-foreground font-semibold text-xs">{sol.solutionName}</td>
                                        {categories.map(cat => {
                                            const score = sol.categoryScores?.find(c => c.category === cat)?.score || 0;
                                            const colorClass = score >= 4 ? 'text-emerald-600' :
                                                score >= 3 ? 'text-blue-600' :
                                                    score >= 2 ? 'text-amber-600' : 'text-red-600';
                                            return (
                                                <td key={cat} className={`py-3 px-2 text-center font-mono font-bold ${colorClass} text-xs`}>
                                                    {score.toFixed(1)}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Comparison;
