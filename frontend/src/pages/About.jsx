import React from 'react';
import { Shield, CheckCircle, AlertCircle, Info, Hash } from 'lucide-react';

const About = () => {
    return (
        <div className="pb-12 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-black text-foreground tracking-tight mb-3">
                    Methodology & Framework Guide
                </h1>
                <p className="text-xl text-muted-foreground w-full max-w-3xl">
                    Transparency is the foundation of trust. Here is how SOCBench evaluates, scores, and ranks SOC solutions.
                </p>
            </div>

            {/* Section 1: Overview */}
            <section className="mb-12">
                <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Shield className="text-primary" />
                        Framework Overview
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        SOCBench is a standardized benchmarking framework designed to objectively evaluate Security Operations Center (SOC) solutions.
                        It moves beyond marketing claims to test capabilities against real-world scenarios, theoretical architecture compliance, and
                        operational efficiency.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                            <h3 className="font-bold text-foreground mb-2">Objective Scoring</h3>
                            <p className="text-sm text-muted-foreground">Every score is derived from a predefined rubric, minimizing subjective bias.</p>
                        </div>
                        <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                            <h3 className="font-bold text-foreground mb-2">Multi-Dimensional</h3>
                            <p className="text-sm text-muted-foreground">We evaluate across 8 distinct categories, from pure detection speed to cost efficiency.</p>
                        </div>
                        <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                            <h3 className="font-bold text-foreground mb-2">Transparent Weights</h3>
                            <p className="text-sm text-muted-foreground">Category weights are clearly defined, ensuring the final ranking reflects balanced priorities.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Calculation Methodology */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">How We Calculate Scores</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* The Formula */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Hash className="text-emerald-500" size={20} />
                            The Algorithm
                        </h3>
                        <p className="text-muted-foreground mb-4 text-sm">
                            The final <span className="font-mono font-bold text-primary">Overall Score</span> is a weighted average of the 8 category scores.
                        </p>
                        <div className="bg-background p-4 rounded-lg border border-border font-mono text-xs md:text-sm text-muted-foreground overflow-x-auto">
                            Overall = Σ (CategoryScore_i × Weight_i) / Σ Weights
                        </div>
                        <div className="mt-6">
                            <h4 className="font-semibold text-foreground text-sm mb-2">Evaluation Categories:</h4>
                            <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>Threat Detection</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>Response Capabilities</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>Architecture</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>Compliance</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>User Experience</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>Cost Efficiency</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>Integration</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>Scalability</li>
                            </ul>
                        </div>
                    </div>

                    {/* The 1-5 Scale */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Info className="text-blue-500" size={20} />
                            The 1-5 Scoring Scale
                        </h3>
                        <div className="space-y-3">
                            {[
                                { score: 5, label: "Excellent / Industry Leader", desc: "Exceeds all requirements. Native capabilities with no friction. Fully automated." },
                                { score: 4, label: "Good / Strong Performer", desc: "Meets all requirements effectively. Minor manual steps or configuration needed." },
                                { score: 3, label: "Average / Functional", desc: "Meets basic requirements. Significant manual effort or third-party reliance." },
                                { score: 2, label: "Poor / Limited", desc: "Missing key features or requires heavy customization to function." },
                                { score: 1, label: "Critical Failure / Absent", desc: "Capability does not exist or fails to work entirely." }
                            ].map((level) => (
                                <div key={level.score} className="flex items-start gap-3 p-2 rounded hover:bg-secondary/30 transition-colors">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 
                                        ${level.score >= 4 ? 'bg-emerald-100 text-emerald-700' :
                                            level.score === 3 ? 'bg-blue-100 text-blue-700' :
                                                level.score === 2 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                        {level.score}
                                    </div>
                                    <div>
                                        <div className="font-bold text-foreground text-sm">{level.label}</div>
                                        <div className="text-xs text-muted-foreground">{level.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Criteria Rubric Table */}
            <section>
                <h2 className="text-2xl font-bold text-foreground mb-6">Detailed Scoring Rubric</h2>
                <div className="overflow-hidden border border-border rounded-xl shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="p-4 w-1/4">Category</th>
                                <th className="p-4 w-1/4">Score 1 (Poor)</th>
                                <th className="p-4 w-1/4">Score 3 (Average)</th>
                                <th className="p-4 w-1/4">Score 5 (Excellent)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            {[
                                {
                                    cat: "Threat Detection",
                                    s1: "Misses basic signature-based attacks. High false positive rate (>10%).",
                                    s3: "Detects known threats. Some behavioral analysis. Manageable false positives.",
                                    s5: "Real-time AI/ML detection of 0-days. Context-aware. Near-zero false positives."
                                },
                                {
                                    cat: "Response Speed",
                                    s1: "Manual only. No playbooks. Response time > 24 hours.",
                                    s3: "Basic automated actions (block IP). Response time < 4 hours.",
                                    s5: "Full SOAR capabilities. Autonomous remediation. Response time < 5 minutes."
                                },
                                {
                                    cat: "Ease of Use",
                                    s1: "Requires complex CLI, proprietary query languages, and weeks of training.",
                                    s3: "Functional UI but cluttered. Basic documentation available.",
                                    s5: "Intuitive, modern UI. NLP querying (ask in English). One-click drill-downs."
                                },
                                {
                                    cat: "Scalability",
                                    s1: "Performance degrades significantly with <10GB daily logs.",
                                    s3: "Scales horizontally with manual effort. Handles standard enterprise loads.",
                                    s5: "Cloud-native infinite scale. Zero latency impact at petabyte scale."
                                }
                            ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-secondary/10 transition-colors">
                                    <td className="p-4 font-bold text-foreground">{row.cat}</td>
                                    <td className="p-4 text-muted-foreground bg-red-50/30 dark:bg-red-900/10 border-r border-border/50">{row.s1}</td>
                                    <td className="p-4 text-muted-foreground bg-blue-50/30 dark:bg-blue-900/10 border-r border-border/50">{row.s3}</td>
                                    <td className="p-4 text-muted-foreground bg-emerald-50/30 dark:bg-emerald-900/10">{row.s5}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default About;
