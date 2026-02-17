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
import { Download } from 'lucide-react';
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
            const colors = [
                { border: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' },
                { border: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
                { border: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
                { border: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
                { border: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' },
                { border: '#EC4899', bg: 'rgba(236, 72, 153, 0.15)' },
                { border: '#14B8A6', bg: 'rgba(20, 184, 166, 0.15)' },
                { border: '#F97316', bg: 'rgba(249, 115, 22, 0.15)' }
            ];
            const color = colors[idx % colors.length];

            return {
                label: sol.solutionName,
                data: categories.map(cat => sol.categoryScores?.find(c => c.category === cat)?.score || 0),
                borderColor: color.border,
                backgroundColor: color.bg,
                borderWidth: 2,
                pointBackgroundColor: color.border,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
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
        plugins: {
            legend: {
                display: true,
                position: 'right',
                labels: {
                    color: '#64748b', // Slate-500
                    font: { size: 10, family: "'Outfit', sans-serif" },
                    padding: 10,
                    boxWidth: 12,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            title: {
                display: true,
                text: 'Efficiency Radar',
                color: '#0f172a', // Slate-900
                font: { size: 14, weight: '700', family: "'Outfit', sans-serif" },
                padding: { bottom: 15 },
                align: 'start'
            }
        },
        scales: {
            r: {
                beginAtZero: true,
                max: 5,
                ticks: {
                    stepSize: 1,
                    color: '#64748b',
                    backdropColor: 'transparent',
                    font: { size: 9 }
                },
                grid: { color: 'rgba(100, 116, 139, 0.2)', lineWidth: 1 },
                angleLines: { color: 'rgba(100, 116, 139, 0.2)', lineWidth: 1 },
                pointLabels: {
                    color: '#475569',
                    font: { size: 9, weight: '600' }
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
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {rankings.map((sol, idx) => {
                        const rankColors = [
                            'bg-blue-100 text-blue-700',
                            'bg-emerald-100 text-emerald-700',
                            'bg-amber-100 text-amber-700',
                            'bg-orange-100 text-orange-700',
                            'bg-red-100 text-red-700',
                            'bg-purple-100 text-purple-700',
                            'bg-pink-100 text-pink-700',
                            'bg-teal-100 text-teal-700'
                        ];
                        return (
                            <div key={idx} className="relative bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all group">
                                {/* Rank Badge */}
                                <div className={`absolute -top-2 left-1/2 -translate-x-1/2 ${rankColors[idx % rankColors.length]} text-[10px] font-bold px-2 py-0.5 rounded-full border border-current shadow-sm flex items-center gap-1`}>
                                    <span className="opacity-75">#</span>
                                    <span>{idx + 1}</span>
                                </div>

                                {/* Solution Name */}
                                <div className="text-xs text-muted-foreground font-medium mt-3 mb-1 truncate text-center leading-tight h-6 flex items-center justify-center" title={sol.solutionName}>
                                    {sol.solutionName}
                                </div>

                                {/* Score */}
                                <div className="text-2xl font-black text-foreground text-center tabular-nums tracking-tight">
                                    {sol.overallScore.toFixed(2)}
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
